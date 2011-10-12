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

function InvalidContextError(token, context) {
    return 'Element "' + token.name + '" must not be the child of element "' + context.token.name + '" on line ' + token.line + '.';
}

exports.Token = function (token) {
    this.errors = [];

    this.token = _.extend({
        name: '',
        attributes: [],
        content: null,
        context: null,
        line: null
    }, token);

    this.rules = null;

    if (!elements.hasOwnProperty(this.token.name)) {
        this.errors.push(InvalidElementError(this.token));
    } else {
        this.rules = elements[this.token.name];
    }
};

exports.Token.prototype = {
    validate: function () {
        if (!this.rules) {
            return;
        }

        _.each(this.rules.attrs, function (rule, attr) {
            if (rule.required && !this.token.attributes.hasOwnProperty(attr)) {
                this.errors.push(AttributeMissingError(this.token, attr));
            }
        }.bind(this));

        _.each(this.token.attributes, this._validateAttribute.bind(this));
        this._validateContent();
        this._validateContext();
    },

    _validateAttribute: function (value, key, rule) {
        if (!this.rules.attrs.hasOwnProperty(value.attr)) {
            this.errors.push(AttributeUnknownError(this.token, value.attr));
            return;
        }

        if (!this.rules.attrs[value.attr].type(value.val)) {
            this.errors.push(InvalidAttributeError(this.token, value.attr, value.val));
        }
    },

    _validateContent: function () {
        var contentRule = this.rules.content,
            l,
            i;

        if (typeof contentRule === 'function') {
            contentRule = contentRule(this);
        }

        if (_.isArray(contentRule) && _.isArray(this.token.content)) {
            l = this.token.content.length;
            i = 0;
            for (; i < l; i += 1) {
                if (contentRule.indexOf(this.token.content[i]) === -1) {
                    this.errors.push(InvalidContentError(this.token, this.token.content[i]));
                }
            }
        }
    },

    _validateContext: function () {
        var contextRule = this.rules.context,
            i = 0,
            l;

        if (contextRule === null) {
            return;
        }

        if (typeof contextRule === 'function') {
            contextRule = contextRule(this, this.token.context);
        }

        if (_.isArray(contextRule) && this.token.context !== null) {
            if (_.indexOf(contextRule, this.token.context.name) === -1) {
                this.errors.push(InvalidContextError(this.token, this.token.context));
            }
        }
    }
};
