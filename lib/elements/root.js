var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

// TODO: required element
exports.html = {
    attr: _.extend(common.attrs, {
        manifest: { type: datatypes.URL }
    }),
    content: ['head', 'body'], // TODO: a head followed by body
    contexts: null // TODO: As the root element of a document. Wherever a subdocument fragment is allowed in a compound document.
};
