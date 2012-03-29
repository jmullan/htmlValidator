var _ = require('underscore'),
    utils = require('./utils'),
    errors = require('../errors');

// @discussion: http://dev.w3.org/html5/spec/tree-construction.html#the-before-html-insertion-mode
exports.mode = function (token) {
    var element;

    if (typeof token === 'string') {
        if (utils.whitespaceIgnore.test(token)) {
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
        this.insertElement(token);
        return;
    case 'StartTag':
        if (token.name === 'html') {
            // TODO: duplicate of "Anything else" below?
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
    this.mode = 'before head';
    this['before head'](token);
};
