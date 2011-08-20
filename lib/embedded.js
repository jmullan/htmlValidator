var _ = require('underscore'),
    common = require('./common'),
    models = require('./content-models'),
    datatypes = require('./datatypes');

exports.img = {
    attrs: _.extend(common.attrs, {
        alt: { type: datatypes.string }, // TODO: required to be present, empty is okay
        src: { type: datatypes.URL },
        crossorigin: { type: ['anonymous', 'use-credentials'] },
        usemap: { type: datatypes['hash-name'] },
        ismap: { type: ['true', 'false', null] }, // TODO: The ismap attribute is a boolean attribute. The attribute must not be specified on an element that does not have an ancestor a element with an href attribute.
        width: { type: datatypes.integer },
        height: { type: datatypes.integer }
    }),
    content: null,
    contexts: models.embedded
};

exports.iframe = {
    attrs: _.extend(common.attrs, {
        src: { type: datatypes.URL },
        srcdoc: { type: datatypes.string },
        name: { type: datatypes['browsing-context'] },
        sandbox: { type: ['allow-forms', 'allow-same-origin', 'allow-scripts', 'allow-top-navigation'] }, // TODO: these are space-separated tokens
        seamless: { type: ['true', 'false', null] },
        width: { type: datatypes.integer },
        height: { type: datatypes.integer }
    }),
    content: null, // TODO: this is actually complex: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-iframe-element.html#iframe-content-model
    contexts: models.embedded
};

exports.embed = {
    attrs: _.extend(common.attrs, {
        src: { type: datatypes.URL },
        type: { type: ['mime-type'] },
        width: { type: datatypes.integer },
        height: { type: datatypes.integer }
    }),
    content: null,
    contexts: models.embedded
};

exports.object = {
    attrs: _.extend(common.attrs, {
        data: { type: datatypes.string },
        type: { type: ['mime-type'] },
        typemustmatch: { type: ['true', 'false', null] },
        name: { type: datatypes['browsing-context'] },
        usemap: { type: datatypes['hash-name'] },
        form: { type: datatypes.IDREF },
        width: { type: datatypes.integer },
        height: { type: datatypes.integer }
    }),
    content: _.union(['param'], models.transparent),
    contexts: models.embedded
};

exports.param = {
    attrs: _.extend(common.attrs, {
        // TODO: both are required
        name: { type: datatypes['browsing-context'] },
        value: { type: datatypes.string }
    }),
    content: null,
    contexts: ['object'] // TODO: in object, before any flow/transparent content
};

exports.video = {
    attrs: _.extend(common.attrs, {
        src: { type: datatypes.URL },
        crossorigin: { type: ['anonymous', 'use-credentials'] },
        poster: { type: datatypes.URL },
        preload: { type: ['none', 'metadata', 'auto', null] },
        autoplay: { type: ['true', 'false', null] },
        mediagroup: { type: datatypes.string },
        loop: { type: ['true', 'false', null] },
        muted: { type: ['true', 'false', null] },
        controls: { type: ['true', 'false', null] },
        width: { type: datatypes.integer },
        height: { type: datatypes.integer }
    }),
    content: ['track', 'source'], // TODO: If the element has a src attribute: zero or more track elements, then transparent, but with no media element descendants. If the element does not have a src attribute: zero or more source elements, then zero or more track elements, then transparent, but with no media element descendants.
    contexts: models.embedded
};

exports.audio = {
    attrs: _.extend(common.attrs, {
        src: { type: datatypes.URL },
        crossorigin: { type: ['anonymous', 'use-credentials'] },
        preload: { type: ['none', 'metadata', 'auto', null] },
        autoplay: { type: ['true', 'false', null] },
        mediagroup: { type: datatypes.string },
        loop: { type: ['true', 'false', null] },
        muted: { type: ['true', 'false', null] },
        controls: { type: ['true', 'false', null] }
    }),
    content: ['track', 'source'], // TODO: If the element has a src attribute: zero or more track elements, then transparent, but with no media element descendants. If the element does not have a src attribute: zero or more source elements, then zero or more track elements, then transparent, but with no media element descendants.
    contexts: models.embedded
};

exports.source = {
    attrs: _.extend(common.attrs, {
        src: { type: datatypes.URL },
        type: { type: datatypes['mime-type'] },
        media: { type: datatypes['media-query'] }
    }),
    content: null,
    contexts: ['audio', 'video']
};

exports.track = {
    attrs: _.extend(common.attrs, {
        kind: { type: ['subtitles', 'captions', 'descriptions', 'chapters', 'metadata'] },
        src: { type: datatypes.URL },
        srclang: { type: datatypes.string }, // TODO: empty okay
        label: { type: datatypes.string },
        default: { type: ['true', 'false', null] } // TODO: There must not be more than one track element with the same parent node with the default attribute specified.
    }),
    content: null,
    contexts: ['audio', 'video']
};

exports.canvas = {
    attrs: _.extend(common.attrs, {
        width: { type: datatypes.integer },
        height: { type: datatypes.integer }
    }),
    content: _.union(_.difference(models.transparent, models.interactive), [
        'a', 'button', 'input[type=checkbox]', 'input[type=radio]', 'input[type=submit]', 'input[type=cancel]', 'input[type=button]'
    ]),
    contexts: models.embedded
};

exports.map = {
    attrs: _.extend(common.attrs, {
        name: { type: datatypes['browsing-context'] }
    }),
    content: models.transparent,
    contexts: models.phrasing // TODO: When the element only contains phrasing content: where phrasing content is expected. Otherwise: where flow content is expected.
};

exports.area = {
    attrs: _.extend(common.attrs, {
        alt: { type: datatypes.string }, // TODO: required present, The alt attribute may be left blank if there is another area element in the same image map that points to the same resource and has a non-blank alt attribute.
        coords: { type: datatypes.integer }, // TODO: A valid list of integers is a number of valid integers separated by U+002C COMMA characters, with no other characters (e.g. no space characters). In addition, there might be restrictions on the number of integers that can be given, or on the range of values allowed.
        shape: { type: ['circle', 'circ', 'default', 'poly', 'polygon', 'rect', 'rectangle'] },
        href: { type: datatypes.URL },
        target: { type: datatypes['browsing-context'] },
        download: { type: datatypes.string },
        ping: { type: datatypes.foo }, // TODO: tokens of valid URLs
        rel: { type: datatypes.tokens },
        media: { type: datatypes['media-query'] }, // TODO: should match media queries http://dev.w3.org/csswg/css3-mediaqueries/#media0
        hreflang: { type: datatypes.lang }, // TODO: should match BCP47: http://www.ietf.org/rfc/bcp/bcp47.txt
        type: { type: datatypes['mime-type'] }, // TODO: must be valid MIME type from RFC 2616
    }),
    content: null,
    contexts: ['map'] // TODO: this should be "models.phrasing, but only if there is a map element ancestor"
};

// TODO: exports.math
// TODO: exports.svg
