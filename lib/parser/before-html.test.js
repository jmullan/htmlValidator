var utils = require('./parser.test'),
    _ = require('underscore'),
    Tree = require('./parser').Tree,
    should = require('should'),
    errors = require('../errors');

describe('before html', function () {
    describe('A DOCTYPE token', function () {
        utils.testDoctypeParseError(new Tree('<!doctype html>'), 'before html');
    });

    describe('A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE', function () {
        utils.testWhitespace((new Tree('<!doctype html>')), 'before html', true);
    });

    describe('A start tag whose tag name is "html"', function () {
        var tree = new Tree('<!doctype html><html>');

        it('Create an element for the token in the HTML namespace. Append it to the Document object. Put this element in the stack of open elements.', function () {
            should.equal(_.last(tree.documentNode).name, 'html');
            should.equal(_.last(tree.stack).name, 'html');
        });
        // TODO: If the Document is being loaded as part of navigation of a browsing context, then: if the newly created element has a manifest attribute whose value is not the empty string, then resolve the value of that attribute to an absolute URL, relative to the newly created element, and if that is successful, run the application cache selection algorithm with the resulting absolute URL with any <fragment> component removed; otherwise, if there is no such attribute, or its value is the empty string, or resolving its value fails, run the application cache selection algorithm with no manifest. The algorithm must be passed the Document object.
        it('Switch the insertion mode to "before head".', function () {
            should.strictEqual(tree.mode, 'before head');
        });
    });

    describe('An end tag whose tag name is one of: "head", "body", "html", "br", Anything else', function () {
        function test(tag, mode) {
            var tree = new Tree('<!doctype html></' + tag + '>'),
                stack;

            it('Create an html element. Append it to the Document object.', function () {
                should.strictEqual(tree.documentNode[0].name, 'html');
            });

            it('Put this element in the stack of open elements.', function () {
                should.strictEqual(tree.stack[0].name, 'html');
            });

            it('If the Document is being loaded as part of navigation of a browsing context, then: run the application cache selection algorithm with no manifest, passing it the Document object.', function () {
                // TODO: application cache selection alcorithm
            });

            it('Switch the insertion mode to "before head", then reprocess the current token.', function () {
                should.strictEqual(tree.mode, mode);
            });
        }
        // TODO: validate these modes
        describe('html', function () { test('html', 'in body'); });
        describe('head', function () { test('head', 'after head'); });
        describe('body', function () { test('body', 'in body'); });
        describe('br', function () { test('br', 'in body'); });
    });

    describe('Any other end tag', function () {
        var tree = new Tree('<!doctype html>'),
            token = { name: 'p', type: 'EndTag' };
        tree.process('before html', token);

        it('Parse error.', function () {
            should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
        });

        it('Ignore the token.', function () {
            should.deepEqual(tree.documentNode, []);
            should.deepEqual(tree.stack, []);
            should.strictEqual(tree.mode, 'before html');
        });
    });
});
