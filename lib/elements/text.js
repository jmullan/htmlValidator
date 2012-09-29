var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

// @discussion: http://dev.w3.org/html5/spec/the-a-element.html
exports.a = {
    attrs: _.extend({}, common.attrs, {
        href: { type: datatypes.URL },
        target: { type: function (input) {
            // TODO: this seems redundant. "or any string" is valid here.
            return _.indexOf(['_blank', '_self', '_parent', '_top'], input) !== -1 || typeof input === 'string';
        }},
        download: { type: datatypes.string },
        ping: { type: function (value) {
            return datatypes['space-tokens-unordered'](value, datatypes.URL);
        }},
        rel: { type: function (value) {
            return datatypes['space-tokens-unordered'](value, [
                'alternate',
                'author',
                'bookmark',
                'help',
                'icon',
                'license',
                'next',
                'nofollow',
                'noreferrer',
                'pingback',
                'prefetch',
                'prev',
                'search',
                'stylesheet',
                'tag'
            ]);
        }},
        media: { type: datatypes['media-query'] },
        hreflang: { type: datatypes.language },
        type: { type: datatypes['mime-type'] }
    }),
    content: _.difference(models.transparent, models.interactive),
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-em-element.html
exports.em = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-strong-element.html
exports.strong = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-small-element.html
exports.small = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-s-element.html
exports.s = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-cite-element.html
exports.cite = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-q-element.html
exports.q = {
    attrs: _.extend({}, common.attrs, {
        cite: { type: datatypes.URL }
    }),
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-dfn-element.html
exports.dfn = {
    attrs: _.extend({}, common.attrs, {
        title: { type: datatypes.string }
    }),
    content: _.difference(models.phrasing, ['dfn']),
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-abbr-element.html
exports.abbr = {
    attrs: _.extend({}, common.attrs, {
        title: { type: datatypes.string }
    }),
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-data-element.html
exports.data = {
    attrs: _.extend({}, common.attrs, {
        value: { type: datatypes.string, required: true },
    }),
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-code-element.html
exports.code = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-var-element.html
exports.var = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-samp-element.html
exports.samp = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-kbd-element.html
exports.kbd = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-sub-and-sup-elements.html
exports.sub = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-sub-and-sup-elements.html
exports.sup = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-i-element.html
exports.i = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-b-element.html
exports.b = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-u-element.html
exports.u = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-mark-element.html
exports.mark = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-ruby-element.html
exports.ruby = {
    attrs: common.attrs,
    content: models.phrasing, // TODO: One or more groups of: phrasing content followed either by a single rt element, or an rp element, an rt element, and another rp element.
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-rt-element.html
exports.rt = {
    attrs: common.attrs,
    content: models.phrasing,
    context: ['ruby']
};

// @discussion: http://dev.w3.org/html5/spec/the-rp-element.html
exports.rp = {
    attrs: common.attrs,
    content: models.phrasing,
    context: ['ruby'] // TODO: As a child of a ruby element, either immediately before or immediately after an rt element.
};

// @discussion: http://dev.w3.org/html5/spec/the-bdi-element.html
exports.bdi = {
    attrs: _.extend({}, common.attrs, {
        dir: { type: ['ltr', 'rtl'] }
    }),
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-bdo-element.html
exports.bdo = {
    attrs: _.extend({}, common.attrs, {
        dir: { type: ['ltr', 'rtl'] }
    }),
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-span-element.html
exports.span = {
    attrs: common.attrs,
    content: models.phrasing,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-br-element.html
exports.br = {
    attrs: common.attrs,
    content: null,
    context: null
};

// @discussion: http://dev.w3.org/html5/spec/the-wbr-element.html
exports.wbr = {
    attrs: common.attrs,
    content: null,
    context: null
};
