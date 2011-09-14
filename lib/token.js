var _ = require('underscore'),
    elements = require('./elements').elements;

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
            this.errors.push('Element "' + this.token.name + '" on line ' + this.token.line + ' is not a valid element.');
            return;
        }

        this.rules = elements[this.token.name];

        _.each(this.rules.attrs, function (rule, attr) {
            if (rule.required && !this.token.attributes.hasOwnProperty(attr)) {
                this.errors.push('Element "' + this.token.name + '" on line ' + this.token.line + ' missing required attribute "' + attr + '".');
            }
        }.bind(this));

        _.each(this.token.attributes, this._validateAttribute.bind(this));
        this._validateContent();
    },

    _validateAttribute: function (value, key, rule) {
        if (!this.rules.attrs.hasOwnProperty(key)) {
            this.errors.push('Element "' + this.token.name + '" on line ' + this.token.line + ' includes unknown attribute "' + key + '".');
            return;
        }

        if (!this.rules.attrs[key].type(value)) {
            this.errors.push('Attribute "' + key + '" value "' + value + '" is invalid for element "' + this.token.name + '" on line ' + this.token.line +  '.');
        }
    },

    _validateContent: function () {
        if (Array.isArray(this.rules.content) && Array.isArray(this.token.content)) {
            var l = this.token.content.length,
                i = 0;
            for (; i < l; i += 1) {
                if (this.rules.content.indexOf(this.token.content[i]) === -1) {
                    this.errors.push('Element "' + this.token.name + '" must not have a child element "' + this.token.content[i] + '" on line ' + this.token.line + '.');
                }
            }
        }
    }
};
