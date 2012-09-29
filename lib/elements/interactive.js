var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

// @discussion: http://dev.w3.org/html5/spec/the-details-element.html
exports.details = {
    attrs: _.extend({}, common.attrs, {
        open: { type: ['open', null] }
    }),
    content: _.union(['summary'], models.flow), // TODO: one summary element followed by flow content
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-summary-element.html
exports.summary = {
    attrs: common.attrs,
    content: models.phrasing,
    context: ['details'] // TODO: must be first-child of details element
};

// @discussion: http://dev.w3.org/html5/spec/the-command-element.html
exports.command = {
    attrs: _.extend({}, common.attrs, {
        type: { type: ['command', 'checkbox', 'radio'] },
        label: { type: datatypes.string },
        icon: { type: datatypes.URL },
        disabled: { type: ['disabled', null] },
        checked: { type: ['checked', null] },
        radiogroup: { type: datatypes.string }, // TODO: The attribute must be omitted unless the type attribute is in the Radio state.
    }),
    content: null,
    context: _.union(models.metadata, models.phrasing) // TODO: there isn't a metadata content model?
};

// @discussion: http://dev.w3.org/html5/spec/the-menu-element.html
exports.menu = {
    attrs: _.extend({}, common.attrs, {
        type: { type: ['context', 'toolbar'] },
        label: { type: datatypes.string }
    }),
    content: function (token) {
        if (_.indexOf(token.content, 'li') !== -1) {
            return ['li'];
        }
        return models.flow;
    },
    context: null
};
