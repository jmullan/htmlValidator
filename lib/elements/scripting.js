var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

// @discussion: http://dev.w3.org/html5/spec/the-script-element.html
exports.script = {
    attrs: _.extend({}, common.attrs, {
        src: { type: datatypes.URL },
        async: { type: ['async', null] },
        defer: { type: ['defer', null] },
        type: { type: datatypes['mime-type'] },
        charset: { type: datatypes['meta-charset'] } // TODO: cannot be specified if src is not present
    }),
    content: models.text,
    /*
    TODO: some complexity
    http://dev.w3.org/html5/spec/scripting-1.html#restrictions-for-contents-of-script-elements
    If there is no src attribute, depends on the value of the type attribute, but must match script content restrictions.
    If there is a src attribute, the element must be either empty or contain only script documentation that also matches script content restrictions.
    */
    context: _.union(models.metadata, models.phrasing)
};

// @discussion: http://dev.w3.org/html5/spec/the-noscript-element.html
exports.noscript = {
    attrs: common.attrs,
    content: _.difference(models.transparent, ['noscript']),
    /*
    TODO: complex:
    When scripting is disabled, in a head element: in any order, zero or more link elements, zero or more style elements, and zero or more meta elements.
    When scripting is disabled, not in a head element: transparent, but there must be no noscript element descendants.
    Otherwise: text that conforms to the requirements given in the prose.
    */
    context: null
    /*
    TODO: complex
    In a head element of an HTML document, if there are no ancestor noscript elements.
    Where phrasing content is expected in HTML documents, if there are no ancestor noscript elements.
    */
};
