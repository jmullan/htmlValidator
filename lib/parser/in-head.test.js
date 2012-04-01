var utils = require('./parser.test'),
    _ = require('underscore'),
    Tree = require('./parser').Tree,
    should = require('should'),
    errors = require('../errors');

describe('in head', function () {
    var content = '<!doctype html><html><head>';

    describe('A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE', function () {
        utils.testWhitespace((new Tree(content)), 'in head');
    });

    describe('A DOCTYPE token', function () {
        utils.testDoctypeParseError((new Tree(content)), 'in head');
    });

    describe('A start tag whose tag name is "html"', function () {
        utils.testHtmlInBody('<head>');
    });

    describe('A start tag whose tag name is one of: "base", "basefont", "bgsound", "command", "link"', function () {
        it('Insert an HTML element for the token. Immediately pop the current node off the stack of open elements.', function () {
            _.each(['base', 'basefont', 'bgsound', 'command', 'link'], function (tag) {
                var tree = new Tree(content + '<' + tag + '>');
                should.strictEqual(utils.getLastNode(_.last(tree.stack).content).name, tag);
            });
        });

        it('Acknowledge the token\'s self-closing flag, if it is set.', function () {
            _.each(['base', 'basefont', 'bgsound', 'command', 'link'], function (tag) {
                var tree = new Tree(content + '<' + tag + '>');
                // TODO: Acknowledge the token's self-closing flag, if it is set.
            });
        });
    });

    describe('A start tag whose tag name is "meta"', function () {
        var tree = new Tree(content + '<meta>');

        it('Insert an HTML element for the token. Immediately pop the current node off the stack of open elements.', function () {
            should.strictEqual(_.last(_.last(tree.stack).content).name, 'meta');
        });

        it('Acknowledge the token\'s self-closing flag, if it is set.', function () {
            // TODO: Acknowledge the token's self-closing flag, if it is set.
        });
        // TODO: If the element has a charset attribute, and its value is either a supported ASCII-compatible character encoding or a UTF-16 encoding, and the confidence is currently tentative, then change the encoding to the encoding given by the value of the charset attribute.
        // TODO: Otherwise, if the element has an http-equiv attribute whose value is an ASCII case-insensitive match for the string "Content-Type", and the element has a content attribute, and applying the algorithm for extracting an encoding from a meta element to that attribute's value returns a supported ASCII-compatible character encoding or a UTF-16 encoding, and the confidence is currently tentative, then change the encoding to the extracted encoding.
    });

    describe('A start tag whose tag name is "title"', function () {
        // TODO: Follow the generic RCDATA element parsing algorithm.
    });

    describe('A start tag whose tag name is "noscript", if the scripting flag is enabled. A start tag whose tag name is one of: "noframes", "style"', function () {
        // TODO: Follow the generic raw text element parsing algorithm.
    });

    describe('A start tag whose tag name is "noscript", if the scripting flag is disabled', function () {
        // TODO: Insert an HTML element for the token.
        // TODO: Switch the insertion mode to "in head noscript".
    });

    describe('A start tag whose tag name is "script"', function () {
        // TODO: lots
    });

    describe('An end tag whose tag name is "head"', function () {
        var tree = new Tree(content + '</head>');

        it('Pop the current node (which will be the head element) off the stack of open elements.', function () {
            should.strictEqual(_.last(tree.stack).name, 'html');
        });

        it('Switch the insertion mode to "after head".', function () {
            should.strictEqual(tree.mode, 'after head');
        });
    });

    describe('An end tag whose tag name is one of: "body", "html", "br". Anything else.', function () {
        function testEndTag(tag, mode, last) {
            var tree = new Tree('<!doctype html><html><head></' + tag + '>');

            it('Act as if an end tag token with the tag name "head" had been seen', function () {
                should.strictEqual(tree.documentNode[0].content[0].name, 'head');
            });

            it('Reprocess the current token.', function () {
                should.strictEqual(utils.getLastNode(tree.documentNode).name, last || tag);
                should.strictEqual(tree.mode, mode);
            });
        }
        // TODO: verify these
        describe('body', function () { testEndTag('body', 'after body'); });
        describe('html', function () { testEndTag('html', 'in body', 'body'); });
        describe('br', function () { testEndTag('br', 'in body', 'body'); });
    });

    describe('A start tag whose tag name is "head". Any other end tag', function () {
        var tree = new Tree('<!doctype html><html><head>'),
            token = { type: 'StartTag', name: 'head' };
        tree.process('in head', token);

        it('Parse error.', function () {
            should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
        });

        it('Ignore the token.', function () {
            should.deepEqual(_.last(tree.stack).content, [], 'ignore the token');
        });
    });
});
