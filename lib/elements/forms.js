var _ = require('underscore'),
    common = require('../common'),
    models = require('../content-models'),
    datatypes = require('../datatypes');

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/forms.html#the-form-element
exports.form = {
    attrs: _.extend({}, common.attrs, {
        'accept-charset': { type: function (input) {
            return datatypes['string-tokens-unordered'](input, datatypes.charset);
        }},
        action: { type: datatypes.URL },
        autocomplete: { type: ['on', 'off', null] },
        enctype: { type: ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'] },
        method: { type: ['get', 'post'] },
        name: { type: datatypes.string }, // TODO: The name attribute represents the form's name within the forms collection. The value must not be the empty string, and the value must be unique amongst the form elements in the forms collection that it is in, if any.
        novalidate: { type: ['novalidate', null] },
        target: { type: datatypes['browsing-context'] }
    }),
    content: _.difference(models.flow, ['form']),
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/forms.html#the-fieldset-element
exports.fieldset = {
    attrs: _.extend({}, common.attrs, {
        disabled: { type: ['disabled', null] },
        form: { type: datatypes.IDREF }, // TODO: must be the id of a form
        name: { type: datatypes.string }
    }),
    content: _.union(models.flow, ['legend']), // TODO: legend must come first
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/forms.html#the-legend-element
exports.legend = {
    attrs: common.attrs,
    content: models.phrasing,
    context: ['fieldset']
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/forms.html#the-label-element
exports.label = {
    attrs: _.extend({}, common.attrs, {
        form: { type: datatypes.IDREF }, // TODO: must be the id of a form
        for: { type: datatypes.IDREF }, // TODO: must be the id of a labelable element
    }),
    content: _.difference(models.phrasing, ['label']), // TODO: Phrasing content, but with no descendant labelable elements unless it is the element's labeled control, and no descendant label elements.
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#the-input-element
exports.input = {
    attrs: _.extend({}, common.attrs, {
        accept: { type: function (input) {
            return datatypes['comma-tokens'](input, function (token, tokens) {
                return datatypes['mime-type'](token) || _.indexOf(['audio/*', 'video/*', 'image/*'], token) !== -1;
            });
        }},
        alt: { type: datatypes.string }, // TODO: required if using src attribute
        autocomplete: { type: ['on', 'off', null] },
        autofocus: { type: ['autofocus', null] }, // TODO: There must not be more than one element in the document with the autofocus attribute specified.
        checked: { type: ['checked', null] },
        dirname: { type: ['ltr', 'rtl'] },
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
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-button-element.html#the-button-element
exports.button = {
    attrs: _.extend({}, common.attrs, {
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
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-button-element.html#the-select-element
exports.select = {
    attrs: _.extend({}, common.attrs, {
        autofocus: { type: ['autofocus', null] }, // TODO: There must not be more than one element in the document with the autofocus attribute specified.
        disabled: { type: ['disabled', null] },
        form: { type: datatypes.IDREF }, // TODO: must be the id of a form
        multiple: { type: ['multiple', null] },
        name: { type: datatypes.string },
        required: { type: ['required', null] },
        size: { type: datatypes['integer-non-negative'] }
    }),
    content: ['option', 'optgroup'],
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-button-element.html#the-datalist-element
exports.datalist = {
    attrs: common.attrs,
    content: function (token) {
        if (_.indexOf(token.content, 'option') !== -1) {
            return ['option'];
        }
        return models.phrasing;
    },
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-button-element.html#the-optgroup-element
exports.optgroup = {
    attrs: _.extend({}, common.attrs, {
        disabled: { type: ['disabled', null] },
        label: { type: datatypes.string, required: true }
    }),
    content: ['option'],
    context: ['select']
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-button-element.html#the-option-element
exports.option = {
    attrs: _.extend({}, common.attrs, {
        disabled: { type: ['disabled', null] },
        label: { type: datatypes.string },
        selected: { type: ['selected', null] }, // TODO: A select element whose multiple attribute is not specified must not have more than one descendant option element with its selected attribute set.
        value: { type: datatypes.string }
    }),
    content: models.text,
    context: ['select', 'datalist', 'optgroup']
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-button-element.html#the-textarea-element
exports.textarea = {
    attrs: _.extend({}, common.attrs, {
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
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-button-element.html#the-keygen-element
exports.keygen = {
    attrs: _.extend({}, common.attrs, {
        autofocus: { type: ['autofocus', null] }, // TODO: There must not be more than one element in the document with the autofocus attribute specified.
        challenge: { type: datatypes.string },
        disabled: { type: ['disabled', null] },
        form: { type: datatypes.IDREF }, // TODO: must be the id of a form
        keytype: { type: ['rsa'] },
        name: { type: datatypes.string },
    }),
    content: null,
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-button-element.html#the-output-element
exports.output = {
    attrs: _.extend({}, common.attrs, {
        for: { type: function (input) {
            return datatypes['space-tokens-unordered'](input, datatypes.IDREF);
        }},
        form: { type: datatypes.IDREF }, // TODO: must be the id of a form
        name: { type: datatypes.string },
    }),
    content: models.phrasing,
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-button-element.html#the-progress-element
exports.progress = {
    attrs: _.extend({}, common.attrs, {
        value: { type: datatypes.string },
        max: { type: datatypes.string }
    }),
    content: _.difference(models.phrasing, ['progress']),
    context: null
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-button-element.html#the-meter-element
exports.meter = {
    attrs: _.extend({}, common.attrs, {
        value: { type: datatypes.double }, // TODO: can doubles be validated as float?
        min: { type: datatypes.double },
        max: { type: datatypes.double },
        low: { type: datatypes.double },
        high: { type: datatypes.double },
        optimum: { type: datatypes.double }
    }),
    content: _.difference(models.phrasing, ['meter']),
    context: null
};
