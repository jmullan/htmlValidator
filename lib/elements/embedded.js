var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/embedded-content-1.html#the-img-element
exports.img = {
    attrs: _.extend({}, common.attrs, {
        alt: { type: datatypes.string, required: true, empty: true },
        src: { type: datatypes.URL },
        crossorigin: { type: ['anonymous', 'use-credentials'] },
        usemap: { type: datatypes['hash-name'] },
        ismap: { type: ['ismap', null] },
        width: { type: datatypes.integer },
        height: { type: datatypes.integer }
    }),
    content: null,
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-iframe-element.html#the-iframe-element
exports.iframe = {
    attrs: _.extend({}, common.attrs, {
        src: { type: datatypes.URL },
        srcdoc: { type: datatypes.string },
        name: { type: datatypes['browsing-context'] },
        sandbox: { type: function (value) {
            return datatypes['space-tokens-unordered'](value, ['allow-forms', 'allow-same-origin', 'allow-scripts', 'allow-top-navigation']);
        }},
        seamless: { type: ['seamless', null] },
        width: { type: datatypes.integer },
        height: { type: datatypes.integer }
    }),
    content: null, // TODO: this is actually complex: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-iframe-element.html#iframe-content-model
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-iframe-element.html#the-embed-element
exports.embed = {
    attrs: _.extend({}, common.attrs, {
        src: { type: datatypes.URL },
        type: { type: ['mime-type'] },
        width: { type: datatypes.integer },
        height: { type: datatypes.integer }
    }),
    content: null,
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-iframe-element.html#the-object-element
exports.object = {
    attrs: _.extend({}, common.attrs, {
        data: { type: datatypes.string },
        type: { type: ['mime-type'] },
        typemustmatch: { type: ['typemustmatch', null] },
        name: { type: datatypes['browsing-context'] },
        usemap: { type: datatypes['hash-name'] },
        form: { type: datatypes.IDREF },
        width: { type: datatypes.integer },
        height: { type: datatypes.integer }
    }),
    content: _.union(['param'], models.transparent),
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-iframe-element.html#the-param-element
exports.param = {
    attrs: _.extend({}, common.attrs, {
        name: { type: datatypes['browsing-context'], required: true },
        value: { type: datatypes.string, required: true }
    }),
    content: null,
    context: ['object'] // TODO: in object, before any flow/transparent content
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#the-video-element
exports.video = {
    attrs: _.extend({}, common.attrs, {
        src: { type: datatypes.URL },
        crossorigin: { type: ['anonymous', 'use-credentials'] },
        poster: { type: datatypes.URL },
        preload: { type: ['none', 'metadata', 'auto', null] },
        autoplay: { type: ['autoplay', null] },
        mediagroup: { type: datatypes.string },
        loop: { type: ['loop', null] },
        muted: { type: ['muted', null] },
        controls: { type: ['controls', null] },
        width: { type: datatypes.integer },
        height: { type: datatypes.integer }
    }),
    content: ['track', 'source'], // TODO: If the element has a src attribute: zero or more track elements, then transparent, but with no media element descendants. If the element does not have a src attribute: zero or more source elements, then zero or more track elements, then transparent, but with no media element descendants.
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#the-audio-element
exports.audio = {
    attrs: _.extend({}, common.attrs, {
        src: { type: datatypes.URL },
        crossorigin: { type: ['anonymous', 'use-credentials'] },
        preload: { type: ['none', 'metadata', 'auto', null] },
        autoplay: { type: ['autoplay', null] },
        mediagroup: { type: datatypes.string },
        loop: { type: ['loop', null] },
        muted: { type: ['muted', null] },
        controls: { type: ['controls', null] }
    }),
    content: ['track', 'source'], // TODO: If the element has a src attribute: zero or more track elements, then transparent, but with no media element descendants. If the element does not have a src attribute: zero or more source elements, then zero or more track elements, then transparent, but with no media element descendants.
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#the-source-element
exports.source = {
    attrs: _.extend({}, common.attrs, {
        src: { type: datatypes.URL },
        type: { type: datatypes['mime-type'] },
        media: { type: datatypes['media-query'] }
    }),
    content: null,
    context: ['audio', 'video']
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#the-track-element
exports.track = {
    attrs: _.extend({}, common.attrs, {
        kind: { type: ['subtitles', 'captions', 'descriptions', 'chapters', 'metadata'] },
        src: { type: datatypes.URL },
        srclang: { type: datatypes.string, empty: true },
        label: { type: datatypes.string },
        default: { type: ['default', null] } // TODO: There must not be more than one track element with the same parent node with the default attribute specified.
    }),
    content: null,
    context: ['audio', 'video']
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#the-canvas-element
exports.canvas = {
    attrs: _.extend({}, common.attrs, {
        width: { type: datatypes.integer },
        height: { type: datatypes.integer }
    }),
    content: _.union(_.difference(models.transparent, models.interactive), [
        'a', 'button', 'input[type=checkbox]', 'input[type=radio]', 'input[type=submit]', 'input[type=cancel]', 'input[type=button]'
    ]),
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-map-element.html#the-map-element
exports.map = {
    attrs: _.extend({}, common.attrs, {
        name: { type: datatypes['browsing-context'] }
    }),
    content: models.transparent,
    context: models.phrasing // TODO: When the element only contains phrasing content: where phrasing content is expected. Otherwise: where flow content is expected.
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-map-element.html#the-area-element
exports.area = {
    attrs: _.extend({}, common.attrs, {
        alt: { type: datatypes.string, required: true }, // TODO: The alt attribute may be left blank if there is another area element in the same image map that points to the same resource and has a non-blank alt attribute.
        coords: { type: datatypes.integer }, // TODO: A valid list of integers is a number of valid integers separated by U+002C COMMA characters, with no other characters (e.g. no space characters). In addition, there might be restrictions on the number of integers that can be given, or on the range of values allowed.
        shape: { type: ['circle', 'circ', 'default', 'poly', 'polygon', 'rect', 'rectangle'] },
        href: { type: datatypes.URL },
        target: { type: datatypes['browsing-context'] },
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
        media: { type: datatypes['media-query'] }, // TODO: should match media queries http://dev.w3.org/csswg/css3-mediaqueries/#media0
        hreflang: { type: datatypes.language }, // TODO: should match BCP47: http://www.ietf.org/rfc/bcp/bcp47.txt
        type: { type: datatypes['mime-type'] }, // TODO: must be valid MIME type from RFC 2616
    }),
    content: null,
    context: ['map'] // TODO: this should be "models.phrasing, but only if there is a map element ancestor"
};

// TODO: exports.math
// TODO: exports.svg
