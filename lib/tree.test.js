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

exports.initial = testCase({
    setUp: function (callback) {
        callback();
    },

    whitespace: function (test) {
        testWhitespace(test, (new Tree(' ')), 'initial', true);
        test.done();
    },

    comment: function (test) {
        testComment(test, (new Tree(' ')), 'initial');
        test.done();
    },

    doctype: function (test) {
        // FIXME: doctype initial
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

    doctype: function (test) {
        testDoctypeParseError(test, this.tree, 'before html');
        test.done();
    },

    whitespace: function (test) {
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

    whitespace: function (test) {
        testWhitespace(test, this.tree, 'before head', true);
        test.done();
    },

    comment: function (test) {
        testComment(test, this.tree, 'before head');
        test.done();
    },

    doctype: function (test) {
        testDoctypeParseError(test, this.tree, 'before head');
        test.done();
    },

    'A start tag whose tag name is "html"': function (test) {
        this.tree = new Tree('<!doctype html>');
        this.tree.tokens = [];
        this.tree.mode = 'before head';
        var token = { type: 'StartTag', name: 'html' };
        this.tree['before head'](token);
        test.deepEqual(this.tree.errors[0], (new errors.ParseError(token)), 'parse error');
        test.deepEqual(this.tree.tokens, [], 'ignore the token');
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

    whitespace: function (test) {
        testWhitespace(test, this.tree, 'in head');
        test.done();
    },

    doctype: function (test) {
        testDoctypeParseError(test, this.tree, 'in head');
        test.done();
    },

    'A start tag whose tag name is "html"': function (test) {
        var token = { name: 'html', type: 'StartTag' };
        this.tree['in head'](token);
        test.deepEqual(_.last(this.tree.errors), (new errors.ParseError(token)));
        test.done();
    },

    'A start tag whose tag name is one of: "base", "basefont", "bgsound", "command", "link"': function (test) {
        var self = this;
        function testTag(tag) {
            self.tree['in head']({ name: tag, type: 'StartTag' });
            test.strictEqual(_.last(_.last(self.tree.stack).content).name, tag, tag + ' - tag name');
            // TODO: Acknowledge the token's self-closing flag, if it is set.
        }
        testTag('base');
        testTag('basefont');
        testTag('bgsound');
        testTag('command');
        testTag('link');
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

exports['in head no script'] = testCase({
    // TODO: 'in head no script'
});

exports['after head'] = testCase({
    setUp: function (callback) {
        this.tree = new Tree('<!doctype html><html><head></head>');
        this.tree.tokens = [];
        this.tree.mode = 'after head';
        callback();
    },

    whitespace: function (test) {
        testWhitespace(test, this.tree, 'after head');
        test.done();
    },

    comment: function (test) {
        testComment(test, this.tree, 'after head');
        test.done();
    },

    doctype: function (test) {
        testDoctypeParseError(test, this.tree, 'after head');
        test.done();
    }
});
