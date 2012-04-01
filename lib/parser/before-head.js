var _ = require('underscore'),
    utils = require('./utils'),
    errors = require('../errors');

// @discussion: http://dev.w3.org/html5/spec/tree-construction.html#the-before-head-insertion-mode

function fallback(token) {
    this.process('before head', { type: 'StartTag', name: 'head'});
    this.process('in head', token);
}

exports.string = function (token) {
    if (utils.whitespaceIgnore.test(token)) {
        return;
    }
    fallback.call(this, token);
};

exports.start = function (token) {
    var element;
    if (token.name === 'html') {
        this.process('in body', token);
        return;
    }
    if (token.name === 'head') {
        element = this.insertElement(token);
        this.pointers.head = element;
        this.mode = 'in head';
        return;
    }
    fallback.call(this, token);
};

exports.end = function (token) {
    var element;
    if ((/^(head|body|html|br)$/).test(token.name)) {
        element = this.insertElement({ name: 'head', type: 'StartTag' });
        this.pointers.head = element;
        this.mode = 'in head';
        this.process('in head', token);
        return;
    }
    this.errors.push(new errors.ParseError(token));
};

exports.fallback = fallback;
