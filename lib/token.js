var _ = require('underscore'),
    elements = require('./elements').elements,
    errors = require('./errors');

exports.Token = function (token) {
    this.errors = [];

    this.name = token.name || '';
    this.attributes = token.attributes || [];
    this.content = token.content || null;
    this.context = token.context || null;
    this.line = token.line || null;
    this.rules = null;

    if (!elements.hasOwnProperty(this.name)) {
        this.errors.push(new errors.InvalidElement(this));
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
                this.errors.push(new errors.AttributeMissing(this, rule));
            }
        }.bind(this));

        _.each(this.attributes, this._validateAttribute.bind(this));
        this._validateContent();
        this._validateContext();
    },

    _validateAttribute: function (value, key, rule) {
        if (!this.rules.attrs.hasOwnProperty(value.attr)) {
            this.errors.push(new errors.AttributeUnknown(this, value));
            return;
        }

        if (!this.rules.attrs[value.attr].type(value.val)) {
            this.errors.push(new errors.InvalidAttribute(this, value));
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
            for (i = 0; i < l; i += 1) {
                if (contentRule.indexOf(this.content[i]) === -1) {
                    this.errors.push(new errors.InvalidContent(this, null, this.content[i]));
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
                this.errors.push(new errors.InvalidContext(this));
            }
        }
    }
};
