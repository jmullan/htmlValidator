var _ = require('underscore'),
    utils = require('./utils'),
    errors = require('../errors');

// @discussion: http://dev.w3.org/html5/spec/tree-construction.html#the-before-head-insertion-mode
exports.mode = function (token) {
    if (typeof token === 'string' && utils.whitespaceIgnore.test(token)) {
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
};
