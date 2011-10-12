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
    return 'Element "' + token.name + '" must not be the child of element "' + context.name + '" on line ' + token.line + '.';
}

exports.Token = function (token) {
    this.errors = [];

    this.name = token.name || '';
    this.attributes = token.attributes || [];
    this.content = token.content || null;
    this.context = token.context || null;
    this.line = token.line || null;
    this.rules = null;

    if (!elements.hasOwnProperty(this.name)) {
        this.errors.push(InvalidElementError(this));
    } else {
        this.rules = elements[this.name];
    }
};

exports.Token.prototype = {
    validate: function () {
        if (!this.rules) {
            return;
        }

        _.each(this.rules.attrs, function (rule, attr) {
            if (rule.required && !this.attributes.hasOwnProperty(attr)) {
                this.errors.push(AttributeMissingError(this, attr));
            }
        }.bind(this));

        _.each(this.attributes, this._validateAttribute.bind(this));
        this._validateContent();
        this._validateContext();
    },

    _validateAttribute: function (value, key, rule) {
        if (!this.rules.attrs.hasOwnProperty(value.attr)) {
            this.errors.push(AttributeUnknownError(this, value.attr));
            return;
        }

        if (!this.rules.attrs[value.attr].type(value.val)) {
            this.errors.push(InvalidAttributeError(this, value.attr, value.val));
        }
    },

    _validateContent: function () {
        var contentRule = this.rules.content,
            l,
            i;

        if (typeof contentRule === 'function') {
            contentRule = contentRule(this);
        }

        if (_.isArray(contentRule) && _.isArray(this.content)) {
            l = this.content.length;
            i = 0;
            for (; i < l; i += 1) {
                if (contentRule.indexOf(this.content[i]) === -1) {
                    this.errors.push(InvalidContentError(this, this.content[i]));
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
            contextRule = contextRule(this, this.context);
        }

        if (_.isArray(contextRule) && this.context !== null) {
            if (_.indexOf(contextRule, this.context.name) === -1) {
                this.errors.push(InvalidContextError(this, this.context));
            }
        }
    }
};
