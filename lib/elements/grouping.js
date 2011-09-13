var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/grouping-content.html#the-p-element
exports.p = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.flow
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/grouping-content.html#the-hr-element
exports.hr = {
    attrs: common.attrs,
    content: null,
    contexts: models.flow
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/grouping-content.html#the-pre-element
exports.pre = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.flow
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/grouping-content.html#the-blockquote-element
exports.blockquote = {
    attrs: _.extend({}, common.attrs, { cite: { type: datatypes.URL }}),
    content: models.flow,
    contexts: models.flow
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/grouping-content.html#the-ol-element
exports.ol = {
    attrs: _.extend({}, common.attrs, {
        reversed: { type: ['reversed', null] },
        start: { type: datatypes.int },
        type: { type: ['decimal', 'lower-alpha', 'upper-alpha', 'lower-roman', 'upper-roman'] }
    }),
    content: ['li'],
    contexts: models.flow
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/grouping-content.html#the-ul-element
exports.ul = {
    attrs: common.attrs,
    content: ['li'],
    contexts: models.flow
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/grouping-content.html#the-li-element
exports.li = {
    attrs: _.extend({}, common.attrs, ['value']), // TODO: value only valid if child of ol
    content: models.flow,
    contexts: ['ol', 'ul', 'menu']
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/grouping-content.html#the-dl-element
exports.dl = {
    attrs: common.attrs,
    content: ['dt', 'dd'], // TODO: validate 1 or more dt followed by one or more dd?
    contexts: models.flow
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/grouping-content.html#the-dt-element
exports.dt = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: ['dl'] // TODO: validate before dt or dd elements?
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/grouping-content.html#the-dd-element
exports.dd = {
    attrs: common.attrs,
    content: models.flow,
    contexts: ['dl'] // TODO: validate after dt or dd elements?
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/grouping-content.html#the-figure-element
exports.figure = {
    attrs: common.attrs,
    content: _.extend(models.flow, ['figcaption']), // TODO: make sure it's only one figcaption element
    contexts: models.flow
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/grouping-content.html#the-figcaption-element
exports.figcaption = {
    attrs: common.attrs,
    content: models.flow,
    contexts: ['figure'] // TODO: must be first or last child of figure
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/grouping-content.html#the-div-element
exports.div = {
    attrs: common.attrs,
    content: models.flow,
    contents: models.flow
};
