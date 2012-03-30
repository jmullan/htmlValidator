var _ = require('underscore'),
    utils = require('./utils'),
    errors = require('../errors');

// @discussion: http://dev.w3.org/html5/spec/tree-construction.html#parsing-main-inhead

function fallback(token) {
    this.stack.pop();
    this.mode = 'after head';
    this.process('after head', token);
}

exports.string = function (token) {
    if (utils.whitespaceIgnore.test(token)) {
        this.insertElement(token);
        return;
    }
    this.errors.push(new errors.ParseError(token));
};

exports.comment = function (token) {
    this.insertElement(token);
};

exports.doctype = function (token) {
    this.errors.push(new errors.ParseError(token));
};

exports.start = function (token) {
    switch (token.name) {
    case 'html':
        this.process('in body', token);
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
        this.genericRawTextElement(token);
        return;
    case 'script':
        // TODO: yeah....
        return;
    default:
        this.errors.push(new errors.ParseError(token));
        return;
    }
};

exports.end = function (token) {
    if ((/^(head|body|html|br)$/).test(token.name)) {
        this.stack.pop();
        this.mode = 'after head';
        if (token.name !== 'head') {
            this.process(this.mode, token);
        }
        return;
    }
    this.errors.push(new errors.ParseError(token));
};

exports.fallback = fallback;
