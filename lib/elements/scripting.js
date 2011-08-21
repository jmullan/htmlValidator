var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

exports.script = {
    attr: _.extend(common.attrs, {
        src: { type: datatypes.URL },
        async: { type: ['async', null] },
        defer: { type: ['defer', null] },
        type: { type: datatypes['mime-type'] },
        charset: { type: datatypes['meta-charset'] } // TODO: cannot be specified if src is not present
    }),
    content: models.text,
    /*
    TODO: some complexity
    http://www.whatwg.org/specs/web-apps/current-work/multipage/scripting-1.html#restrictions-for-contents-of-script-elements
    If there is no src attribute, depends on the value of the type attribute, but must match script content restrictions.
    If there is a src attribute, the element must be either empty or contain only script documentation that also matches script content restrictions.
    */
    contexts: _.union(models.metadata, models.phrasing)
};
