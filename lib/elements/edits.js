var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    context = require('../context-models'),
    datatypes = require('../datatypes');

// @discussion: http://dev.w3.org/html5/spec/the-ins-element.html
exports.ins = {
    attrs: _.extend({}, common.attrs, {
        cite: { type: datatypes.URL },
        datetime: { type: datatypes.datetime }
    }),
    content: models.transparent,
    context: context.phrasingElseFlow
};

// @discussion: http://dev.w3.org/html5/spec/the-del-element.html
exports.del = {
    attrs: _.extend({}, common.attrs, {
        cite: { type: datatypes.URL },
        datetime: { type: datatypes.datetime }
    }),
    content: models.transparent,
    context: context.phrasingElseFlow
};
