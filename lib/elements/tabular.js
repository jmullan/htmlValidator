var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

exports.table = {
    attrs: _.extend(common.attrs, {
        border: { type: ['1', ''] }
    }),
    content: ['caption', 'colgroup', 'thead', 'tfoot', 'tbody', 'tr', 'tfoot'], // TODO: In this order: optionally a caption element, followed by zero or more colgroup elements, followed optionally by a thead element, followed optionally by a tfoot element, followed by either zero or more tbody elements or one or more tr elements, followed optionally by a tfoot element (but there can only be one tfoot element child in total).
    contexts: models.flow
};

exports.caption = {
    attrs: common.attrs,
    content: _.difference(models.flow, ['table']),
    contexts: ['table'] // TODO: must be first child of table
};

exports.colgroup = {
    attrs: _.extend(common.attrs, {
        span: { type: datatypes['integer-non-negative'] }
    }),
    content: ['col'], // TODO: if the span attribute is present, then this must be empty. Otherwise 0 or more col elements
    contexts: ['table'] // TODO: As a child of a table element, after any caption elements and before any thead, tbody, tfoot, and tr elements.
};

exports.col = {
    attrs: _.extend(common.attrs, {
        span: { type: datatypes['integer-non-negative'] }
    }),
    content: null,
    contexts: ['colgroup'] // TODO: As a child of a colgroup element that doesn't have a span attribute.
};

exports.tbody = {
    attrs: common.attrs,
    content: ['tr'],
    contexts: ['table'] // TODO: As a child of a table element, after any caption, colgroup, and thead elements, but only if there are no tr elements that are children of the table element.
};

exports.thead = {
    attrs: common.attrs,
    content: ['tr'],
    contexts: ['table'] // TODO: As a child of a table element, after any caption, and colgroup elements and before any tbody, tfoot, and tr elements, but only if there are no other thead elements that are children of the table element.
};

exports.tfoot = {
    attrs: common.attrs,
    content: ['tr'],
    contexts: ['table'] // TODO: As a child of a table element, after any caption, colgroup, and thead elements and before any tbody and tr elements, but only if there are no other tfoot elements that are children of the table element. - OR - As a child of a table element, after any caption, colgroup, thead, tbody, and tr elements, but only if there are no other tfoot elements that are children of the table element.
};

exports.tr = {
    attrs: common.attrs,
    content: ['td', 'th'],
    contexts: ['thead', 'tbody', 'tfoot', 'table'] // TODO: As a child of a table element, after any caption, colgroup, and thead elements, but only if there are no tbody elements that are children of the table element.
};

exports.td = {
    attrs: _.extend(common.attrs, {
        colspan: { type: datatypes['integer-non-negative'] },
        rowspan: { type: datatypes['integer-non-negative'] },
        headers: { type: datatypes.IDREF } // TODO: The td and th element may have a headers content attribute specified. The headers attribute, if specified, must contain a string consisting of an unordered set of unique space-separated tokens that are case-sensitive, each of which must have the value of an ID of a th element taking part in the same table as the td or th element (as defined by the table model).
    }),
    content: models.flow,
    contexts: ['tr']
};

exports.th = {
    attrs: _.extend(common.attrs, {
        colspan: { type: datatypes['integer-non-negative'] },
        rowspan: { type: datatypes['integer-non-negative'] },
        headers: { type: datatypes.IDREF }, // TODO: The td and th element may have a headers content attribute specified. The headers attribute, if specified, must contain a string consisting of an unordered set of unique space-separated tokens that are case-sensitive, each of which must have the value of an ID of a th element taking part in the same table as the td or th element (as defined by the table model).
        scope: { type: ['row', 'col', 'rowgroup', 'colgroup', ''] }
    }),
    content: models.flow,
    contexts: ['tr']
};
