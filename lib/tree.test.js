var _ = require('underscore'),
    Tree = require('./tree').Tree,
    util = require('util'),
    testCase = require('nodeunit').testCase,
    errors = require('./errors');

function getLastNode(node) {
    var last = _.last(node);
    while (last.hasOwnProperty('content') && last.content.length) {
        last = _.last(last.content);
    }
    return last;
}

function testDoctypeParseError(test, tree, mode) {
    var token = { type: 'DOCTYPE', name: 'html' },
        last = _.last(tree.stack);
    tree[mode](token);
    test.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
    test.strictEqual(_.last(tree.stack), last, 'ignore the token');
}

function testWhitespace(test, tree, mode, ignored) {
    var chars = {
            'SPACE': ' ',
            'FF': '\f',
            'TABULATION': '\t',
            'CR': '\r',
            'LF': '\n'
        },
        last = _.last(tree.stack),
        content = '';
    _.each(chars, function (input, key) {
        tree[mode](input);
        test.strictEqual(tree.mode, mode, mode + ': ' + key + ' - stays in mode');
        if (ignored) {
            test.strictEqual(last, _.last(tree.stack), mode + ': ' + key + ' - no tokens created');
        } else {
            test.strictEqual(getLastNode(tree.stack), content += input);
        }
    });
}

function testComment(test, tree, mode) {
    var token = { type: 'comment', data: 'foo' },
        last = _.last(tree.stack);
    tree[mode](token);
    test.strictEqual(tree.mode, mode, 'comment stays in ' + mode);
    test.deepEqual(getLastNode(tree.documentNode), token, 'comment inserted into tree');
    test.strictEqual(_.last(tree.stack), last, 'no token added to stack');
}

function testHtmlInBody(test) {
    var tree = new Tree('<!doctype html><html foo="bar"><head></head>'),
        attr = [{ name: 'bar', value: 'foo' }, { name: 'foo', value: 'nope' }],
        token = { name: 'html', attributes: attr, type: 'StartTag' };
    tree['in head'](token);
    test.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
    attr.reverse();
    attr[0].value = 'bar';
    test.deepEqual(tree.stack[0].attributes, attr);
}

function putElementInScope(tree, el, scope) {
    tree[tree.mode]({ type: 'StartTag', name: scope });
    tree[tree.mode]({ type: 'StartTag', name: el });
}

exports.initial = testCase({
    setUp: function (callback) {
        callback();
    },

    'A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE': function (test) {
        testWhitespace(test, (new Tree(' ')), 'initial', true);
        test.done();
    },

    'A comment token': function (test) {
        testComment(test, (new Tree(' ')), 'initial');
        test.done();
    },

    'A DOCTYPE token': function (test) {
        var tree = (new Tree('<!doctype html>'));
        test.strictEqual(tree.mode, 'before html');
        // FIXME: doctype initial for anything that isn't HTML5 doctype
        test.done();
    },

    'anything else': function (test) {
        test.strictEqual((new Tree('<p></p>')).mode, 'before html');
        test.done();
    }
});

exports['before html'] = testCase({
    setUp: function (callback) {
        this.tree = new Tree('<!doctype html>');
        this.tree.tokens = [];
        this.tree.mode = 'before html';
        callback();
    },

    'A DOCTYPE token': function (test) {
        testDoctypeParseError(test, this.tree, 'before html');
        test.done();
    },

    'A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE': function (test) {
        testWhitespace(test, this.tree, 'before html', true);
        test.done();
    },

    'A start tag whose tag name is "html"': function (test) {
        this.tree['before html']({ name: 'html', type: 'StartTag' });
        test.deepEqual(_.last(this.tree.documentNode).name, 'html');
        test.deepEqual(_.last(this.tree.stack).name, 'html');
        // TODO: If the Document is being loaded as part of navigation of a browsing context, then: if the newly created element has a manifest attribute whose value is not the empty string, then resolve the value of that attribute to an absolute URL, relative to the newly created element, and if that is successful, run the application cache selection algorithm with the resulting absolute URL with any <fragment> component removed; otherwise, if there is no such attribute, or its value is the empty string, or resolving its value fails, run the application cache selection algorithm with no manifest. The algorithm must be passed the Document object.
        test.strictEqual(this.tree.mode, 'before head');
        test.done();
    },

    'An end tag whose tag name is one of: "head", "body", "html", "br", Anything else': function (test) {
        var self = this,
            stack = _.clone(self.tree.stack);
        function testEndTag(tag, mode) {
            self.tree.mode = 'before html';
            self.tree.stack = stack;
            self.tree['before html']({ name: tag, type: 'EndTag' });
            test.strictEqual(_.last(self.tree.documentNode[0].content).name, tag, tag + ' - attached to document');
            // TODO: If the Document is being loaded as part of navigation of a browsing context, then: run the application cache selection algorithm with no manifest, passing it the Document object.
            test.strictEqual(self.tree.mode, mode, tag + ' - ' + mode);
        }
        // TODO: validate these modes
        testEndTag('head', 'after head');
        // testEndTag('body', 'in body');
        testEndTag('html', 'in body');
        // testEndTag('br', 'in body');
        test.done();
    },

    'Any other end tag': function (test) {
        var token = { name: 'p', type: 'EndTag' };
        this.tree['before html'](token);
        test.deepEqual(this.tree.errors[0], (new errors.ParseError(token)), 'parse error');
        test.deepEqual(this.tree.documentNode, [], 'empty documentNode');
        test.deepEqual(this.tree.stack, [], 'empty stack');
        test.strictEqual(this.tree.mode, 'before html');
        test.done();
    }
});

