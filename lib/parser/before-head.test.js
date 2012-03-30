var utils = require('./parser.test'),
    _ = require('underscore'),
    Tree = require('./parser').Tree,
    should = require('should'),
    errors = require('../errors');

describe('before head', function () {
    var content = '<!doctype html><html>';

    describe('A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE', function () {
        utils.testWhitespace((new Tree(content)), 'before head', true);
    });

    describe('A comment token', function () {
        utils.testComment((new Tree(content)), 'before head');
    });

    describe('A DOCTYPE token', function () {
        utils.testDoctypeParseError((new Tree(content)), 'before head');
    });

    describe('A start tag whose tag name is "html"', function () {
        utils.testHtmlInBody();
    });

    describe('A start tag whose tag name is "head"', function () {
        var token = { type: 'StartTag', name: 'head' },
            tree = new Tree(content),
            element;
        tree.process('before head', token);
        element = _.last(tree.stack);

        it('Insert an HTML element for the token.', function () {
            should.strictEqual(element.name, 'head');
        });

        it('Set the head element pointer to the newly created head element.', function () {
            should.strictEqual(tree.pointers.head, element);
        });

        it('Switch the insertion mode to "in head".', function () {
            should.strictEqual(tree.mode, 'in head');
        });
    });

    describe('An end tag whose tag name is one of: "head", "body", "html", "br", Anything else', function () {
        function test(tag, mode) {
            var tree = new Tree(content + '</' + tag + '>');

            it('Act as if a start tag token with the tag name "head" and no attributes had been seen, then reprocess the current token.', function () {
                should.strictEqual(tree.documentNode[0].content[0].name, 'head');
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
        var token = { name: 'p', type: 'EndTag' },
            tree = new Tree(content);
        tree.process('before head', token);

        it('Parse error.', function () {
            should.deepEqual(tree.errors[0], (new errors.ParseError(token)), 'parse error');
        });

        it('Ignore the token.', function () {
            should.equal(_.last(tree.stack).name, 'html', 'empty stack');
            should.strictEqual(tree.mode, 'before head');
        });
    });
});
