var _ = require('underscore'),
    utils = require('./utils'),
    errors = require('../errors');

// @discussion: http://dev.w3.org/html5/spec/tree-construction.html#the-initial-insertion-mode

exports.string = function (token) {
    if (utils.whitespaceIgnore.test(token)) {
        return;
    }
    this.process('before html', token);
};

exports.comment = function (token) {
    this.documentNode.push(token);
};

exports.doctype = function (token) {
    if (token.name !== 'html') {
        // TODO: (HTML < 5 doctype support)
        // or the token's public identifier is not missing, or the token's system identifier is neither missing nor a case-sensitive match for the string "about:legacy-compat", and none of the sets of conditions in the following list are matched, then there is a parse error.
        this.errors.push(new errors.ParserError(token));
    }
    this.mode = 'before html';
};

function fallback(token) {
    this.mode = 'before html';
    this.process('before html', token);
}

exports.start = fallback;
exports.end = fallback;
exports.fallback = fallback;
