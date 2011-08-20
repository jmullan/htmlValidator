var _ = require('underscore'),
    common = require('./common'),
    models = require('./content-models'),
    datatypes = require('./datatypes');

exports.body = {
    attrs: _.extend(common.attrs, {
        onafterprint: { type: datatypes.string },
        onbeforeprint: { type: datatypes.string },
        onbeforeunload: { type: datatypes.string },
        onblur: { type: datatypes.string },
        onerror: { type: datatypes.string },
        onfocus: { type: datatypes.string },
        onhashchange: { type: datatypes.string },
        onload: { type: datatypes.string },
        onmessage: { type: datatypes.string },
        onoffline: { type: datatypes.string },
        ononline: { type: datatypes.string },
        onpagehide: { type: datatypes.string },
        onpageshow: { type: datatypes.string },
        onpopstate: { type: datatypes.string },
        onredo: { type: datatypes.string },
        onresize: { type: datatypes.string },
        onscroll: { type: datatypes.string },
        onstorage: { type: datatypes.string },
        onundo: { type: datatypes.string },
        onunload: { type: datatypes.string }
    }),
    inner: _.extend(models.flow),
    content: models.flow,
    contexts: ['html'] // TODO: must be second child of html element
};

exports.section = {
    attrs: common.attrs,
    content: models.flow,
    contexts: models.flow
};

exports.nav = {
    attrs: common.attrs,
    content: models.flow,
    contexts: models.flow
};

exports.article = {
    attrs: common.attrs,
    content: models.flow,
    contexts: models.flow
};

exports.aside = {
    attrs: common.attrs,
    content: models.flow,
    contexts: models.flow
};

exports.h1 = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: _.union(models.flow, ['hgroup'])
};

exports.h2 = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: _.union(models.flow, ['hgroup'])
};

exports.h3 = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: _.union(models.flow, ['hgroup'])
};

exports.h4 = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: _.union(models.flow, ['hgroup'])
};

exports.h5 = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: _.union(models.flow, ['hgroup'])
};

exports.h6 = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: _.union(models.flow, ['hgroup'])
};

exports.hgroup = {
    attrs: common.attrs,
    content: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    contexts: models.flow
};

exports.header = {
    attr: common.attrs,
    content: _.difference(models.flow, ['header', 'footer']),
    contexts: models.flow
};

exports.footer = {
    attr: common.attrs,
    content: _.difference(models.flow, ['header', 'footer']),
    contexts: models.flow
};

exports.address = {
    attr: common.attrs,
    content: _.difference(models.flow, _.union(models.heading, models.sectioning, ['header', 'footer', 'address'])),
    contexts: models.flow
};
