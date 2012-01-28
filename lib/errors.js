var _ = require('underscore');

exports.InvalidElement = function (token) {
    this.token = _.clone(token);
    this.message = 'Element "' + token.name + '" is not a valid element.';
    this.line = token.line;
};

exports.AttributeMissing = function (token, attr) {
    this.token = _.clone(token);
    this.message = 'Element "' + token.name + '" is missing required attribute "' + attr.attr + '".';
    this.line = token.line;
};

exports.AttributeUnknown = function (token, attr) {
    this.token = _.clone(token);
    this.message = 'Element "' + token.name + '" includes unknown attribute "' + attr.attr + '".';
    this.line = token.line;
};

exports.InvalidAttribute = function (token, attr) {
    this.token = _.clone(token);
    this.message = 'Element "' + token.name + '" has invalid value "' + attr.value + '" for attribute "' + attr.attr + '".';
    this.line = token.line;
};

exports.InvalidContent = function (token, attr, contentElement) {
    this.token = _.clone(token);
    this.message = 'Element "' + token.name + '" must not have a child element "' + contentElement + '".';
    this.line = token.line;
};

exports.InvalidContext = function (token) {
    this.token = _.clone(token);
    this.message = 'Element "' + token.name + '" must not be the child of element "' + token.context.name + '".';
    this.line = token.line;
};

exports.OnlyOneAllowed = function (token, attr, contentElement) {
    this.token = _.clone(token);
    this.message = 'Element "' + token.name + '" cannot have more than one child element "' + contentElement + '".';
    this.line = token.line;
};

exports.ParseError = function (token) {
    this.token = _.clone(token);
    if (token.type === 'EndTag') {
        this.message = 'Unexpected end token "' + token.name + '".';
    } else {
        this.message = 'Unexpected token "' + token.name + '".';
    }
    this.line = token.line;
};
