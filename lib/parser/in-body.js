var _ = require('underscore'),
    utils = require('./utils'),
    errors = require('../errors');

// @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-inbody
function fallback(token) {

}

function checkElementPInButtonScope() {
    // TODO: If the stack of open elements has a p element in button scope, then act as if an end tag with the tag name "p" had been seen. http://dev.w3.org/html5/spec/parsing.html#has-an-element-in-button-scope
    // FIXME: Should we actually be doing this? Should it throw a warning?
    if (this.hasElementInScope('p', ['button'])) {
        this.process('in body', { type: 'EndTag', name: 'p' });
    }
}

function mergeAttributes(from, to) {
    _.each(from.attributes, function (attr) {
        var inAttrs = _.find(to.attributes, function (attribute) {
            return attr.name === attribute.name;
        });
        if (!inAttrs) {
            to.attributes.push(attr);
        }
    });
}

function endPreviousElements(tags) {
    var node = _.last(this.stack),
        endToken = { name: node.name, type: 'EndTag' },
        i = 0;
    if (_.include(tags, node.name)) {
        this.process('in body', endToken);
    } else {
        i = 0;
        while (_.include(tags, node.name)) {
            i += 1;
            if (_.include(_.without(utils.special, 'address', 'div', 'p'), node.name)) {
                break;
            }
            node = _.last(this.stack, i)[0];
        }
        if (_.include(tags, node.name)) {
            this.process('in body', endToken);
        }
    }
}

exports.string = function (token) {
    if ((/\0/).test(token)) {
        this.errors.push(new errors.ParseError(token));
        return;
    }

    this.reconstructActiveFormatting();
    this.insertElement(token);

    if (!utils.whitespaceIgnore.test(token)) {
        this.flags['frameset-ok'] = false;
    }
};

exports.start = function (token) {
    var element;

    if ('html' === token.name) {
        this.errors.push(new errors.ParseError(token));
        if (!this.stack.length || !token.attributes || !token.attributes.length) {
            return;
        }

        mergeAttributes(token, this.stack[0]);
        return;
    }

    if (_.include(['base', 'basefont', 'bgsound', 'command', 'link', 'meta', 'noframes', 'script', 'style', 'title'], token.name)) {
        this.process('in head', token);
        this.mode = 'in body';
        return;
    }

    if ('body' === token.name) {
        this.errors.push(new errors.ParseError(token));
        if (this.stack.length !== 1 || this.stack[1].name === 'body') {
            mergeAttributes(token, this.stack[1]);
            this.flags['frameset-ok'] = false;
        }
        return;
    }

    if ('frameset' === token.name) {
        this.errors.push(new errors.ParseError(token));
        if (!this.flags['frameset-ok']) {
            return;
        }
        // TODO: frameset when frameset-ok is "ok"
        return;
    }

    if (_.include(['address', 'article', 'aside', 'blockquote', 'center', 'details', 'dir', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'header', 'hgroup', 'menu', 'nav', 'ol', 'p', 'section', 'summary', 'ul'], token.name)) {
        checkElementPInButtonScope.call(this);
        this.insertElement(token);
        return;
    }

    if ((/^h[1-6]$/).test(token.name)) {
        checkElementPInButtonScope.call(this);
        if ((/^h[1-6]$/).test(_.last(this.stack).name)) {
            this.errors.push(new errors.ParseError(token));
            this.stack.pop();
        }

        this.insertElement(token);
        return;
    }

    if (_.include(['pre', 'listing'], token.name)) {
        checkElementPInButtonScope.call(this);
        this.insertElement(token);
        this.ignoreNextLF = true;
        this.flags['frameset-ok'] = false;
        return;
    }

    if ('form' === token.name) {
        if (this.pointers.form) {
            this.errors.push(new errors.ParseError(token));
            return;
        }
        checkElementPInButtonScope.call(this);
        element = this.insertElement(token);
        this.pointers.form = element;
        return;
    }

    if ('li' === token.name) {
        this.flags['frameset-ok'] = false;
        endPreviousElements.call(this, ['li']);
        checkElementPInButtonScope.call(this);
        this.insertElement(token);
        return;
    }

    if ('dd' === token.name || 'dt' === token.name) {
        this.flags['frameset-ok'] = false;
        endPreviousElements.call(this, ['dd', 'dt']);
        checkElementPInButtonScope.call(this);
        this.insertElement(token);
        return;
    }

    if ('plaintext' === token.name) {
        checkElementPInButtonScope.call(this);
        this.insertElement(token);
        // TODO: switch the tokenizer to the PLAINTEXT state http://dev.w3.org/html5/spec/tokenization.html#plaintext-state
        return;
    }

    if ('button' === token.name) {
        if (this.hasElementInScope('button')) {
            this.errors.push(new errors.ParseError(token));
            return;
        }

        this.reconstructActiveFormatting();
        this.insertElement(token);
        this.flags['frameset-ok'] = false;
    }
};

exports.end = function (token) {
    var element, node;

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

    if (_.include(['address', 'article', 'aside', 'blockquote', 'button', 'center', 'details', 'dir', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'header', 'hgroup', 'listing', 'menu', 'nav', 'ol', 'pre', 'section', 'summary', 'ul'], token.name)) {
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
        if (!this.hasElementInScope('p', ['button'])) {
            this.errors.push(new errors.ParseError(token));
            this.process('in body', { type: 'StartTag', name: 'p' });
        }
        this.generateImplied(token.name);
        if (_.last(this.stack).name !== token.name) {
            this.errors.push(new errors.ParseError(token));
        }
        while (_.last(this.stack).name !== token.name) {
            this.stack.pop();
        }
        this.stack.pop();
        return;
    }

    if ('li' === token.name) {
        if (!this.hasElementInScope('li', ['ol', 'ul'])) {
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
        this.stack.pop();
        return;
    }

    if ('dd' === token.name || 'dt' === token.name) {
        if (!this.hasElementInScope(token.name)) {
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
        this.stack.pop();
        return;
    }
};

exports.fallback = fallback;
