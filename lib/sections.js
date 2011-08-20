var _ = require('underscore'),
    common = require('common'),
    datatypes = require('datatypes');

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
    categories: ['root'],
    inner: _.extend(common.inner.flow),
    contexts: { elements: 'html', child: 2 },
    model: 'flow'
};

exports.section = {
    attrs: _.extend(common.attrs, {}),
    categories: ['flow', 'sectioning'],
    contexts: 'flow',
    model: 'flow'
};

exports.nav = {
    attrs: _.extend(common.attrs, {}),
    categories: ['flow', 'sectioning'],
    contexts: 'flow',
    model: 'flow'
};

exports.article = {
    attrs: _.extend(common.attrs, {}),
    categories: ['flow', 'sectioning'],
    contexts: 'flow',
    model: 'flow'
};

exports.aside = {
    attrs: _.extend(common.attrs, {}),
    categories: ['flow', 'sectioning'],
    contexts: 'flow',
    model: 'flow'
};

exports.h1 = {
    attrs: _.extend(common.attrs, {}),
    categories: ['flow', 'sectioning'],
    contexts: { models: 'flow', elements: 'hgroup' },
    model: 'phrasing'
};

exports.h2 = {
    attrs: _.extend(common.attrs, {}),
    categories: ['flow', 'sectioning'],
    contexts: { models: 'flow', elements: 'hgroup' },
    model: 'phrasing'
};

exports.h3 = {
    attrs: _.extend(common.attrs, {}),
    categories: ['flow', 'sectioning'],
    contexts: { models: 'flow', elements: 'hgroup' },
    model: 'phrasing'
};

exports.h4 = {
    attrs: _.extend(common.attrs, {}),
    categories: ['flow', 'sectioning'],
    contexts: { models: 'flow', elements: 'hgroup' },
    model: 'phrasing'
};

exports.h5 = {
    attrs: _.extend(common.attrs, {}),
    categories: ['flow', 'sectioning'],
    contexts: { models: 'flow', elements: 'hgroup' },
    model: 'phrasing'
};

exports.h6 = {
    attrs: _.extend(common.attrs, {}),
    categories: ['flow', 'heading'],
    contexts: { models: 'flow', elements: 'hgroup' },
    model: 'phrasing'
};

exports.hgroup = {
    attrs: _.extend(common.attrs, {}),
    categories: ['flow', 'heading'],
    contexts: 'flow',
    model: { elements: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }
};