exports['before head'] = testCase({
    setUp: function (callback) {
        this.tree = new Tree('<!doctype html><html>');
        this.tree.tokens = [];
        this.tree.mode = 'before head';
        callback();
    },

    'A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE': function (test) {
        testWhitespace(test, this.tree, 'before head', true);
        test.done();
    },

    'A comment token': function (test) {
        testComment(test, this.tree, 'before head');
        test.done();
    },

    'A DOCTYPE token': function (test) {
        testDoctypeParseError(test, this.tree, 'before head');
        test.done();
    },

    'A start tag whose tag name is "html"': function (test) {
        delete this.tree;
        testHtmlInBody(test);
        test.done();
    },

    'A start tag whose tag name is "head"': function (test) {
        var token = { type: 'StartTag', name: 'head' },
            element;
        this.tree['before head'](token);
        element = _.last(this.tree.stack);
        test.strictEqual(element.name, 'head', 'head element created');
        test.strictEqual(this.tree.pointers.head, element, 'pointer is set');
        test.strictEqual(this.tree.mode, 'in head');
        test.strictEqual(_.last(this.tree.stack).name, 'head', 'head element in stack');
        test.done();
    },

    'An end tag whose tag name is one of: "head", "body", "html", "br", Anything else': function (test) {
        var self = this,
            stack = _.clone(self.tree.stack);
        function testEndTag(tag, mode) {
            self.tree.stack = stack;
            self.tree['before head']({ name: tag, type: 'EndTag' });
            test.strictEqual(_.last(self.tree.documentNode[0].content).name, tag, tag + ' - attached to document');
            test.strictEqual(self.tree.mode, mode, tag + ' - mode: ' + mode);
        }
        // TODO: validate these modes
        testEndTag('head', 'after head');
        // testEndTag('body', 'in body');
        // testEndTag('html', 'in body');
        // testEndTag('br', 'in body');
        test.done();
    },

    'Any other end tag': function (test) {
        var token = { name: 'p', type: 'EndTag' };
        this.tree['before head'](token);
        test.deepEqual(this.tree.errors[0], (new errors.ParseError(token)), 'parse error');
        test.deepEqual(_.last(this.tree.stack).name, 'html', 'empty stack');
        test.strictEqual(this.tree.mode, 'before head');
        test.done();
    }
});

