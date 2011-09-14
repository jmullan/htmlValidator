var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/semantics.html#the-head-element
// TODO: required element
exports.head = {
    attrs: common.attrs,
    content: models.metadata, // TODO: If the document is an iframe srcdoc document or if title information is available from a higher-level protocol: Zero or more elements of metadata content. Otherwise: One or more elements of metadata content, of which exactly one is a title element.
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/semantics.html#the-title-element
exports.title = {
    attrs: common.attrs,
    content: models.text,
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/semantics.html#the-base-element
exports.base = {
    attrs: _.extend({}, common.attrs, {
        href: { type: datatypes.URL },
        target: { type: datatypes['browsing-context'] }
    }),
    content: null,
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/semantics.html#the-link-element
exports.link = {
    attrs: _.extend({}, common.attrs, {
        href: { type: datatypes.URL },
        rel: { type: function (input) {
            return datatypes['space-tokens-unordered'](input, [
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
        type: { type: datatypes['mime-type'] },
        sizes: { type: function (input) {
            return datatypes['space-tokens-unordered'](input, function (token, tokens) {
                return datatypes['integer-non-negative'](token) || (/^any$/i).test(token);
            });
        }},
    }),
    content: null,
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/semantics.html#the-meta-element
exports.meta = {
    attrs: _.extend({}, common.attrs, {
        name: { type: datatypes.string },
        'http-equiv': { type: ['content-language', 'content-type', 'default-style', 'refresh', 'set-cookie'] },
        content: { type: datatypes.string }, // TODO: dependent on name attr http://www.whatwg.org/specs/web-apps/current-work/multipage/semantics.html#standard-metadata-names
        charset: { type: datatypes['meta-charset'] }
    }),
    content: null,
    /* TODO: extremely complex
    If the charset attribute is present, or if the element's http-equiv attribute is in the Encoding declaration state: in a head element.
    If the http-equiv attribute is present but not in the Encoding declaration state: in a head element.
    If the http-equiv attribute is present but not in the Encoding declaration state: in a noscript element that is a child of a head element.
    If the name attribute is present: where metadata content is expected.
    If the itemprop attribute is present: where metadata content is expected.
    If the itemprop attribute is present: where phrasing content is expected.
    */
};

// @discussion:http://www.whatwg.org/specs/web-apps/current-work/multipage/semantics.html#the-style-element
exports.style = {
    attrs: _.extend({}, common.attrs, {
        media: { type: datatypes['media-query'] },
        type: { type: datatypes['mime-type'] },
        scoped: { type: ['scoped', null] }
    }),
    content: models.text, // TODO: The textContent of a style element must match the style production in the following ABNF, the character set for which is Unicode. [ABNF]
    // TODO: complex on attributes
    /*
    If the scoped attribute is absent: where metadata content is expected.
    If the scoped attribute is absent: in a noscript element that is a child of a head element.
    If the scoped attribute is present: where flow content is expected, but before any other flow content other than other style elements and inter-element whitespace.
    */
};
