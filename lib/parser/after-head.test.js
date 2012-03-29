var utils = require('./parser.test'),
    _ = require('underscore'),
    Tree = require('./parser').Tree,
    should = require('should'),
    errors = require('../errors');

describe('after head', function () {
    var content = '<!doctype html><html foo="bar"><head></head>';

    describe('A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE', function () {
        utils.testWhitespace((new Tree(content)), 'after head');
    });

    describe('A comment token', function () {
        utils.testComment((new Tree(content)), 'after head');
    });

    describe('A DOCTYPE token', function () {
        utils.testDoctypeParseError((new Tree(content)), 'after head');
    });

    describe('A start tag whose tag name is "html"', function () {
        utils.testHtmlInBody('<head></head>');
    });

    describe('A start tag whose tag name is "body"', function () {
        var tree = new Tree(content + '<body>');

        it('Insert an HTML element for the token.', function () {
            should.strictEqual(_.last(tree.stack).name, 'body');
        });

        it('Set the frameset-ok flag to "not ok".', function () {
            should.strictEqual(tree.flags['frameset-ok'], false);
        });

        it('Switch the insertion mode to "in body".', function () {
            should.strictEqual(tree.mode, 'in body');
        });
    });

    describe('A start tag whose tag name is "frameset"', function () {
        var tree = new Tree(content + '<frameset>');

        it('Insert an HTML element for the token.', function () {
            should.strictEqual(_.last(tree.stack).name, 'frameset');
        });

        it('Switch the insertion mode to "in frameset".', function () {
            should.strictEqual(tree.mode, 'in frameset');
        });
    });

    describe('A start tag token whose tag name is one of: "base", "basefont", "bgsound", "link", "meta", "noframes", "script", "style", "title"', function () {
        it('Parse error.', function () {
            _.each(['base', 'basefont', 'bgsound', 'link', 'meta', 'noframes', /* TODO: 'script',*/ 'style', 'title'], function (tag) {
                var tree = new Tree(content),
                    token = { name: tag, type: 'StartTag' };

                tree['after head'](token);

                should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
            });
        });

        it('Append to the node pointed to by the head element pointer.', function () {
            _.each(['base', 'basefont', 'bgsound', 'link', 'meta', 'noframes', /* TODO: 'script',*/ 'style', 'title'], function (tag) {
                var tree = new Tree(content + '<' + tag + '>');
                // Push the node pointed to by the head element pointer onto the stack of open elements.
                // Process the token using the rules for the "in head" insertion mode.
                // Remove the node pointed to by the head element pointer from the stack of open elements.
                should.strictEqual(_.last(tree.pointers.head.content).name, tag);
            });
        });
    });

    describe('An end tag whose tag name is one of: "body", "html", "br"; Anything else', function () {
        it('Act as if a start tag token with the tag name "body" and no attributes had been seen, then set the frameset-ok flag back to "ok", and then reprocess the current token.', function () {
            _.each(['body', 'html', 'br'], function (tag) {
                var tree = new Tree('<!doctype html><html foo="bar"><head></head></' + tag + '>');

                should.strictEqual(tree.documentNode[0].content[1].name, 'body');
                // should.strictEqual(tree.flags['frameset-ok'], true);
                // TODO: test reprocess the current token
            });
        });
    });

    describe('A start tag whose tag name is "head"; Any other end tag', function () {
        it('Parse error.', function () {
            _.each(['head', 'p', 'li'], function (tag) {
                var tree = new Tree(content),
                    stack = _.clone(tree.stack),
                    token = { name: tag, type: 'EndTag' };

                tree['after head'](token);
                should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
            });
        });

        it('Ignore the token.', function () {
            _.each(['head', 'p', 'li'], function (tag) {
                var tree = new Tree(content),
                    stack = _.clone(tree.stack),
                    token = { name: tag, type: 'EndTag' };

                tree['after head'](token);
                should.notStrictEqual(_.last(tree.stack).name, tag);
            });
        });
    });
});