exports['in head'] = testCase({
    setUp: function (callback) {
        this.tree = new Tree('<!doctype html><html><head>');
        this.tree.tokens = [];
        this.tree.mode = 'in head';
        callback();
    },

    'A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE': function (test) {
        testWhitespace(test, this.tree, 'in head');
        test.done();
    },

    'A DOCTYPE token': function (test) {
        testDoctypeParseError(test, this.tree, 'in head');
        test.done();
    },

    'A start tag whose tag name is "html"': function (test) {
        delete this.tree;
        testHtmlInBody(test);
        test.done();
    },

    'A start tag whose tag name is one of: "base", "basefont", "bgsound", "command", "link"': function (test) {
        var self = this;
        function testTag(tag) {
            self.tree['in head']({ name: tag, type: 'StartTag' });
            test.strictEqual(getLastNode(_.last(self.tree.stack).content).name, tag, tag + ' - tag name');
            // TODO: Acknowledge the token's self-closing flag, if it is set.
        }
        _.each(['base', 'basefont', 'bgsound', 'command', 'link'], testTag);
        test.done();
    },

    'A start tag whose tag name is "meta"': function (test) {
        this.tree['in head']({ name: 'meta', type: 'StartTag' });
        test.strictEqual(_.last(_.last(this.tree.stack).content).name, 'meta');
        // TODO: Acknowledge the token's self-closing flag, if it is set.
        // TODO: If the element has a charset attribute, and its value is either a supported ASCII-compatible character encoding or a UTF-16 encoding, and the confidence is currently tentative, then change the encoding to the encoding given by the value of the charset attribute.
        // TODO: Otherwise, if the element has an http-equiv attribute whose value is an ASCII case-insensitive match for the string "Content-Type", and the element has a content attribute, and applying the algorithm for extracting an encoding from a meta element to that attribute's value returns a supported ASCII-compatible character encoding or a UTF-16 encoding, and the confidence is currently tentative, then change the encoding to the extracted encoding.
        test.done();
    },

    'A start tag whose tag name is "title"': function (test) {
        // TODO: Follow the generic RCDATA element parsing algorithm.
        test.done();
    },

    'A start tag whose tag name is "noscript", if the scripting flag is enabled. A start tag whose tag name is one of: "noframes", "style"': function (test) {
        // TODO: Follow the generic raw text element parsing algorithm.
        test.done();
    },

    'A start tag whose tag name is "noscript", if the scripting flag is disabled': function (test) {
        // TODO: Insert an HTML element for the token.
        // TODO: Switch the insertion mode to "in head noscript".
        test.done();
    },

    'A start tag whose tag name is "script"': function (test) {
        // TODO: lots
        test.done();
    },

    'An end tag whose tag name is "head"': function (test) {
        this.tree['in head']({ name: 'head', type: 'EndTag' });
        test.strictEqual(_.last(this.tree.stack).name, 'html');
        test.strictEqual(this.tree.mode, 'after head');
        test.done();
    },

    'An end tag whose tag name is one of: "body", "html", "br". Anything else.': function (test) {
        function testEndTag(tag, created, mode) {
            var tree = new Tree('<!doctype html><html><head>');
            tree['in head']({ name: tag, type: 'EndTag' });
            test.strictEqual(_.last(tree.documentNode[0].content).name, created, tag + ' - ' + created + ' tag created');
            test.strictEqual(tree.mode, mode, tag + ' - mode: ' + mode);
        }
        // TODO: verify these
        testEndTag('body', 'body', 'in body');
        testEndTag('html', 'body', 'in body');
        testEndTag('br', 'body', 'in body');
        test.done();
    },

    'A start tag whose tag name is "head". Any other end tag': function (test) {
        var token = { name: 'head', type: 'StartTag' };
        this.tree['in head'](token);
        test.deepEqual(_.last(this.tree.errors), (new errors.ParseError(token)));
        test.deepEqual(_.last(this.tree.stack).content, [], 'ignore the token');
        test.done();
    }
});

// exports['in head no script'] = testCase({
//     // TODO: 'in head no script'
// });

