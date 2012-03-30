var _ = require('underscore'),
    util = require('util'),
    HTMLTokenizer = require('../HTMLTokenizer').HTMLTokenizer,
    Token = require('../token').Token,
    errors = require('../errors'),
    modes = {
        initial: require('./initial'),
        'before html': require('./before-html'),
        'before head': require('./before-head'),
        'in head': require('./in-head'),
        'in head noscript': require('./in-head-noscript'),
        'after head': require('./after-head'),
        'in body': require('./in-body'),
        text: require('./text'),
        'in table': require('./in-table'),
        'in table text': require('./in-table-text'),
        'in caption': require('./in-caption'),
        'in column group': require('./in-column-group'),
        'in table body': require('./in-table-body'),
        'in row': require('./in-row'),
        'in cell': require('./in-cell'),
        'in select': require('./in-select'),
        'in select in table': require('./in-select-in-table'),
        'after body': require('./after-body'),
        'in frameset': require('./in-frameset'),
        'after frameset': require('./after-frameset'),
        'after after body': require('./after-after-body'),
        'after after frameset': require('./after-after-frameset')
    };

function Tree(input) {
    var tokenizer = new HTMLTokenizer(input);

    this.mode = 'initial';
    this.documentMode = 'quirks mode';
    this.last = false;
    this.documentNode = [];
    this.stack = [];
    this.errors = [];
    this.activeFormatting = [];
    this.ignoreNextLF = false;

    this.pointers = {};
    this.flags = {
        // TODO: test
        // TODO: this may not be necessary. Controls whether to ignore frameset after Parse Errors
        'frameset-ok': true
    };

    while (!tokenizer.EOF()) {
        tokenizer.nextToken();
    }

    _.each(tokenizer.tokens, function (token, index) {
        if (typeof token === 'string' && this.ignoreNextLF && (/\n/).test(token)) {
            this.ignoreNextLF = false;
            return;
        }
        this.process(this.mode, token);
    }, this);

    if (this.mode === 'in body' && this.stack.length &&
            _.difference(
                _.pluck(this.stack, 'name'),
                ['dd', 'dt', 'li', 'p', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'body', 'html']
            ).length) {
        this.errors.push(new errors.ParseError({ type: 'EOF' }));
    }
}
Tree.prototype = {
    createElement: function (token) {
        if (token.type === 'comment') {
            return token;
        }
        return new Token(token);
    },

    insertElement: function (token) {
        if (!token) {
            return;
        }
        var len = this.stack.length,
            prev = this.stack.pop(),
            prevcontent,
            element;
        if (typeof token === 'string') {
            if (!len) {
                this.stack.push(prev);
                this.stack.push(token);
                return token;
            }

            if (prev && typeof prev === 'string') {
                this.stack.push(prev + token);
                return token;
            }

            if (prev && typeof _.last(prev.content) === 'string') {
                prevcontent = prev.content.pop();
                prev.content.push(prevcontent + token);
                this.stack.push(prev);
                return token;
            }
            prev.content.push(token);
            this.stack.push(prev);
            return token;
        }

        element = this.createElement(token);
        if (prev && prev.hasOwnProperty('content') && typeof prev !== 'string') {
            prev.content.push(element);
            this.stack.push(prev);
        } else if (prev) {
            this.stack.push(prev);
        }
        if (token.type !== 'comment') {
            this.stack.push(element);
        }
        return element;
    },

    genericRawTextElement: function (token) {
        this.insertElement(token);
        // TODO: If the algorithm that was invoked is the generic raw text element parsing algorithm, switch the tokenizer to the RAWTEXT state; otherwise the algorithm invoked was the generic RCDATA element parsing algorithm, switch the tokenizer to the RCDATA state.
        // Let the original insertion mode be the current insertion mode.
        // Then, switch the insertion mode to "text".
    },

    hasElementInScope: function (target, includes) {
        // FIXME: These are supposed to be in specific namespaces
        var list = _.union([
                // HTML Namespace
                'applet',
                'caption',
                'html',
                'table',
                'td',
                'th',
                'marquee',
                'object',
                // MathML Namespace
                'mi',
                'mo',
                'mn',
                'ms',
                'mtext',
                'annotation-xml',
                // SVG Namespace
                'foreignObject',
                'desc',
                'title'
            ], includes),
            i = this.stack.length,
            node;

        while (i) {
            i -= 1;
            node = this.stack[i];
            if (node.name === target) {
                return true;
            }
            if (_.include(list, node.name)) {
                return false;
            }
        }

        // Safeguard. This should actually never happen, as 'html' should be the first item in the stack and terminate with false in the loop
        return false;
    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#generate-implied-end-tags
    generateImplied: function (except) {
        var implied = _.without(['dd', 'dt', 'li', 'option', 'optgroup', 'p', 'rp', 'rt'], except),
            last = _.last(this.stack);

        while (_.include(implied, last.name)) {
            this.stack.pop();
            last = _.last(this.stack);
        }
    },

    // @discussion: http://dev.w3.org/html5/spec/parsing.html#list-of-active-formatting-elements
    reconstructActiveFormatting: function () {
        // TODO: this probably requires a unit test
        var self = this,
            entry = _.last(this.activeFormatting),
            len = this.activeFormatting.length;
        if (!len || entry.hasOwnProperty('marker') || _.find(this.stack, entry)) {
            return;
        }

        len -= 1;
        while (!entry.hasOwnProperty('marker') && !_.find(this.stack, entry)) {
            len -= 1;
            entry = this.activeFormatting[len];
        }

        function createAndContinue(entry) {
            var element = self.createElement(entry);
            _.last(self.stack).content.push(element);
            self.stack.push(element);
            self.activeFormatting[len] = element;
            if (len + 1 !== self.activeFormatting.length) {
                len += 1;
                createAndContinue(self.activeFormatting[len]);
            }
        }
        createAndContinue(entry);
    },

    process: function (mode, token) {
        if (!modes.hasOwnProperty(mode)) {
            throw 'Unsupported parsing mode ' + mode;
        }
        mode = modes[mode];
        if ('string' === typeof token) {
            return mode.string.call(this, token);
        }
        switch (token.type) {
        case 'comment':
            mode.comment.call(this, token);
            return;
        case 'DOCTYPE':
            mode.doctype.call(this, token);
            return;
        case 'StartTag':
            mode.start.call(this, token);
            return;
        case 'EndTag':
            mode.end.call(this, token);
            return;
        }
        mode.fallback.call(this, token);
    }
};
exports.Tree = Tree;
