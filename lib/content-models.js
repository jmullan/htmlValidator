var _ = require('underscore');

exports.flow = [
    'a',
    'abbr',
    'address',
    'area',
    'article',
    'aside',
    'audio',
    'b',
    'bdi',
    'bdo',
    'blockquote',
    'br',
    'button',
    'canvas',
    'cite',
    'code',
    'command',
    'datalist',
    'del',
    'details',
    'dfn',
    'div',
    'dl',
    'em',
    'embed',
    'fieldset',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'hgroup',
    'hr',
    'i',
    'iframe',
    'img',
    'input',
    'ins',
    'kbd',
    'keygen',
    'label',
    'link',
    'map',
    'mark',
    'math',
    'menu',
    'meta',
    'meter',
    'nav',
    'noscript',
    'object',
    'ol',
    'output',
    'p',
    'pre',
    'progress',
    'q',
    'ruby',
    's',
    'samp',
    'script',
    'section',
    'select',
    'small',
    'span',
    'strong',
    'style',
    'sub',
    'sup',
    'svg',
    'table',
    'textarea',
    'time',
    'u',
    'ul',
    'var',
    'video',
    'wbr',
    'text'
];

exports.sectioning = [
    'article',
    'aside',
    'nav',
    'section'
];

exports.heading = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hgroup'
];

exports.phrasing = [
    'a',
    'abbr',
    'area',
    'audio',
    'b',
    'bdi',
    'bdo',
    'br',
    'button',
    'canvas',
    'cite',
    'code',
    'command',
    'datalist',
    'del',
    'dfn',
    'em',
    'embed',
    'i',
    'iframe',
    'img',
    'input',
    'ins',
    'kbd',
    'keygen',
    'label',
    'link',
    'map',
    'mark',
    'math',
    'meta',
    'meter',
    'noscript',
    'object',
    'output',
    'progress',
    'q',
    'ruby',
    's',
    'samp',
    'script',
    'select',
    'small',
    'span',
    'strong',
    'sub',
    'sup',
    'svg',
    'textarea',
    'time',
    'u',
    'var',
    'video',
    'wbr',
    'text'
];

exports.embedded = [
    'audio',
    'canvas',
    'embed',
    'iframe',
    'img',
    'math',
    'object',
    'svg',
    'video'
];

exports.interactive = [
    'a',
    'audio',
    'button',
    'details',
    'embed',
    'iframe',
    'img',
    'input',
    'keygen',
    'label',
    'menu',
    'object',
    'select',
    'textarea',
    'video'
];

exports.metadata = [
    'base',
    'command',
    'link',
    'meta',
    'noscript',
    'script',
    'style',
    'title',
];

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/content-models.html#transparent
exports.transparent = function (token) {
    if (!token || !token.token.context) {
        return [];
    }


    var content = token.token.context.rules.content;
    if (typeof content === 'function') {
        content = content(token.context);
    }
    return content;
};

// @discussion: http://www.whatwg.org/specs/web-apps/current-work/multipage/content-models.html#text-content
exports.text = function (nodes) {
    return true;
};
