var _ = require('underscore'),
    common = require('./common'),
    models = require('./content-models'),
    datatypes = require('./datatypes');

exports.ins = {
    attrs: _.extend(common.attrs, {
        cite: { type: datatypes.URL },
        datetime: { type: datatypes.datetime }
    }),
    content: models.transparent,
    contexts: models.phrasing // TODO: When the element only contains phrasing content: where phrasing content is expected. Otherwise: where flow content is expected.
};

exports.del = {
    attrs: _.extend(common.attrs, {
        cite: { type: datatypes.URL },
        datetime: { type: datatypes.datetime }
    }),
    content: models.transparent,
    contexts: models.phrasing // TODO: When the element only contains phrasing content: where phrasing content is expected. Otherwise: where flow content is expected.
};
