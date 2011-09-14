var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/semantics.html#the-html-element
exports.html = {
    // TODO: required element
    attrs: _.extend({}, common.attrs, {
        manifest: { type: datatypes.URL }
    }),
    content: ['head', 'body'], // TODO: a head followed by body
};
