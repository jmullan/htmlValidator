var _ = require('underscore'),
    datatypes = require('./datatypes');

exports.attrs = {
    accesskey: {
        type: datatypes.keylabellist
    },
    class: {
        type: datatypes.tokens
    },
    contenteditable: {
        type: ['true', 'false', null]
    },
    contextmenu: {
        type: datatypes.IDREF
    },
    dir: {
        type: ['ltr', 'rtl']
    },
    draggable: {
        type: ['true', 'false', null]
    },
    dropzone: {
        type: ['copy', 'move', 'link'], // TODO: space separated tokens
    },
    hidden: {
        type: ['hidden', null]
    },
    id: {
        type: datatypes.ID
    },
    lang: {
        type: datatypes.language
    },
    spellcheck: {
        type: ['true', 'false', null]
    },
    style: {
        type: datatypes.string // TODO
    },
    tabindex: {
        type: datatypes.integer
    },
    title: {
        type: datatypes.string // TODO
    },

    // microdata -- this stuff is actually really complex. we should revisit the spec on these
    // http://www.whatwg.org/specs/web-apps/current-work/multipage/microdata.html#encoding-microdata
    itemid: {
        type: datatypes.URL
    },
    itemprop: {
        type: datatypes.microdataIdentifier // TODO
    },
    itemref: {
        type: datatypes.IDREF
    },
    itemscope: {
        type: ['itemscope', null]
    },
    itemtype: {
        type: datatypes.URL
    },

    // event handler content attributes
    onabort: {
        type: datatypes.string
    },
    onblur: {
        type: datatypes.string
    },
    oncanplay: {
        type: datatypes.string
    },
    oncanplaythrough: {
        type: datatypes.string
    },
    onchange: {
        type: datatypes.string
    },
    onclick: {
        type: datatypes.string
    },
    oncontextmenu: {
        type: datatypes.string
    },
    oncuechange: {
        type: datatypes.string
    },
    ondblclick: {
        type: datatypes.string
    },
    ondrag: {
        type: datatypes.string
    },
    ondragend: {
        type: datatypes.string
    },
    ondragenter: {
        type: datatypes.string
    },
    ondragleave: {
        type: datatypes.string
    },
    ondragover: {
        type: datatypes.string
    },
    ondragstart: {
        type: datatypes.string
    },
    ondrop: {
        type: datatypes.string
    },
    ondurationchange: {
        type: datatypes.string
    },
    onemptied: {
        type: datatypes.string
    },
    onended: {
        type: datatypes.string
    },
    onerror: {
        type: datatypes.string
    },
    onfocus: {
        type: datatypes.string
    },
    oninput: {
        type: datatypes.string
    },
    oninvalid: {
        type: datatypes.string
    },
    onkeydown: {
        type: datatypes.string
    },
    onkeypress: {
        type: datatypes.string
    },
    onkeyup: {
        type: datatypes.string
    },
    onload: {
        type: datatypes.string
    },
    onloadeddata: {
        type: datatypes.string
    },
    onloadedmetadata: {
        type: datatypes.string
    },
    onloadstart: {
        type: datatypes.string
    },
    onmousedown: {
        type: datatypes.string
    },
    onmousemove: {
        type: datatypes.string
    },
    onmouseout: {
        type: datatypes.string
    },
    onmouseover: {
        type: datatypes.string
    },
    onmouseup: {
        type: datatypes.string
    },
    onmousewheel: {
        type: datatypes.string
    },
    onpause: {
        type: datatypes.string
    },
    onplay: {
        type: datatypes.string
    },
    onplaying: {
        type: datatypes.string
    },
    onprogress: {
        type: datatypes.string
    },
    onratechange: {
        type: datatypes.string
    },
    onreadystatechange: {
        type: datatypes.string
    },
    onreset: {
        type: datatypes.string
    },
    onscroll: {
        type: datatypes.string
    },
    onseeked: {
        type: datatypes.string
    },
    onseeking: {
        type: datatypes.string
    },
    onselect: {
        type: datatypes.string
    },
    onshow: {
        type: datatypes.string
    },
    onstalled: {
        type: datatypes.string
    },
    onsubmit: {
        type: datatypes.string
    },
    onsuspend: {
        type: datatypes.string
    },
    ontimeupdate: {
        type: datatypes.string
    },
    onvolumechange: {
        type: datatypes.string
    },
    onwaiting: {
        type: datatypes.string
    },
};