var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/edits.html#the-ins-element
exports.ins = {
    attrs: _.extend({}, common.attrs, {
        cite: { type: datatypes.URL },
        datetime: { type: datatypes.datetime }
    }),
    content: models.transparent,
    context: function (token) {
        // When the element only contains phrasing content: where phrasing content is expected. Otherwise: where flow content is expected.
        if (token.content.length === 0 || _.difference(token.content, models.phrasing).length) {
            return models.flow;
        }
        return models.phrasing;
    }
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/edits.html#the-del-element
exports.del = {
    attrs: _.extend({}, common.attrs, {
        cite: { type: datatypes.URL },
        datetime: { type: datatypes.datetime }
    }),
    content: models.transparent,
    context: function (token) {
        // When the element only contains phrasing content: where phrasing content is expected. Otherwise: where flow content is expected.
        if (token.content.length === 0 || _.difference(token.content, models.phrasing).length) {
            return models.flow;
        }
        return models.phrasing;
    }
};
