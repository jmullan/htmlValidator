var _ = require('underscore'),
    HTMLTokenizer = require('./HTMLTokenizer').HTMLTokenizer,
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
        if (typeof token === 'string') {
            if (whitespaceIgnore.test(token)) {
                return;
            }
        }
        this[this.mode](token);
    }, this);
}
Tree.prototype = {
    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#the-initial-insertion-mode
    initial: function (token) {
        if (typeof token === 'string') {
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
        if (typeof token === 'string') {
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
                this.documentNode.push(token);
                this.stack.push(token);
                this.mode = 'before head';
            }
            return;
        case 'EndTag':
            if ((/^(head|body|html|br)$/).test(token.name)) {
                this.errors.push(new errors.ParseError(token));
            }
            return;
        }

        this.documentNode.push(token);
        this.stack.push(token);
        this.mode = 'before head';
        this['before head'](token);
    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#the-before-head-insertion-mode
    'before head': function (token) {
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
                this.documentNode.push(token);
                this.stack.push(token);
                this.pointers.head = token;
                this.mode = 'in head';
            }
            return;
        case 'EndTag':
            if ((/^(head|body|html|br)$/).test(token.name)) {
                this.documentNode.push({ name: 'head', type: 'StartTag' });
                this.stack.push({ name: 'head', type: 'StartTag' });
                this.pointers.head = token;
                this.mode = 'in head';
                this['in head'](token);
            }
            return;
        }

        this.errors.push(new errors.ParseError(token));
    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-inhead
    'in head': function (token) {

    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-inheadnoscript
    'in head noscript': function (token) {

    },

    // @discussion: http://dev.w3.org/html5/spec/tree-construction.html#the-after-head-insertion-mode
    'after head': function (token) {

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