exports['after head'] = testCase({
    setUp: function (callback) {
        this.tree = new Tree('<!doctype html><html foo="bar"><head></head>');
        this.tree.tokens = [];
        this.tree.mode = 'after head';
        callback();
    },

    'A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE': function (test) {
        testWhitespace(test, this.tree, 'after head');
        test.done();
    },

    'A comment token': function (test) {
        testComment(test, this.tree, 'after head');
        test.done();
    },

    'A DOCTYPE token': function (test) {
        testDoctypeParseError(test, this.tree, 'after head');
        test.done();
    },

    'A start tag whose tag name is "html"': function (test) {
        delete this.tree;
        testHtmlInBody(test);
        test.done();
    },

    'A start tag whose tag name is "body"': function (test) {
        this.tree['after head']({ name: 'body', type: 'StartTag' });
        test.strictEqual(_.last(this.tree.stack).name, 'body');
        test.strictEqual(this.tree.flags['frameset-ok'], false);
        test.strictEqual(this.tree.mode, 'in body');
        test.done();
    },

    'A start tag whose tag name is "frameset"': function (test) {
        this.tree['after head']({ name: 'frameset', type: 'StartTag' });
        test.strictEqual(_.last(this.tree.stack).name, 'frameset');
        test.strictEqual(this.tree.mode, 'in frameset');
        test.done();
    },

    'A start tag token whose tag name is one of: "base", "basefont", "bgsound", "link", "meta", "noframes", "script", "style", "title"': function (test) {
        var self = this;
        function testTag(tag) {
            var token = { name: tag, type: 'StartTag' };
            self.tree['after head'](token);
            test.deepEqual(_.last(self.tree.errors), (new errors.ParseError(token)), tag + ' - parse error');
            test.strictEqual(_.last(self.tree.pointers.head.content).name, tag);
        }
        _.each(['base', 'basefont', 'bgsound', 'link', 'meta', 'noframes', /* TODO: 'script',*/ 'style', 'title'], testTag);
        test.done();
    },

    'An end tag whose tag name is one of: "body", "html", "br"; Anything else': function (test) {
        var tree = new Tree('<!doctype html><html foo="bar"><head></head>'),
            token;
        function testEndTag(tag) {
            token = { name: tag, type: 'EndTag' };
            tree['after head'](token);
            test.strictEqual(tree.documentNode[0].content[1].name, 'body', tag + ' - body tag created');
            // test.strictEqual(tree.flags['frameset-ok'], true);
            // TODO: test reprocess the current token
        }
        _.each(['body', 'html', 'br'], testEndTag);
        test.done();
    },

    'A start tag whose tag name is "head"; Any other end tag': function (test) {
        var self = this;
        function testEndTags(tag) {
            var token = { name: tag, type: 'EndTag' };
            self.tree['after head'](token);
            test.deepEqual(_.last(self.tree.errors), (new errors.ParseError(token)), tag + ' - parse error');
        }
        _.each(['head', 'p', 'li'], testEndTags);
        test.done();
    }
});

