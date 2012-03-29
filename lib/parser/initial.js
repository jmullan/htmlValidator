var _ = require('underscore'),
    utils = require('./utils'),
    errors = require('../errors');

// @discussion: http://dev.w3.org/html5/spec/tree-construction.html#the-initial-insertion-mode
exports.mode = function (token) {
    if (typeof token === 'string') {
        if (utils.whitespaceIgnore.test(token)) {
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
        if (token.name !== 'html') {
            // TODO: (HTML < 5 doctype support)
            // or the token's public identifier is not missing, or the token's system identifier is neither missing nor a case-sensitive match for the string "about:legacy-compat", and none of the sets of conditions in the following list are matched, then there is a parse error.
            this.errors.push(new errors.ParserError(token));
        }
        // TODO: validate DOCTYPE http://dev.w3.org/html5/spec/tree-construction.html#the-initial-insertion-mode
        break;
    }
    this.mode = 'before html';
};
