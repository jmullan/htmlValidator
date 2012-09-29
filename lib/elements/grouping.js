var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes'),
    errors = require('../errors');

// @discussion: http://dev.w3.org/html5/spec/the-p-element.html
exports.p = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-hr-element.html
exports.hr = {
    attrs: common.attrs,
    content: null,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-pre-element.html
exports.pre = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-blockquote-element.html
exports.blockquote = {
    attrs: _.extend({}, common.attrs, { cite: { type: datatypes.URL }}),
    content: models.flow,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-ol-element.html
exports.ol = {
    attrs: _.extend({}, common.attrs, {
        reversed: { type: ['reversed', null] },
        start: { type: datatypes.int },
        type: { type: ['decimal', 'lower-alpha', 'upper-alpha', 'lower-roman', 'upper-roman'] }
    }),
    content: ['li'],
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-ul-element.html
exports.ul = {
    attrs: common.attrs,
    content: ['li'],
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-li-element.html
exports.li = {
    attrs: _.extend({}, common.attrs, ['value']), // TODO: value only valid if child of ol
    content: models.flow,
    context: ['ol', 'ul', 'menu']
};

// @discussion: http://dev.w3.org/html5/spec/the-dl-element.html
exports.dl = {
    attrs: common.attrs,
    content: ['dt', 'dd'], // TODO: validate 1 or more dt followed by one or more dd?
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-dt-element.html
exports.dt = {
    attrs: common.attrs,
    content: models.phrasing,
    context: ['dl'] // TODO: validate before dt or dd elements?
};

// @discussion: http://dev.w3.org/html5/spec/the-dd-element.html
exports.dd = {
    attrs: common.attrs,
    content: models.flow,
    context: ['dl'] // TODO: validate after dt or dd elements?
};

// @discussion: http://dev.w3.org/html5/spec/the-figure-element.html
exports.figure = {
    attrs: common.attrs,
    content: function (token) {
        if (_.indexOf(token.content, 'figcaption') !== _.lastIndexOf(token.content, 'figcaption')) {
            token.errors.push(new errors.OnlyOneAllowed(token, null, 'figcaption'));
        }
        return _.extend(models.flow, ['figcaption']);
    },
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-figcaption-element.html
exports.figcaption = {
    attrs: common.attrs,
    content: models.flow,
    context: ['figure'] // TODO: must be first or last child of figure
};

// @discussion: http://dev.w3.org/html5/spec/the-div-element.html
exports.div = {
    attrs: common.attrs,
    content: models.flow,
    contents: models.flow
};
