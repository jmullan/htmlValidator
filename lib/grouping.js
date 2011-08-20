var _ = require('underscore'),
    common = require('./common'),
    models = require('./content-models'),
    datatypes = require('./datatypes');

exports.p = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.flow
};

exports.hr = {
    attrs: common.attrs,
    content: null,
    contexts: models.flow
};

exports.pre = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.flow
};

exports.blockquote = {
    attrs: _.extend(common.attrs, { cite: { type: datatypes.URL }}),
    content: models.flow,
    contexts: models.flow
};

exports.ol = {
    attrs: _.extend(common.attrs, {
        reversed: { type: ['true', 'false', null] },
        start: { type: datatypes.int },
        type: { type: ['decimal', 'lower-alpha', 'upper-alpha', 'lower-roman', 'upper-roman'] }
    }),
    content: ['li'],
    contexts: models.flow
};

exports.ol = {
    attrs: common.attrs,
    content: ['li'],
    contexts: models.flow
};

exports.li = {
    attrs: _.extend(common.attrs, ['value']), // TODO: value only valid if child of ol
    content: models.flow,
    contexts: ['ol', 'ul', 'menu']
};

exports.dl = {
    attrs: common.attrs,
    content: ['dt', 'dd'], // TODO: validate 1 or more dt followed by one or more dd?
    contexts: models.flow
};

exports.dt = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: ['dl'] // TODO: validate before dt or dd elements?
};

exports.dd = {
    attrs: common.attrs,
    content: models.flow,
    contexts: ['dl'] // TODO: validate after dt or dd elements?
};

exports.figure = {
    attrs: common.attrs,
    content: _.extend(models.flow, ['figcaption']), // TODO: make sure it's only one figcaption element
    contexts: models.flow
};

exports.figcaption = {
    attrs: common.attrs,
    content: models.flow,
    contexts: ['figure'] // TODO: must be first or last child of figure
};

exports.div = {
    attrs: common.attrs,
    content: models.flow,
    contents: models.flow
};
