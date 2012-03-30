var _ = require('underscore'),
    utils = require('./utils'),
    errors = require('../errors');

// @discussion: http://dev.w3.org/html5/spec/tree-construction.html#the-after-head-insertion-mode
exports.mode = function (token) {
    if (typeof token === 'string' && utils.whitespaceIgnore.test(token)) {
        this.insertElement(token);
        return;
    }

    var element;

    switch (token.type) {
    case 'comment':
        this.insertElement(token);
        return;
    case 'DOCTYPE':
        this.errors.push(new errors.ParseError(token));
        return;
    }

    if (token.type !== 'StartTag') {
        // FIXME: duplication in default below
        element = this.insertElement({ type: 'StartTag', name: 'body' });
        this.mode = 'in body';
        this.flags['frameset-ok'] = false;
        this.process('in body', token);
    }

    switch (token.name) {
    case 'html':
        this.process('in body', token);
        return;
    case 'body':
        this.insertElement(token);
        this.flags['frameset-ok'] = false;
        this.mode = 'in body';
        return;
    case 'frameset':
        this.insertElement(token);
        this.mode = 'in frameset';
        return;
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
        this.process('in head', token);
        this.stack.pop();
        return;
    case 'head':
        this.errors.push(new errors.ParseError(token));
        return;
    default:
        element = this.insertElement({ type: 'StartTag', name: 'body' });
        this.mode = 'in body';
        this.process('in body', token);
        break;
    }
};
