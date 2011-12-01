var _ = require('underscore'),
    models = require('./content-models');

exports.phrasingElseFlow = function (token) {
    // When the element only contains phrasing content: where phrasing content is expected. Otherwise: where flow content is expected.
    if (token.content.length === 0 || _.difference(token.content, models.phrasing).length) {
        return models.flow;
    }
    return models.phrasing;
};