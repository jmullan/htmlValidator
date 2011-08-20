var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

exports.details = {
    attrs: _.extend(common.attrs, {
        open: { type: ['open', null] }
    }),
    content: _.union(['summary'], models.flow), // TODO: one summary element followed by flow content
    contexts: models.flow
};

exports.summary = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: ['details'] // TODO: must be first-child of details element
};

exports.command = {
    attrs: _.extend(common.attrs, {
        type: { type: ['command', 'checkbox', 'radio'] },
        label: { type: datatypes.string },
        icon: { type: datatypes.URL },
        disabled: { type: ['disabled', null] },
        checked: { type: ['checked', null] },
        radiogroup: { type: datatypes.string }, // TODO: The attribute must be omitted unless the type attribute is in the Radio state.
    }),
    content: null,
    contexts: _.union(models.metadata, models.phrasing) // TODO: there isn't a metadata content model?
};

exports.menu = {
    attrs: _.extend(common.attrs, {
        type: { type: ['context', 'toolbar'] },
        label: { type: datatypes.string }
    }),
    content: ['li'], // TODO: Either: Zero or more li elements. Or: Flow content.
    contexts: models.flow
};
