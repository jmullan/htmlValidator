var _ = require('underscore'),
    common = require('./common'),
    models = require('./content-models'),
    datatypes = require('./datatypes');

exports.a = {
    attrs: _.extend(common.attrs, {
        href: { type: datatypes.URL },
        target: { type: ['_blank', '_self', '_parent', '_top'] }, // TODO: or any string
        download: { type: datatypes.string },
        ping: { type: datatypes.foo }, // TODO: tokens of valid URLs
        rel: { type: datatypes.tokens },
        media: { type: datatypes.string }, // TODO: should match media queries http://dev.w3.org/csswg/css3-mediaqueries/#media0
        hreflang: { type: datatypes.string }, // TODO: should match BCP47: http://www.ietf.org/rfc/bcp/bcp47.txt
        type: { type: datatypes.string }, // TODO: must be valid MIME type from RFC 2616
    }),
    content: _.difference(models.transparent, models.interactive),
    contexts: models.phrasing
};

exports.em = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

exports.strong = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

exports.small = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

exports.s = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

exports.cite = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

exports.q = {
    attrs: _.extend(common.attrs, {
        cite: { type: datatypes.URL }
    }),
    content: models.phrasing,
    contexts: models.phrasing
};

exports.dfn = {
    attrs: _.extend(common.attrs, {
        title: { type: datatypes.string }
    }),
    content: _.difference(models.phrasing, ['dfn']),
    contexts: models.phrasing
};

exports.abbr = {
    attrs: _.extend(common.attrs, {
        title: { type: datatypes.string }
    }),
    content: models.phrasing,
    contexts: models.phrasing
};

exports.time = {
    attrs: _.extend(common.attrs, {
        datetime: { type: datatypes.datetime },
        pubdate: { type: ['true', 'false', null] }
    }),
    content: _.difference(models.phrasing, ['time']),
    contexts: models.phrasing
};

exports.code = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

exports.var = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

exports.samp = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

exports.kbd = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

exports.sub = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

exports.sup = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

exports.i = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

exports.b = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

exports.u = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

exports.mark = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

exports.ruby = {
    attrs: common.attrs,
    content: models.phrasing, // TODO: One or more groups of: phrasing content followed either by a single rt element, or an rp element, an rt element, and another rp element.
    contexts: models.phrasing
};

exports.rt = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: ['ruby']
};

exports.rp = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: ['ruby'] // TODO: As a child of a ruby element, either immediately before or immediately after an rt element.
};

exports.bdi = {
    attrs: _.extend(common.attrs, {
        dir: { type: ['ltr', 'rtl'] }
    }),
    content: models.phrasing,
    contexts: models.phrasing
};

exports.bdo = {
    attrs: _.extend(common.attrs, {
        dir: { type: ['ltr', 'rtl'] }
    }),
    content: models.phrasing,
    contexts: models.phrasing
};

exports.span = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

exports.br = {
    attrs: common.attrs,
    content: null,
    contexts: models.phrasing
};

exports.wbr = {
    attrs: common.attrs,
    content: null,
    contexts: models.phrasing
};
