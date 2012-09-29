var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

// @discussion: http://dev.w3.org/html5/spec/the-body-element.html
exports.body = {
    attrs: _.extend({}, common.attrs, {
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
    context: ['html'] // TODO: must be second child of html element
};

// @discussion: http://dev.w3.org/html5/spec/the-section-element.html
exports.section = {
    attrs: common.attrs,
    content: models.flow,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-nav-element.html
exports.nav = {
    attrs: common.attrs,
    content: models.flow,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-article-element.html
exports.article = {
    attrs: common.attrs,
    content: models.flow,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-aside-element.html
exports.aside = {
    attrs: common.attrs,
    content: models.flow,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-aside-element.html#the-h1,-h2,-h3,-h4,-h5,-and-h6-elements
exports.h1 = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-aside-element.html#the-h1,-h2,-h3,-h4,-h5,-and-h6-elements
exports.h2 = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-aside-element.html#the-h1,-h2,-h3,-h4,-h5,-and-h6-elements
exports.h3 = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-aside-element.html#the-h1,-h2,-h3,-h4,-h5,-and-h6-elements
exports.h4 = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-aside-element.html#the-h1,-h2,-h3,-h4,-h5,-and-h6-elements
exports.h5 = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-aside-element.html#the-h1,-h2,-h3,-h4,-h5,-and-h6-elements
exports.h6 = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-hgroup-element.html
exports.hgroup = {
    attrs: common.attrs,
    content: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-header-element.html
exports.header = {
    attrs: common.attrs,
    content: _.difference(models.flow, ['header', 'footer']),
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-footer-element.html
exports.footer = {
    attrs: common.attrs,
    content: _.difference(models.flow, ['header', 'footer']),
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-address-element.html
exports.address = {
    attrs: common.attrs,
    content: _.difference(models.flow, _.union(models.heading, models.sectioning, ['header', 'footer', 'address'])),
    context: null
};
