var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-a-element
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
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-em-element
exports.em = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-strong-element
exports.strong = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-small-element
exports.small = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-s-element
exports.s = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-cite-element
exports.cite = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-q-element
exports.q = {
    attrs: _.extend({}, common.attrs, {
        cite: { type: datatypes.URL }
    }),
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-dfn-element
exports.dfn = {
    attrs: _.extend({}, common.attrs, {
        title: { type: datatypes.string }
    }),
    content: _.difference(models.phrasing, ['dfn']),
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-abbr-element
exports.abbr = {
    attrs: _.extend({}, common.attrs, {
        title: { type: datatypes.string }
    }),
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-time-element
exports.time = {
    attrs: _.extend({}, common.attrs, {
        datetime: { type: datatypes.datetime },
        pubdate: { type: ['pubdate', null] }
    }),
    content: _.difference(models.phrasing, ['time']),
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-code-element
exports.code = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-var-element
exports.var = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-samp-element
exports.samp = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-kbd-element
exports.kbd = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-sub-and-sup-elements
exports.sub = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-sub-and-sup-elements
exports.sup = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-i-element
exports.i = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-b-element
exports.b = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-u-element
exports.u = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-mark-element
exports.mark = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-ruby-element
exports.ruby = {
    attrs: common.attrs,
    content: models.phrasing, // TODO: One or more groups of: phrasing content followed either by a single rt element, or an rp element, an rt element, and another rp element.
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-rt-element
exports.rt = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: ['ruby']
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-rp-element
exports.rp = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: ['ruby'] // TODO: As a child of a ruby element, either immediately before or immediately after an rt element.
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-bdi-element
exports.bdi = {
    attrs: _.extend({}, common.attrs, {
        dir: { type: ['ltr', 'rtl'] }
    }),
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-bdo-element
exports.bdo = {
    attrs: _.extend({}, common.attrs, {
        dir: { type: ['ltr', 'rtl'] }
    }),
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-span-element
exports.span = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-br-element
exports.br = {
    attrs: common.attrs,
    content: null,
    contexts: models.phrasing
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-wbr-element
exports.wbr = {
    attrs: common.attrs,
    content: null,
    contexts: models.phrasing
};
