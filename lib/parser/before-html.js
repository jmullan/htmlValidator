var _ = require('underscore'),
    utils = require('./utils'),
    errors = require('../errors');

// @discussion: http://dev.w3.org/html5/spec/tree-construction.html#the-before-html-insertion-mode

function fallback(token) {
    var element = this.insertElement({ name: 'html', type: 'StartTag' });
    this.documentNode.push(element);
    this.mode = 'before head';
    this.process('before head', token);
}

exports.string = function (token) {
    if (utils.whitespaceIgnore.test(token)) {
        return;
    }
    this.errors.push(new errors.ParseError(token));
};

exports.doctype = function (token) {
    this.errors.push(new errors.ParseError(token));
};

exports.comment = function (token) {
    this.insertElement(token);
};

exports.start = function (token) {
    var element;
    if (token.name === 'html') {
        // TODO: duplicate of "Anything else" below?
        element = this.insertElement(token);
        this.documentNode.push(element);
        this.mode = 'before head';
        return;
    }
    fallback.call(this, token);
};

exports.end = function (token) {
    if (!(/^(head|body|html|br)$/).test(token.name)) {
        this.errors.push(new errors.ParseError(token));
        return;
    }
    fallback.call(this, token);
};

exports.fallback = fallback;
