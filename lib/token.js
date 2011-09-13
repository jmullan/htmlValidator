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

        var rules = elements[this.token.name];

        _.each(rules.attrs, function (rule, attr) {
            if (rule.required && !this.token.attributes.hasOwnProperty(attr)) {
                this.errors.push('Element "' + this.token.name + '" on line ' + this.token.line + ' missing required attribute "' + attr + '".');
            }
        }.bind(this));

        _.each(this.token.attributes, function (value, key) {
            if (!rules.attrs.hasOwnProperty(key)) {
                this.errors.push('Element "' + this.token.name + '" on line ' + this.token.line + ' includes unknown attribute "' + key + '".');
                return;
            }

            if (!rules.attrs[key].type(value)) {
                this.errors.push('Attribute "' + key + '" value "' + value + '" is invalid for element "' + this.token.name + '" on line ' + this.token.line +  '.');
            }
        }.bind(this));
    },

    _validateAttribute: function () {

    },

    _validateContent: function () {

    },

    _validateContext: function () {

    }
};