exports['in body'] = testCase({
    setUp: function (callback) {
        this.tree = new Tree('<!doctype html><html foo="bar"><head></head><body>');
        this.tree.tokens = [];
        this.tree.mode = 'in body';
        callback();
    },

    'null character': function (test) {
        // FIXME: null characters don't pass jslint :-\, but this test passes
        // var nullchar = '\0';
        // this.tree['in body'](nullchar);
        // test.deepEqual(_.last(this.tree.errors), (new errors.ParseError(nullchar)));
        test.done();
    },

    'A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE': function (test) {
        testWhitespace(test, this.tree, 'in body');
        test.done();
    },

    'Any other character token': function (test) {
        var last = _.last(this.tree.stack),
            content = '';
        _.each(['a', 'b', 'c', '0', '$'], function (input) {
            this.tree.flags['frameset-ok'] = true;
            this.tree['in body'](input);
            test.strictEqual(this.tree.mode, 'in body', input + ' - stays in mode');
            test.strictEqual(getLastNode(this.tree.stack), content += input);
            test.ok(!this.tree.flags['frameset-ok']);
        }, this);
        test.done();
    },

    'A comment token': function (test) {
        testComment(test, this.tree, 'in body');
        test.done();
    },

    'A DOCTYPE token': function (test) {
        testDoctypeParseError(test, this.tree, 'after head');
        test.done();
    },

    'A start tag whose tag name is "html"': function (test) {
        delete this.tree;
        testHtmlInBody(test);
        test.done();
    },

    'A start tag token whose tag name is one of: "base", "basefont", "bgsound", "command", "link", "meta", "noframes", "script", "style", "title"': function (test) {
        // FIXME: duplication with 'in head' for same elements
        var self = this;
        function testTag(tag) {
            self.tree['in head']({ name: tag, type: 'StartTag' });
            test.strictEqual(getLastNode(_.last(self.tree.stack).content).name, tag, tag + ' - tag name');
            // TODO: Acknowledge the token's self-closing flag, if it is set.
        }
        _.each(['base', 'basefont', 'bgsound', 'command', 'link'], testTag);
        test.done();
    },

    'A start tag whose tag name is "body"': function (test) {
        var token = { type: 'StartTag', name: 'body', attributes: [{ name: 'foo', value: 'bar' }] };
        this.tree['in body'](token);
        test.deepEqual(_.last(this.tree.errors), (new errors.ParseError(token)), 'parse error');
        test.deepEqual(this.tree.stack[1].attributes, token.attributes, 'attributes merged');
        test.done();
    },

    'A start tag whose tag name is "frameset"': function (test) {
        var token = { type: 'StartTag', name: 'frameset' };
        this.tree['in body'](token);
        test.deepEqual(_.last(this.tree.errors), (new errors.ParseError(token)), 'parse error');
        // TODO: how does the frameset-ok flag get set to "ok"?
        // test.strictEqual(this.tree.stack.length, 3);
        // test.deepEqual(_.last(this.tree.stack).name, 'frameset');
        // test.strictEqual(this.tree.mode, 'in frameset');
        test.done();
    },

    'An end-of-file token': function (test) {
        delete this.tree;
        _.each(['dd', 'dt', 'li', 'p', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'body', 'html'], function (tag) {
            var tree = new Tree('<!doctype html><html><head></head><body><' + tag + '>');
            test.notDeepEqual(_.last(tree.errors), (new errors.ParseError({ type: 'EOF' })), tag + ' - should not create parse error');
        });
        _.each(['table', 'sup', 'b', 'pre'], function (tag) {
            var tree = new Tree('<!doctype html><html><head></head><body><' + tag + '>');
            test.deepEqual(_.last(tree.errors), (new errors.ParseError({ type: 'EOF' })), tag + ' - should create parse error');
        });
        test.done();
    },

    'An end tag whose tag name is "body"': function (test) {
        var token = { type: 'EndTag', name: 'body' };
        this.tree['in body'](token);
        test.strictEqual(this.tree.mode, 'after body');

        // TODO: how to test error cases?
        // If the stack of open elements does not have a body element in scope, this is a parse error; ignore the token.
        // Otherwise, if there is a node in the stack of open elements that is not either a dd element, a dt element, an li element, an optgroup element, an option element, a p element, an rp element, an rt element, a tbody element, a td element, a tfoot element, a th element, a thead element, a tr element, the body element, or the html element, then this is a parse error.
        test.done();
    },

    'An end tag whose tag name is "html"': function (test) {
        test.done();
    },

    'A start tag whose tag name is one of: "address", "article", "aside", "blockquote", "center", "details", "dir", "div", "dl", "fieldset", "figcaption", "figure", "footer", "header", "hgroup", "menu", "nav", "ol", "p", "section", "summary", "ul"': function (test) {
        function testTag(tag) {
            putElementInScope(this.tree, 'p', 'button');
            this.tree['in body']({ type: 'StartTag', name: tag });
            test.notStrictEqual(this.tree.stack[this.tree.stack.length - 2].name, 'p', tag + ' - p element ended');
            test.strictEqual(_.last(this.tree.stack).name, tag, tag + ' - element inserted');
        }
        _.each(['address', 'article', 'aside', 'blockquote', 'center', 'details', 'dir', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'header', 'hgroup', 'menu', 'nav', 'ol', 'p', 'section', 'summary', 'ul'], testTag, this);
        test.done();
    },

    'A start tag whose tag name is one of: "h1", "h2", "h3", "h4", "h5", "h6"': function (test) {
        var tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        function testHeading(tag) {
            var token = { type: 'StartTag', name: tag };
            putElementInScope(this.tree, 'p', ['button']);
            this.tree['in body'](token);
            test.strictEqual(_.last(this.tree.stack).name, tag, tag + ' - element inserted');
        }
        function testHeadingParseError(tag) {
            var token = { type: 'StartTag', name: tag };
            this.tree['in body'](token);
            test.deepEqual(_.last(this.tree.errors), (new errors.ParseError(token)), tag + ' - error');
        }
        _.each(tags, testHeading, this);
        _.each(tags, testHeadingParseError, this);
        test.done();
    },

    'A start tag whose tag name is one of: "pre", "listing"': function (test) {
        delete this.tree;
        function testTag(tag) {
            var tree = new Tree('<!doctype html><html><head></head><body><button><p><' + tag + '>\n'),
                last = _.last(tree.stack);
            test.notStrictEqual(tree.stack[tree.stack.length - 2].name, 'p', tag + ' - p element ended');
            test.strictEqual(last.name, tag, tag + ' - element inserted');
            test.deepEqual(last.content, [], tag + ' - ignores next newline');
            test.ok(!tree.flags['frameset-ok'], tag + ' - frameset-ok false');
        }
        _.each(['pre', 'listing'], testTag);
        test.done();
    },

    'A start tag whose tag name is "form"': function (test) {
        var token = { type: 'StartTag', name: 'form' };
        putElementInScope(this.tree, 'p', ['button']);
        test.ok(!this.tree.pointers.form);
        this.tree['in body'](token);
        test.notStrictEqual(this.tree.stack[this.tree.stack.length - 2].name, 'p', 'p element ended');
        test.strictEqual(_.last(this.tree.stack).name, 'form', 'form element inserted');
        test.ok(this.tree.pointers.form);

        this.tree['in body'](token);
        test.deepEqual(_.last(this.tree.errors), (new errors.ParseError(token)), 'parse error when pointer exists');
        test.notStrictEqual(this.tree.stack[this.tree.stack.length - 2].name, 'form', 'ignored new token');
        test.done();
    },

    'A start tag whose tag name is "li"': function (test) {
        test.done();
    },

    'A start tag whose tag name is one of: "dd", "dt"': function (test) {
        test.done();
    },

    'A start tag whose tag name is "plaintext"': function (test) {
        test.done();
    },

    'A start tag whose tag name is "button"': function (test) {
        test.done();
    },

    'An end tag whose tag name is one of: "address", "article", "aside", "blockquote", "button", "center", "details", "dir", "div", "dl", "fieldset", "figcaption", "figure", "footer", "header", "hgroup", "listing", "menu", "nav", "ol", "pre", "section", "summary", "ul"': function (test) {
        test.done();
    },

    'An end tag whose tag name is "form"': function (test) {
        test.done();
    },

    'An end tag whose tag name is "p"': function (test) {
        test.done();
    },

    'An end tag whose tag name is "li"': function (test) {
        test.done();
    },

    'An end tag whose tag name is one of: "dd", "dt"': function (test) {
        test.done();
    },

    'An end tag whose tag name is one of: "h1", "h2", "h3", "h4", "h5", "h6"': function (test) {
        test.done();
    },

    'An end tag whose tag name is "sarcasm"': function (test) {
        test.done();
    },

    'A start tag whose tag name is "a"': function (test) {
        test.done();
    },

    'A start tag whose tag name is one of: "b", "big", "code", "em", "font", "i", "s", "small", "strike", "strong", "tt", "u"': function (test) {
        test.done();
    },

    'A start tag whose tag name is "nobr"': function (test) {
        test.done();
    },

    'An end tag whose tag name is one of: "a", "b", "big", "code", "em", "font", "i", "nobr", "s", "small", "strike", "strong", "tt", "u"': function (test) {
        test.done();
    },

    'A start tag token whose tag name is one of: "applet", "marquee", "object"': function (test) {
        test.done();
    },

    'An end tag token whose tag name is one of: "applet", "marquee", "object"': function (test) {
        test.done();
    },

    'A start tag whose tag name is "table"': function (test) {
        test.done();
    },

    'A start tag whose tag name is one of: "area", "br", "embed", "img", "keygen", "wbr"': function (test) {
        test.done();
    },

    'A start tag whose tag name is "input"': function (test) {
        test.done();
    },

    'A start tag whose tag name is one of: "param", "source", "track"': function (test) {
        test.done();
    },

    'A start tag whose tag name is "hr"': function (test) {
        test.done();
    },

    'A start tag whose tag name is "image"': function (test) {
        test.done();
    },

    'A start tag whose tag name is "isindex"': function (test) {
        test.done();
    },

    'A start tag whose tag name is "textarea"': function (test) {
        test.done();
    },

    'A start tag whose tag name is "xmp"': function (test) {
        test.done();
    },

    'A start tag whose tag name is "iframe"': function (test) {
        test.done();
    },

    'A start tag whose tag name is "noembed"; A start tag whose tag name is "noscript", if the scripting flag is enabled': function (test) {
        test.done();
    },

    'A start tag whose tag name is "select"': function (test) {
        test.done();
    },

    'A start tag whose tag name is one of: "optgroup", "option"': function (test) {
        test.done();
    },

    'A start tag whose tag name is one of: "rp", "rt"': function (test) {
        test.done();
    },

    'An end tag whose tag name is "br"': function (test) {
        test.done();
    },

    'A start tag whose tag name is "math"': function (test) {
        test.done();
    },

    'A start tag whose tag name is "svg"': function (test) {
        test.done();
    },

    'A start tag whose tag name is one of: "caption", "col", "colgroup", "frame", "head", "tbody", "td", "tfoot", "th", "thead", "tr"': function (test) {
        test.done();
    },

    'Any other start tag': function (test) {
        test.done();
    },

    'Any other end tag': function (test) {
        test.done();
    }
});
