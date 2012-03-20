var _ = require('underscore'),
    util = require('util'),
    HTMLTokenizer = require('./HTMLTokenizer').HTMLTokenizer,
    Token = require('./token').Token,
    errors = require('./errors'),
    whitespaceIgnore = /(\t|\n|\r|\f| )/,
    // @discussion: http://dev.w3.org/html5/spec/parsing.html#special
    special = ['address', 'applet', 'area', 'article', 'aside', 'base', 'basefont', 'bgsound', 'blockquote', 'body', 'br', 'button', 'caption', 'center', 'col', 'colgroup', 'command', 'dd', 'details', 'dir', 'div', 'dl', 'dt', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'iframe', 'img', 'input', 'isindex', 'li', 'link', 'listing', 'marquee', 'menu', 'meta', 'nav', 'noembed', 'noframes', 'noscript', 'object', 'ol', 'p', 'param', 'plaintext', 'pre', 'script', 'section', 'select', 'source', 'style', 'summary', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'title', 'tr', 'track', 'ul', 'wbr', 'xmp'];

function Tree(input) {
    var tokenizer = new HTMLTokenizer(input);

    this.mode = 'initial';
    this.last = false;
    this.documentNode = [];
    this.stack = [];
    this.errors = [];

    this.framesetOk = true; // TODO: this may not be necessary. Controls whether to ignore frameset after Parse Errors
    this.pointers = {};

    while (!tokenizer.EOF()) {
        tokenizer.nextToken();
    }

    _.each(tokenizer.tokens, function (token, index) {
        this[this.mode](token);
    }, this);
}
Tree.prototype = {
    createElement: function (token) {
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
        this.stack.push(element);
        return element;
    },

    hasElementInScope: function (target, includes) {
        // FIXME: These are supposed to be in specific namespaces
        var list = _.intersection([
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

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#the-initial-insertion-mode
    initial: function (token) {
        if (typeof token === 'string') {
            if (whitespaceIgnore.test(token)) {
                return;
            }
            this['before html'](token);
            return;
        }

        switch (token.type) {
        case 'comment':
            this.documentNode.push(token);
            return;
        case 'DOCTYPE':
            // TODO: validate DOCTYPE http://dev.w3.org/html5/spec/tree-construction.html#the-initial-insertion-mode
            break;
        }
        this.mode = 'before html';
    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#the-before-html-insertion-mode
    'before html': function (token) {
        var element;

        if (typeof token === 'string') {
            if (whitespaceIgnore.test(token)) {
                return;
            }
            this.errors.push(new errors.ParseError(token));
            return;
        }

        switch (token.type) {
        case 'DOCTYPE':
            this.errors.push(new errors.ParseError(token));
            return;
        case 'comment':
            this.documentNode.push(token);
            return;
        case 'StartTag':
            if (token.name === 'html') {
                // TODO: duplicate of "Anything else" below?
                // element = this.createElement(token);
                // this.documentNode.push(element);
                // this.stack.push(element);
                element = this.insertElement(token);
                this.documentNode.push(element);
                this.mode = 'before head';
                return;
            }
            break;
        case 'EndTag':
            if (!(/^(head|body|html|br)$/).test(token.name)) {
                this.errors.push(new errors.ParseError(token));
                return;
            }
            break;
        }

        // Anything else
        element = this.insertElement({ name: 'html', type: 'StartTag' });
        this.documentNode.push(element);
        // element = this.createElement(token);
        // this.documentNode.push(element);
        // this.stack.push(element);
        this.mode = 'before head';
        this['before head'](token);
    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#the-before-head-insertion-mode
    'before head': function (token) {
        if (typeof token === 'string' && whitespaceIgnore.test(token)) {
            return;
        }

        var element;

        switch (token.type) {
        case 'comment':
            this.documentNode.push(token);
            return;
        case 'DOCTYPE':
            this.errors.push(new errors.ParseError(token));
            return;
        case 'StartTag':
            if (token.name === 'html') {
                this['in body'](token);
            } else if (token.name === 'head') {
                element = this.insertElement(token);
                this.pointers.head = element;
                this.mode = 'in head';
            }
            return;
        case 'EndTag':
            if ((/^(head|body|html|br)$/).test(token.name)) {
                element = this.insertElement({ name: 'head', type: 'StartTag' });
                this.pointers.head = element;
                this.mode = 'in head';
                this['in head'](token);
            }
            break;
        }

        this.errors.push(new errors.ParseError(token));
    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-inhead
    'in head': function (token) {
        if (typeof token === 'string' && whitespaceIgnore.test(token)) {
            this.insertElement(token);
            return;
        }

        var element;

        switch (token.type) {
        case 'comment':
            this.documentNode.push(token);
            return;
        case 'DOCTYPE':
            this.errors.push(new errors.ParseError(token));
            return;
        case 'EndTag':
            if ((/^(head|body|html|br)$/).test(token.name)) {
                this.stack.pop();
                this.mode = 'after head';
            }
            if ((/^(body|html|br)$/).test(token.name)) {
                this[this.mode](token.name);
            }
            return;
        }

        if (token.type !== 'StartTag') {
            // this.documentNode.push({ name: 'head', type: 'EndTag' });
            this.stack.pop();
            this.mode = 'after head';
            this[this.mode](token);
            return;
        }

        switch (token.name) {
        case 'html':
            this['in body'](token);
            return;
        case 'base':
        case 'basefont':
        case 'bgsound':
        case 'command':
        case 'link':
            this.insertElement(token);
            this.stack.pop();
            return;
        case 'meta':
            this.insertElement(token);
            this.stack.pop();
            // TODO: If the element has a charset attribute, and its value is either a supported ASCII-compatible character encoding or a UTF-16 encoding, and the confidence is currently tentative, then change the encoding to the encoding given by the value of the charset attribute.
            // TODO: Otherwise, if the element has an http-equiv attribute whose value is an ASCII case-insensitive match for the string "Content-Type", and the element has a content attribute, and applying the algorithm for extracting an encoding from a meta element to that attribute's value returns a supported ASCII-compatible character encoding or a UTF-16 encoding, and the confidence is currently tentative, then change the encoding to the extracted encoding.
            return;
        case 'title':
            // FIXME: Follow the generic RCDATA element parsing algorithm. http://dev.w3.org/html5/spec/tree-construction.html#generic-rcdata-element-parsing-algorithm
            this.insertElement(token);
            // this.originalInsertionMode = this.mode;
            // this.mode = 'text'
            return;
        case 'noscript':
            // TODO: if scripting flag is enabled section
            this.insertElement(token);
            this.mode = 'in head noscript';
            return;
        case 'noframes':
        case 'style':
            // TODO: Follow the generic raw text element parsing algorithm. http://dev.w3.org/html5/spec/tree-construction.html#generic-raw-text-element-parsing-algorithm
            break;
        case 'script':
            // TODO: yeah....
            return;
        default:
            this.errors.push(new errors.ParseError(token));
            return;
        }
    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-inheadnoscript
    'in head noscript': function (token) {

    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#the-after-head-insertion-mode
    'after head': function (token) {
        if (typeof token === 'string' && whitespaceIgnore.test(token)) {
            this.insertElement(token);
            return;
        }

        var element;

        switch (token.type) {
        case 'comment':
            this.documentNode[0].content.push(token);
            return;
        case 'DOCTYPE':
            this.errors.push(new errors.ParseError(token));
            return;
        }

        if (token.type !== 'StartTag') {
            // FIXME: duplication in default below
            element = this.insertElement({ type: 'StartTag', name: 'body' });
            this.mode = 'in body';
            this['in body'](token);
        }

        switch (token.name) {
        case 'html':
            this['in body'](token);
            return;
        case 'body':
            this.insertElement(token);
            this.framesetOk = false;
            this.mode = 'in body';
            return;
        case 'frameset':
        case 'base':
        case 'basefont':
        case 'bgsound':
        case 'link':
        case 'meta':
        case 'noframes':
        case 'script':
        case 'style':
        case 'title':
            this.errors.push(new errors.ParseError(token));
            this.stack.push(this.pointers.head);
            this['in head'](token);
            this.stack.pop();
            return;
        case 'head':
            this.errors.push(new errors.ParseError(token));
            return;
        default:
            element = this.insertElement({ type: 'StartTag', name: 'body' });
            this.mode = 'in body';
            this['in body'](token);
            break;
        }
    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-inbody
    'in body': function (token) {
        if (typeof token === 'string') {
            if (!token) { // null character?
                return;
            }

            // FIXME: EOF
            // if (token === 'EOF') {
            //     if (this.stack.length && _.union(_.pluck(this.stack, 'name'), ['dd', 'dt', 'li', 'p', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'body', 'html']).length) {
            //         throw new errors.ParseError(token);
            //     }
            // }

            if (!whitespaceIgnore.test(token)) {
                this.framesetOk = false;
            }

            // TODO: reconstruct the active formatting elements http://dev.w3.org/html5/spec/parsing.html#reconstruct-the-active-formatting-elements
            this.insertElement(token);
        }

        var element, node, self = this;

        function checkElementPInButtonScope() {
            // TODO: If the stack of open elements has a p element in button scope, then act as if an end tag with the tag name "p" had been seen. http://dev.w3.org/html5/spec/parsing.html#has-an-element-in-button-scope
            // FIXME: Should we actually be doing this? Should it throw a warning?
            if (self.hasElementInScope('p', ['button'])) {
                self['in body']({ type: 'EndTag', name: 'p' });
            }
        }

        switch (token.type) {
        case 'comment':
            this.insertElement(token);
            return;
        case 'DOCTYPE':
            this.errors.push(new errors.ParseError(token));
            return;
        case 'StartTag':
            if ('html' === token.name) {
                this.errors.push(new errors.ParseError(token));
                // TODO: For each attribute on the token, check to see if the attribute is already present on the top element of the stack of open elements. If it is not, add the attribute and its corresponding value to that element.
                return;
            }

            if (_.include(['base', 'basefont', 'bgsound', 'command', 'link', 'meta', 'noframes', 'script', 'style', 'title'], token.name)) {
                this['in head'](token);
                this.mode = 'in body';
                return;
            }

            if ('body' === token.name) {
                this.errors.push(new errors.ParseError(token));
                if (this.stack.length !== 1 || this.stack[1].name === 'body') {
                    this.framesetOk = false;
                }
                return;
            }

            if ('frameset' === token.name) {
                this.errors.push(new errors.ParseError(token));
                if (!this.framesetOk) {
                    return;
                }
                return;
            }

            if (_.include(['address', 'article', 'aside', 'blockquote', 'center', 'details', 'dir', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'header', 'hgroup', 'menu', 'nav', 'ol', 'p', 'section', 'summary', 'ul'], token.name)) {
                checkElementPInButtonScope();
                this.insertElement(token);
                return;
            }

            if ((/^h[1-6]$/).test(token.name)) {
                checkElementPInButtonScope();
                if ((/^h[1-6]$/).test(_.last(this.stack).name)) {
                    this.errors.push(new errors.ParseError(token));
                    this.stack.pop();
                }

                this.insertElement(token);
                return;
            }

            if (_.include(['pre', 'listing'], token.name)) {
                checkElementPInButtonScope();
                this.insertElement(token);
                // TODO: ignore the next token if it is an LF character token
                this.framesetOk = false;
                return;
            }

            if ('form' === token.name) {
                if (this.pointers.form) {
                    this.errors.push(new errors.ParseError(token));
                    return;
                }
                checkElementPInButtonScope();
                element = this.insertElement(token);
                this.pointers.form = element;
                return;
            }

            if ('li' === token.name) {
                this.framsetOk = false;
                node = _.last(this.stack);
                while ('li' === node.name) {
                    this['in body']({ name: 'li', type: 'EndTag' });
                    if (_.include(_.without(special, 'address', 'div', 'p'), node.name)) {
                        continue;
                    }
                    node = _.last(this.stack);
                }
                checkElementPInButtonScope();
                this.insertElement(token);
                return;
            }

            if ('dd' !== token.name && 'dt' !== token.name) {
                this.framsetOk = false;
                node = _.last(this.stack);
                while ('dd' === node.name || 'dt' === node.name) {
                    this['in body']({ name: 'li', type: 'EndTag' });
                    if (_.include(_.without(special, 'address', 'div', 'p'), node.name)) {
                        continue;
                    }
                    node = _.last(this.stack);
                }
                checkElementPInButtonScope();
                this.insertElement(token);
                return;
            }

            if ('plaintext' === token.name) {
                checkElementPInButtonScope();
                this.insertElement(token);
                // TODO: switch the tokenizer to the PLAINTEXT state http://dev.w3.org/html5/spec/tokenization.html#plaintext-state
            }
            return;
        case 'EndTag':
            if ('body' === token.name) {
                if (!this.hasElementInScope('body')) {
                    this.errors.push(new errors.ParseError(token));
                    return;
                }

                _.each(this.stack, function (value, index) {
                    if (!_.include(['dd', 'dt', 'li', 'optgroup', 'option', 'p', 'rp', 'rt', 'tbody', 'td', 'tfoot', 'th', 'th', 'tr', 'body', 'html'], value.name)) {
                        this.errors.push(new errors.ParseError(token));
                    }
                }, this);
                this.mode = 'after body';
                // TODO: shouldn't this then pop from the stack?
                return;
            }

            if (_.include(['address', 'article', 'aside', 'blockquote', 'button', 'center', 'details', 'dir', 'div', 'dl', 'fieldset', 'figcaption', 'footer', 'header', 'hgroup', 'listing', 'menu', 'nav', 'ol', 'pre', 'section', 'summary', 'ul'], token.name)) {
                if (!this.hasElementInScope(token.name)) {
                    this.errors.push(new errors.ParseError(token));
                    return;
                } else {
                    this.generateImplied();
                    // If the current node is not an element with the same tag name as that of the token, then this is a parse error.
                    if (_.last(this.stack).name !== token.name) {
                        this.errors.push(new errors.ParseError(token));
                    }
                    // Pop elements from the stack of open elements until an element with the same tag name as the token has been popped from the stack.
                    while (_.last(this.stack).name !== token.name) {
                        this.stack.pop();
                    }
                    this.stack.pop();
                    return;
                }
            }

            if ('form' === token.name) {
                node = this.pointers.form;
                delete this.pointers.form;

                // FIXME: hasElementInScope should be a deep equal here across the whole node
                if (!node || !this.hasElementInScope(node.name)) {
                    this.errors.push(new errors.ParseError(token));
                    return;
                }

                this.generateImplied();
                if (_.last(this.stack) !== node) {
                    this.errors.push(new errors.ParseError(token));
                    return;
                }
                this.stack.pop();
                return;
            }

            // FIXME: duplication
            if ('p' === token.name) {
                if (!self.hasElementInScope('p', ['button'])) {
                    this.errors.push(new errors.ParseError(token));
                    this['in body']({ type: 'StartTag', name: 'p' });
                }
                this.generateImplied(token.name);
                if (_.last(this.stack).name !== token.name) {
                    this.errors.push(new errors.ParseError(token));
                }
                while (_.last(this.stack).name !== token.name) {
                    this.stack.pop();
                }
                return;
            }

            if ('li' === token.name) {
                if (!self.hasElementInScope('li', ['ol', 'ul'])) {
                    this.errors.push(new errors.ParseError(token));
                    return;
                }
                this.generateImplied(token.name);
                if (_.last(this.stack).name !== token.name) {
                    this.errors.push(new errors.ParseError(token));
                }
                while (_.last(this.stack).name !== token.name) {
                    this.stack.pop();
                }
                return;
            }

            if ('dd' === token.name || 'dt' === token.name) {
                if (!self.hasElementInScope(token.name)) {
                    this.errors.push(new errors.ParseError(token));
                    return;
                }
                this.generateImplied(token.name);
                if (_.last(this.stack).name !== token.name) {
                    this.errors.push(new errors.ParseError(token));
                }
                while (_.last(this.stack).name !== token.name) {
                    this.stack.pop();
                }
                return;
            }

            return;
        }
    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-incdata
    'text': function (token) {

    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-intable
    'in table': function (token) {

    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-intabletext
    'in table text': function (token) {

    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-incaption
    'in caption': function (token) {

    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-incolgroup
    'in column group': function (token) {

    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-intbody
    'in table body': function (token) {

    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-intr
    'in row': function (token) {

    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-intd
    'in cell': function (token) {

    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-inselect
    'in select': function (token) {

    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-inselectintable
    'in select in table': function (token) {

    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-afterbody
    'after body': function (token) {

    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-inframeset
    'in frameset': function (token) {

    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-afterframeset
    'after frameset': function (token) {

    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#the-after-after-body-insertion-mode
    'after after body': function (token) {

    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#the-after-after-frameset-insertion-mode
    'after after frameset': function (token) {

    }
};
exports.Tree = Tree;
