var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

exports.form = {
    attrs: _.extend(common.attrs, {
        'accept-charset': { type: datatypes.charset }, // TODO: token list of charset
        action: { type: datatypes.URL },
        autocomplete: { type: ['on', 'off', null] },
        enctype: { type: ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'] },
        method: { type: ['get', 'post'] },
        name: { type: datatypes.string }, // TODO: The name attribute represents the form's name within the forms collection. The value must not be the empty string, and the value must be unique amongst the form elements in the forms collection that it is in, if any.
        novalidate: { type: ['novalidate', null] },
        target: { type: datatypes['browsing-context'] }
    }),
    content: _.difference(models.flow, ['form']),
    contexts: models.flow
};

exports.fieldset = {
    attrs: _.extend(common.attrs, {
        disabled: { type: ['disabled', null] },
        form: { type: datatypes.IDREF }, // TODO: must be the id of a form
        name: { type: datatypes.string }
    }),
    content: _.union(models.flow, ['legend']), // TODO: legend must come first
    contexts: models.flow
};

exports.legend = {
    attrs: common.attrs,
    content: models.phrasing,
    contexts: ['fieldset']
};

exports.label = {
    attrs: _.extend(common.attrs, {
        form: { type: datatypes.IDREF }, // TODO: must be the id of a form
        for: { type: datatypes.IDREF }, // TODO: must be the id of a labelable element
    }),
    content: _.difference(models.phrasing, ['label']), // TODO: Phrasing content, but with no descendant labelable elements unless it is the element's labeled control, and no descendant label elements.
    contexts: models.phrasing
};

exports.input = {
    attrs: _.extend(common.attrs, {
        accept: { type: datatypes['mime-type-list'] }, // TODO: comma separated list and 'audio/*', 'video/*', 'image/*'
        alt: { type: datatypes.string }, // TODO: required if using src attribute
        autocomplete: { type: ['on', 'off', null] },
        autofocus: { type: ['autofocus', null] }, // TODO: There must not be more than one element in the document with the autofocus attribute specified.
        checked: { type: ['checked', null] },
        dirname: { type: ['ltr', 'rtl'] }, // TODO: can this be null?
        disabled: { type: ['disabled', null] },
        form: { type: datatypes.IDREF }, // TODO: must be the id of a form
        formaction: { type: datatypes.URL },
        formenctype: { type: ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'] },
        formmethod: { type: ['get', 'post'] },
        formnovalidate: { type: ['formnovalidate', null] },
        formtarget: { type: datatypes['browsing-context'] },
        height: { type: datatypes.integer },
        list: { type: datatypes.IDREF }, // TODO: must be a datalist element
        max: { type: datatypes.string }, // TODO: dependent on the type attribute - http://www.whatwg.org/specs/web-apps/current-work/multipage/common-input-element-attributes.html#attr-input-max
        maxlength: { type: datatypes['integer-non-negative'] },
        min: { type: datatypes.string }, // TODO: dependent on the type attribute - http://www.whatwg.org/specs/web-apps/current-work/multipage/common-input-element-attributes.html#attr-input-max
        multiple: { type: ['multiple', null] },
        name: { type: datatypes.string },
        pattern: { type: datatypes.string }, // TODO: regex pattern
        placeholder: { type: datatypes.string }, // TODO: The attribute, if specified, must have a value that contains no U+000A LINE FEED (LF) or U+000D CARRIAGE RETURN (CR) characters.
        readonly: { type: ['readonly', null] },
        required: { type: ['required', null] },
        size: { type: datatypes['integer-non-negative'] },
        src: { type: datatypes.URL },
        step: { type: datatypes['float-positive'] }, // TODO: or a case-insensitive match for 'any'
        type: { type: [
            'hidden',
            'text',
            'search',
            'tel',
            'url',
            'email',
            'password',
            'datetime',
            'date',
            'month',
            'week',
            'time',
            'datetime-local',
            'number',
            'range',
            'color',
            'checkbox',
            'radio',
            'file',
            'submit',
            'image',
            'reset',
            'button'
        ]},
        value: { type: datatypes.string },
        width: { type: datatypes.integer },
    }),
    content: null,
    contexts: models.phrasing
};

exports.button = {
    attrs: _.extend(common.attrs, {
        autofocus: { type: ['autofocus', null] }, // TODO: There must not be more than one element in the document with the autofocus attribute specified.
        disabled: { type: ['disabled', null] },
        form: { type: datatypes.IDREF }, // TODO: must be the id of a form
        formaction: { type: datatypes.URL },
        formenctype: { type: ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'] },
        formmethod: { type: ['get', 'post'] },
        formnovalidate: { type: ['formnovalidate', null] },
        formtarget: { type: datatypes['browsing-context'] },
        name: { type: datatypes.string },
        type: { type: ['submit', 'reset', 'button'] },
        value: { type: datatypes.string },
    }),
    content: _.difference(models.phrasing, models.interactive),
    contexts: models.phrasing
};

exports.select = {
    attrs: _.extend(common.attrs, {
        autofocus: { type: ['autofocus', null] }, // TODO: There must not be more than one element in the document with the autofocus attribute specified.
        disabled: { type: ['disabled', null] },
        form: { type: datatypes.IDREF }, // TODO: must be the id of a form
        multiple: { type: ['multiple', null] },
        name: { type: datatypes.string },
        required: { type: ['required', null] },
        size: { type: datatypes['integer-non-negative'] }
    }),
    content: ['option', 'optgroup'],
    contexts: models.phrasing
};

exports.datalist = {
    attrs: common.attrs,
    content: models.phrasing, // TODO: OR zero or more option elements
    contexts: models.phrasing
};

exports.optgroup = {
    attrs: _.extend(common.attrs, {
        disabled: { type: ['disabled', null] },
        label: { type: datatypes.string } // TODO: required
    }),
    content: ['option'],
    contexts: ['select']
};

exports.option = {
    attrs: _.extend(common.attrs, {
        disabled: { type: ['disabled', null] },
        label: { type: datatypes.string }, // TODO: required
        selected: { type: ['selected', null] }, // TODO: A select element whose multiple attribute is not specified must not have more than one descendant option element with its selected attribute set.
        value: { type: datatypes.string }
    }),
    content: models.text,
    contexts: ['select', 'datalist', 'optgroup']
};

exports.textarea = {
    attrs: _.extend(common.attrs, {
        autofocus: { type: ['autofocus', null] }, // TODO: There must not be more than one element in the document with the autofocus attribute specified.
        cols: { type: datatypes['integer-non-negative'] },
        dirname: { type: ['ltr', 'rtl'] }, // TODO: can this be null?
        disabled: { type: ['disabled', null] },
        form: { type: datatypes.IDREF }, // TODO: must be the id of a form
        maxlength: { type: datatypes['integer-non-negative'] },
        name: { type: datatypes.string },
        placeholder: { type: datatypes.string }, // TODO: The attribute, if specified, must have a value that contains no U+000A LINE FEED (LF) or U+000D CARRIAGE RETURN (CR) characters.
        readonly: { type: ['readonly', null] },
        required: { type: ['required', null] },
        rows: { type: datatypes['integer-non-negative'] },
        wrap: { type: ['soft', 'hard', null] }
    }),
    content: models.text,
    contexts: models.phrasing
};

exports.keygen = {
    attrs: _.extend(common.attrs, {
        autofocus: { type: ['autofocus', null] }, // TODO: There must not be more than one element in the document with the autofocus attribute specified.
        challenge: { type: datatypes.string },
        disabled: { type: ['disabled', null] },
        form: { type: datatypes.IDREF }, // TODO: must be the id of a form
        keytype: { type: ['rsa'] },
        name: { type: datatypes.string },
    }),
    content: null,
    contexts: models.phrasing
};

exports.output = {
    attrs: _.extend(common.attrs, {
        for: { type: datatypes.IDREF }, // TODO: The for attribute, if specified, must contain a string consisting of an unordered set of unique space-separated tokens that are case-sensitive, each of which must have the value of an ID of an element in the same Document.
        form: { type: datatypes.IDREF }, // TODO: must be the id of a form
        name: { type: datatypes.string },
    }),
    content: models.phrasing,
    contexts: models.phrasing
};

exports.progress = {
    attrs: _.extend(common.attrs, {
        value: { type: datatypes.string },
        max: { type: datatypes.string }
    }),
    content: _.difference(models.phrasing, ['progress']),
    contexts: models.phrasing
};

exports.meter = {
    attrs: _.extend(common.attrs, {
        value: { type: datatypes.double }, // TODO: can doubles be validated as float?
        min: { type: datatypes.double },
        max: { type: datatypes.double },
        low: { type: datatypes.double },
        high: { type: datatypes.double },
        optimum: { type: datatypes.double }
    }),
    content: _.difference(models.phrasing, ['meter']),
    contexts: models.phrasing
};