var _ = require('underscore'),
    HTMLTokenizer = require('./HTMLTokenizer').HTMLTokenizer,
    Token = require('./token').Token,
    errors = require('./errors'),
    whitespaceIgnore = /(\t|\n|\r|\f| )/;

function Tree(input) {
    var tokenizer = new HTMLTokenizer(input);

    this.mode = 'initial';
    this.last = false;
    this.documentNode = [];
    this.stack = [];
    this.errors = [];

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
        var prev, element;
        if (typeof token === 'string') {
            prev = _.last(_.last(this.stack).content);
            if (typeof prev === 'string') {
                prev += token;
                return token;
            }
            _.last(this.stack).content.push(token);
            return;
        }

        element = this.createElement(token);
        _.last(this.stack).content.push(element);
        this.stack.push(element);
        return element;
    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#the-initial-insertion-mode
    initial: function (token) {
        if (typeof token === 'string') {
            if (typeof token === 'string') {
                if (whitespaceIgnore.test(token)) {
                    return;
                }
            }
            this['before html'](token);
        }

        switch (token.type) {
        case 'comment':
            this.documentNode.push(token);
            break;
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
            if (typeof token === 'string') {
                if (whitespaceIgnore.test(token)) {
                    return;
                }
            }
            throw new errors.ParseError(token);
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
                element = this.createElement(token);
                this.documentNode.push(element);
                this.stack.push(element);
                this.mode = 'before head';
            }
            return;
        case 'EndTag':
            if ((/^(head|body|html|br)$/).test(token.name)) {
                this.errors.push(new errors.ParseError(token));
            }
            return;
        }

        element = this.createElement(token);
        this.documentNode.push(element);
        this.stack.push(element);
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
            _.last(this.stack).content.push(token);
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
            return;
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
            if (token.name === 'head') {
                this.stack.pop();
                this.mode = 'after head';
            } else {
                this.errors.push(new errors.ParseError(token));
            }
            return;
        }

        if (token.type !== 'StartTag') {
            this.documentNode.push({ name: 'head', type: 'EndTag' });
            this.stack.pop();
            this.mode = 'after head';
            this['after head'](token);
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
            this.documentNode.push(token);
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
            // TODO: set the frameset-ok flag to "not ok"
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
