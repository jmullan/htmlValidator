var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/tabular-data.html#the-table-element
exports.table = {
    attrs: _.extend({}, common.attrs, {
        border: { type: ['1', ''] }
    }),
    content: ['caption', 'colgroup', 'thead', 'tfoot', 'tbody', 'tr', 'tfoot'], // TODO: In this order: optionally a caption element, followed by zero or more colgroup elements, followed optionally by a thead element, followed optionally by a tfoot element, followed by either zero or more tbody elements or one or more tr elements, followed optionally by a tfoot element (but there can only be one tfoot element child in total).
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/tabular-data.html#the-caption-element
exports.caption = {
    attrs: common.attrs,
    content: _.difference(models.flow, ['table']),
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/tabular-data.html#the-colgroup-element
exports.colgroup = {
    attrs: _.extend({}, common.attrs, {
        span: { type: datatypes['integer-non-negative'] }
    }),
    content: ['col'], // TODO: if the span attribute is present, then this must be empty. Otherwise 0 or more col elements
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/tabular-data.html#the-col-element
exports.col = {
    attrs: _.extend({}, common.attrs, {
        span: { type: datatypes['integer-non-negative'] }
    }),
    content: null,
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/tabular-data.html#the-tbody-element
exports.tbody = {
    attrs: common.attrs,
    content: ['tr'],
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/tabular-data.html#the-thead-element
exports.thead = {
    attrs: common.attrs,
    content: ['tr'],
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/tabular-data.html#the-tfoot-element
exports.tfoot = {
    attrs: common.attrs,
    content: ['tr'],
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/tabular-data.html#the-tr-element
exports.tr = {
    attrs: common.attrs,
    content: ['td', 'th'],
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/tabular-data.html#the-td-element
exports.td = {
    attrs: _.extend({}, common.attrs, {
        colspan: { type: datatypes['integer-non-negative'] },
        rowspan: { type: datatypes['integer-non-negative'] },
        headers: { type: function (input) {
            return datatypes['space-tokens-unordered'](input, datatypes.IDREF);
        }} // TODO: The td and th element may have a headers content attribute specified. The headers attribute, if specified, must contain a string consisting of an unordered set of unique space-separated tokens that are case-sensitive, each of which must have the value of an ID of a th element taking part in the same table as the td or th element (as defined by the table model).
    }),
    content: models.flow,
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/tabular-data.html#the-th-element
exports.th = {
    attrs: _.extend({}, common.attrs, {
        colspan: { type: datatypes['integer-non-negative'] },
        rowspan: { type: datatypes['integer-non-negative'] },
        headers: { type: function (input) {
            return datatypes['space-tokens-unordered'](input, datatypes.IDREF);
        }}, // TODO: The td and th element may have a headers content attribute specified. The headers attribute, if specified, must contain a string consisting of an unordered set of unique space-separated tokens that are case-sensitive, each of which must have the value of an ID of a th element taking part in the same table as the td or th element (as defined by the table model).
        scope: { type: ['row', 'col', 'rowgroup', 'colgroup', ''] }
    }),
    content: models.flow,
};
