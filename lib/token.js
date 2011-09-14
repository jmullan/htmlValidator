var _ = require('underscore'),
    elements = require('./elements').elements;

exports.Token = function (token) {
    this.errors = [];
    this.valid = true;

    this.token = _.extend({
        name: '',
        attributes: [],
        content: null,
        context: null,
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

    },

    _validateContext: function () {

    }
};
