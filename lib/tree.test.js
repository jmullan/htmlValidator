var _ = require('underscore'),
    Tree = require('./tree').Tree,
    util = require('util'),
    testCase = require('nodeunit').testCase,
    errors = require('./errors');

exports.initial = testCase({
    setUp: function (callback) {
        callback();
    },

    whitespace: function (test) {
        test.strictEqual((new Tree(' ')).mode, 'initial', 'space stays in initial');
        test.strictEqual((new Tree('\n')).mode, 'initial', 'newline stays in initial');
        test.strictEqual((new Tree('\t')).mode, 'initial', 'tab stays in initial');
        test.strictEqual((new Tree('\r')).mode, 'initial', 'carriage stays in initial');
        test.strictEqual((new Tree('\f')).mode, 'initial', 'feed stays in initial');
        test.done();
    },

    comment: function (test) {
        var tree = new Tree('<!-- foo -->');
        test.strictEqual(tree.mode, 'initial', 'comment stays in initial');
        test.deepEqual(tree.documentNode[0], {
            name: '',
            type: 'comment',
            data: ' foo ',
            attributes: [],
            selfClosing: false
        }, 'comment inserted into documentNode');
        test.deepEqual(tree.tokens, [], 'no tokens');
        test.done();
    },

    doctype: function (test) {
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
        var token = { type: 'DOCTYPE', name: 'html' };
        this.tree['before html'](token);
        test.deepEqual(this.tree.errors[0], (new errors.ParseError(token)), 'parse error');
        test.deepEqual(this.tree.tokens, [], 'ignore the token');
        test.done();
    },

    whitespace: function (test) {
        var self = this;
        function testWhitespace(input, message) {
            self.tree['before html'](input);
            test.strictEqual(self.tree.mode, 'before html', message + ' - stays in mode');
            test.deepEqual(self.tree.tokens, [], message + ' - no tokens created');
        }
        testWhitespace(' ', 'SPACE');
        testWhitespace('\f', 'FF');
        testWhitespace('\t', 'TABULATION');
        testWhitespace('\r', 'CR');
        testWhitespace('\n', 'LF');
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
        var self = this;
        function testEndTag(tag, mode) {
            self.tree.mode = 'before html';
            self.tree['before html']({ name: tag, type: 'EndTag' });
            test.strictEqual(_.last(self.tree.documentNode).name, tag, tag + ' - in documentNode');
            // TODO: If the Document is being loaded as part of navigation of a browsing context, then: run the application cache selection algorithm with no manifest, passing it the Document object.
            test.strictEqual(self.tree.mode, mode, tag + ' - ' + mode);
        }
        // TODO: validate these modes
        testEndTag('head', 'after head');
        testEndTag('body', 'in head');
        testEndTag('html', 'in head');
        testEndTag('br', 'in head');
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

// exports.foo = function (test) {
//     var tree = new Tree('<!DOCTYPE html><html><head></head><body id="foo" class="bar"><button><p>baz<br />monkey</p><p>foo</p></button></body></html>');
//     console.log(util.inspect(tree.documentNode, null, 10));
//     test.done();
// }
