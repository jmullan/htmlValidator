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
    contexts: ['html'], // TODO: must be second child of html element
    model: models.flow
};

exports.section = {
    attrs: common.attrs,
    contexts: models.flow,
    model: models.flow
};

exports.nav = {
    attrs: common.attrs,
    contexts: models.flow,
    model: models.flow
};

exports.article = {
    attrs: common.attrs,
    contexts: models.flow,
    model: models.flow
};

exports.aside = {
    attrs: common.attrs,
    contexts: models.flow,
    model: models.flow
};

exports.h1 = {
    attrs: common.attrs,
    contexts: _.union(models.flow, ['hgroup']),
    model: models.phrasing
};

exports.h2 = {
    attrs: common.attrs,
    contexts: _.union(models.flow, ['hgroup']),
    model: models.phrasing
};

exports.h3 = {
    attrs: common.attrs,
    contexts: _.union(models.flow, ['hgroup']),
    model: models.phrasing
};

exports.h4 = {
    attrs: common.attrs,
    contexts: _.union(models.flow, ['hgroup']),
    model: models.phrasing
};

exports.h5 = {
    attrs: common.attrs,
    contexts: _.union(models.flow, ['hgroup']),
    model: models.phrasing
};

exports.h6 = {
    attrs: common.attrs,
    contexts: _.union(models.flow, ['hgroup']),
    model: models.phrasing
};

exports.hgroup = {
    attrs: common.attrs,
    contexts: models.flow,
    model: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
};

exports.header = {
    attr: common.attrs,
    contexts: models.flow,
    model: _.difference(models.flow, ['header', 'footer'])
};

exports.footer = {
    attr: common.attrs,
    contexts: models.flow,
    model: _.difference(models.flow, ['header', 'footer'])
};

exports.address = {
    attr: common.attrs,
    contexts: models.flow,
    model: _.difference(models.flow, _.union(models.heading, models.sectioning, ['header', 'footer', 'address']))
};
