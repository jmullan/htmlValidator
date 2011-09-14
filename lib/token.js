var _ = require('underscore'),
    elements = require('./elements').elements;

function InvalidElementError(token) {
    return 'Element "' + token.name + '" on line ' + token.line + ' is not a valid element.';
}

function AttributeMissingError(token, attr) {
    return 'Element "' + token.name + '" on line ' + token.line + ' missing required attribute "' + attr + '".';
}

function AttributeUnknownError(token, attr) {
    return 'Element "' + token.name + '" on line ' + token.line + ' includes unknown attribute "' + attr + '".';
}

function InvalidAttributeError(token, attr, value) {
    return 'Attribute "' + attr + '" value "' + value + '" is invalid for element "' + token.name + '" on line ' + token.line +  '.';
}

function InvalidContentError(token, content) {
    return 'Element "' + token.name + '" must not have a child element "' + content + '" on line ' + token.line + '.';
}

exports.Token = function (token) {
    this.errors = [];
    this.valid = true;

    this.token = _.extend({
        name: '',
        attributes: [],
        content: null,
        line: null
    }, token);
};

exports.Token.prototype = {
    validate: function () {
        if (!elements.hasOwnProperty(this.token.name)) {
            this.errors.push(InvalidElementError(this.token));
            return;
        }

        this.rules = elements[this.token.name];

        _.each(this.rules.attrs, function (rule, attr) {
            if (rule.required && !this.token.attributes.hasOwnProperty(attr)) {
                this.errors.push(AttributeMissingError(this.token, attr));
            }
        }.bind(this));

        _.each(this.token.attributes, this._validateAttribute.bind(this));
        this._validateContent();
    },

    _validateAttribute: function (value, key, rule) {
        if (!this.rules.attrs.hasOwnProperty(key)) {
            this.errors.push(AttributeUnknownError(this.token, key));
            return;
        }

        if (!this.rules.attrs[key].type(value)) {
            this.errors.push(InvalidAttributeError(this.token, key, value));
        }
    },

    _validateContent: function () {
        if (Array.isArray(this.rules.content) && Array.isArray(this.token.content)) {
            var l = this.token.content.length,
                i = 0;
            for (; i < l; i += 1) {
                if (this.rules.content.indexOf(this.token.content[i]) === -1) {
                    this.errors.push(InvalidContentError(this.token, this.token.content[i]));
                }
            }
        }
    }
};
