var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

// @discussion: http://dev.w3.org/html5/spec/the-html-element.html
exports.html = {
    // TODO: required element
    attrs: _.extend({}, common.attrs, {
        manifest: { type: datatypes.URL }
    }),
    content: ['head', 'body'], // TODO: a head followed by body
    context: null // TODO: As the root element of a document. Wherever a subdocument fragment is allowed in a compound document.
};
