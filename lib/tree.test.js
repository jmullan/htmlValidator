var _ = require('underscore'),
    Tree = require('./tree').Tree,
    should = require('should'),
    errors = require('./errors'),
    util = require('util');

function getLastNode(node) {
    var last = _.last(node);
    while (last.hasOwnProperty('content') && last.content.length) {
        last = _.last(last.content);
    }

    return last;
}

function testDoctypeParseError(tree, mode) {
    var token, last;
    beforeEach(function () {
        token = { type: 'DOCTYPE', name: 'html' };
        last = _.last(tree.stack);
        tree[mode](token);
    });
    it('Parse error.', function () {
        should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
    });
    it('Ignore the token.', function () {
        should.strictEqual(_.last(tree.stack), last);
    });
}

function testWhitespace(tree, mode, ignored) {
    var chars = [' ', '\f', '\t', '\r', '\n'],
        last = _.last(tree.stack),
        content = '';
    if (ignored) {
        it('Ignore the token.', function () {
            _.each(chars, function (input) {
                tree[mode](input);
                should.strictEqual(_.last(tree.stack), last);
            });
        });
    } else {
        it('Reconstruct the active formatting elements, if any. Insert the token\'s character into the current node.', function () {
            _.each(chars, function (input) {
                tree[mode](input);
                content += input;
                should.strictEqual(getLastNode(tree.stack), content);
            });
        });
    }
}

function testComment(tree, mode) {
    it('Append a Comment node to the Document object with the data attribute set to the data given in the comment token.', function () {
        var token = { type: 'comment', data: 'foo' },
            last = _.last(tree.stack);
        tree[mode](token);
        should.strictEqual(tree.mode, mode);
        should.equal(getLastNode(tree.documentNode), token);
        should.strictEqual(_.last(tree.stack), last);
    });
}

function testHtmlInBody(content) {
    var tree = new Tree('<!doctype html><html foo="bar">' + (content || '')),
        attrs = [{ name: 'bar', value: 'foo' }, { name: 'foo', value: 'nope' }],
        token = { name: 'html', attributes: attrs, type: 'StartTag' };
    tree['in head'](token);

    it('Parse error.', function () {
        should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
    });

    it('For each attribute on the token, check to see if the attribute is already present on the top element of the stack of open elements. If it is not, add the attribute and its corresponding value to that element.', function () {
        attrs.reverse();
        attrs[0].value = 'bar';
        should.deepEqual(tree.stack[0].attributes, attrs);
    });
}

function putElementInScope(tree, el, scope) {
    tree[tree.mode]({ type: 'StartTag', name: scope });
    tree[tree.mode]({ type: 'StartTag', name: el });
}

describe('initial', function () {
    describe('A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE', function () {
        testWhitespace((new Tree(' ')), 'initial', true);
    });

    describe('A comment token', function () {
        testComment((new Tree(' ')), 'initial');
    });

    describe('A DOCTYPE token', function () {
        var tree = (new Tree('<!doctype html>'));
        // FIXME: doctype initial for anything that isn't HTML5 doctype
        it('switch the insertion mode to "before html"', function () {
            should.strictEqual(tree.mode, 'before html');
        });
    });

    describe('anything else', function () {
        it('switch the insertion mode to "before html", then reprocess the current token', function () {
            should.strictEqual((new Tree('<p></p>')).mode, 'before html');
        });
    });
});

describe('before html', function () {
    describe('A DOCTYPE token', function () {
        testDoctypeParseError(new Tree('<!doctype html>'), 'before html');
    });

    describe('A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE', function () {
        testWhitespace((new Tree('<!doctype html>')), 'before html', true);
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
        tree['before html'](token);

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

describe('before head', function () {
    var content = '<!doctype html><html>';

    describe('A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE', function () {
        testWhitespace((new Tree(content)), 'before head', true);
    });

    describe('A comment token', function () {
        testComment((new Tree(content)), 'before head');
    });

    describe('A DOCTYPE token', function () {
        testDoctypeParseError((new Tree(content)), 'before head');
    });

    describe('A start tag whose tag name is "html"', function () {
        testHtmlInBody();
    });

    describe('A start tag whose tag name is "head"', function () {
        var token = { type: 'StartTag', name: 'head' },
            tree = new Tree(content),
            element;
        tree['before head'](token);
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
        tree['before head'](token);

        it('Parse error.', function () {
            should.deepEqual(tree.errors[0], (new errors.ParseError(token)), 'parse error');
        });

        it('Ignore the token.', function () {
            should.equal(_.last(tree.stack).name, 'html', 'empty stack');
            should.strictEqual(tree.mode, 'before head');
        });
    });
});

describe('in head', function () {
    var content = '<!doctype html><html><head>';

    describe('A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE', function () {
        testWhitespace((new Tree(content)), 'in head');
    });

    describe('A DOCTYPE token', function () {
        testDoctypeParseError((new Tree(content)), 'in head');
    });

    describe('A start tag whose tag name is "html"', function () {
        testHtmlInBody('<head>');
    });

    describe('A start tag whose tag name is one of: "base", "basefont", "bgsound", "command", "link"', function () {
        it('Insert an HTML element for the token. Immediately pop the current node off the stack of open elements.', function () {
            _.each(['base', 'basefont', 'bgsound', 'command', 'link'], function (tag) {
                var tree = new Tree(content + '<' + tag + '>');
                should.strictEqual(getLastNode(_.last(tree.stack).content).name, tag);
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
        function testEndTag(tag, mode) {
            var tree = new Tree('<!doctype html><html><head></' + tag + '>');

            it('Act as if an end tag token with the tag name "head" had been seen', function () {
                should.strictEqual(tree.documentNode[0].content[0].name, 'head');
            });

            it('Reprocess the current token.', function () {
                should.strictEqual(getLastNode(tree.documentNode), tag);
                should.strictEqual(tree.mode, mode);
            });
        }
        // TODO: verify these
        describe('body', function () { testEndTag('body', 'in body'); });
        describe('html', function () { testEndTag('html', 'in body'); });
        describe('br', function () { testEndTag('br', 'in body'); });
    });

    describe('A start tag whose tag name is "head". Any other end tag', function () {
        var tree = new Tree('<!doctype html><html><head>'),
            token = { type: 'StartTag', name: 'head' };
        tree['in head'](token);

        it('Parse error.', function () {
            should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
        });

        it('Ignore the token.', function () {
            should.deepEqual(_.last(tree.stack).content, [], 'ignore the token');
        });
    });
});

describe('in head no script', function () {
    // TODO: 'in head no script'
});

describe('after head', function () {
    var content = '<!doctype html><html foo="bar"><head></head>';

    describe('A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE', function () {
        testWhitespace((new Tree(content)), 'after head');
    });

    describe('A comment token', function () {
        testComment((new Tree(content)), 'after head');
    });

    describe('A DOCTYPE token', function () {
        testDoctypeParseError((new Tree(content)), 'after head');
    });

    describe('A start tag whose tag name is "html"', function () {
        testHtmlInBody('<head></head>');
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

describe('in body', function () {
    var content = '<!doctype html><html foo="bar"><head></head><body>';

    describe('null character', function () {
        var tree = new Tree(content),
            nullchar = '\u0000';
        tree['in body'](nullchar);
        it('Parse error.', function () {
            should.deepEqual(_.last(tree.errors), (new errors.ParseError(nullchar)));
        });

        it('Ignore the token.', function () {
            should.deepEqual(_.last(tree.stack).content, []);
        });
    });

    describe('A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE', function () {
        testWhitespace((new Tree(content)), 'in body');
    });

    describe('Any other character token', function () {
        var tree = new Tree(content),
            c = '';

        it('Insert the token\'s character into the current node.', function () {
            _.each(['a', 'b', 'c', '0', '$'], function (input) {
                tree.flags['frameset-ok'] = true;
                tree['in body'](input);
                c += input;
                should.strictEqual(getLastNode(tree.stack), c);
            });
        });
        it('Set the frameset-ok flag to "not ok".', function () {
            _.each(['a', 'b', 'c', '0', '$'], function (input) {
                tree.flags['frameset-ok'] = true;
                tree['in body'](input);
                should.ok(!tree.flags['frameset-ok']);
            });
        });
    });

    describe('A comment token', function () {
        testComment((new Tree(content)), 'in body');
    });

    describe('A DOCTYPE token', function () {
        testDoctypeParseError((new Tree(content)), 'after head');
    });

    describe('A start tag whose tag name is "html"', function () {
        testHtmlInBody('<head></head><body>');
    });

    describe('A start tag token whose tag name is one of: "base", "basefont", "bgsound", "command", "link", "meta", "noframes", "script", "style", "title"', function () {
        // FIXME: duplication with 'in head' for same elements
        it('Process the token using the rules for the "in head" insertion mode.', function () {
            _.each(['base', 'basefont', 'bgsound', 'command', 'link'], function (tag) {
                var tree = new Tree(content + '<' + tag + '>');
                should.strictEqual(getLastNode(_.last(tree.stack).content).name, tag);
                // TODO: Acknowledge the token's self-closing flag, if it is set.
            });
        });
    });

    describe('A start tag whose tag name is "body"', function () {
        var tree = new Tree(content),
            token = { type: 'StartTag', name: 'body', attributes: [{ name: 'foo', value: 'bar' }] };
        tree['in body'](token);
        it('Parse error.', function () {
            should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
        });

        it('If the second element on the stack of open elements is not a body element, or, if the stack of open elements has only one node on it, then ignore the token. (fragment case)', function () {

        });

        it('Otherwise, set the frameset-ok flag to "not ok"; then, for each attribute on the token, check to see if the attribute is already present on the body element (the second element) on the stack of open elements, and if it is not, add the attribute and its corresponding value to that element.', function () {
            should.deepEqual(tree.stack[1].attributes, token.attributes);
        });
    });

    describe('A start tag whose tag name is "frameset"', function () {
        var tree = new Tree(content),
            token = { type: 'StartTag', name: 'frameset' };
        tree['in body'](token);

        it('Parse error.', function () {
            should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
        });
        // TODO: how does the frameset-ok flag get set to "ok"?
        // should.strictEqual(tree.stack.length, 3);
        // should.equal(_.last(tree.stack).name, 'frameset');
        // should.strictEqual(tree.mode, 'in frameset');
    });

    describe('An end-of-file token', function () {
        it('If there is a node in the stack of open elements that is not either a dd element, a dt element, an li element, a p element, a tbody element, a td element, a tfoot element, a th element, a thead element, a tr element, the body element, or the html element, then this is a parse error.', function () {
            _.each(['dd', 'dt', 'li', 'p', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'body', 'html'], function (tag) {
                var tree = new Tree('<!doctype html><html><head></head><body><' + tag + '>');
                if (tree.errors.length) {
                    should.notDeepEqual(_.last(tree.errors), (new errors.ParseError({ type: 'EOF' })));
                }
            });
            _.each(['table', 'sup', 'b', 'pre'], function (tag) {
                var tree = new Tree('<!doctype html><html><head></head><body><' + tag + '>');
                if (tree.errors.length) {
                    should.deepEqual(_.last(tree.errors), (new errors.ParseError({ type: 'EOF' })));
                }
            });
        });
    });

    describe('An end tag whose tag name is "body"', function () {
        var tree = new Tree(content + '</body>');

        it('Switch the insertion mode to "after body".', function () {
            should.strictEqual(tree.mode, 'after body');
        });

        it('If the stack of open elements does not have a body element in scope, this is a parse error; ignore the token.', function () {
            var tree = new Tree('<!doctype html><html foo="bar"><head></head>'),
                token = { type: 'EndTag', name: 'body' };
            tree['in body'](token);
            should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
        });

        it('Otherwise, if there is a node in the stack of open elements that is not either a dd element, a dt element, an li element, an optgroup element, an option element, a p element, an rp element, an rt element, a tbody element, a td element, a tfoot element, a th element, a thead element, a tr element, the body element, or the html element, then this is a parse error.', function () {
            var tags = ['dd', 'dt', 'li', 'optgroup', 'option', 'p', 'rp', 'rt', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'body', 'html'];
            _.each(tags, function (tag) {
                var tree = new Tree(content + '<' + tag + '></body>');
                should.ok(!_.find(tree.errors, function (err) { return err.type === 'EndTag' && err.name === 'body'; }));
            });
            _.each(['div', 'article', 'section'], function (tag) {
                var tree = new Tree(content + '<' + tag + '>'),
                    token = { type: 'EndTag', name: 'body' };
                tree['in body'](token);
                should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
            });
        });
    });

    describe('An end tag whose tag name is "html"', function () {
        // TODO
    });

    describe('A start tag whose tag name is one of: "address", "article", "aside", "blockquote", "center", "details", "dir", "div", "dl", "fieldset", "figcaption", "figure", "footer", "header", "hgroup", "menu", "nav", "ol", "p", "section", "summary", "ul"', function () {
        it('Insert an HTML element for the token.', function () {
            _.each(['address', 'article', 'aside', 'blockquote', 'center', 'details', 'dir', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'header', 'hgroup', 'menu', 'nav', 'ol', 'p', 'section', 'summary', 'ul'], function (tag) {
                var tree = new Tree(content + '<button><p><' + tag + '>');
                should.notStrictEqual(tree.stack[tree.stack.length - 2].name, 'p');
                should.strictEqual(_.last(tree.stack).name, tag);
            });
        });
    });

    describe('A start tag whose tag name is one of: "h1", "h2", "h3", "h4", "h5", "h6"', function () {
        var tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        it('If the stack of open elements has a p element in button scope, then act as if an end tag with the tag name "p" had been seen.', function () {
            _.each(tags, function (tag) {
                var tree = new Tree(content),
                    token = { type: 'StartTag', name: tag },
                    p;
                putElementInScope(tree, 'p', ['button']);
                p = _.last(tree.stack);
                tree['in body'](token);
                should.notStrictEqual(tree.stack[tree.stack.length - 2].name, tag);
            });
        });

        it('If the current node is an element whose tag name is one of "h1", "h2", "h3", "h4", "h5", or "h6", then this is a parse error; pop the current node off the stack of open elements.', function () {
            _.each(tags, function (tag) {
                var tree = new Tree(content + '<' + tag + '>'),
                    token = { type: 'StartTag', name: tag };
                tree['in body'](token);
                should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
            });
        });

        it('Insert an HTML element for the token.', function () {
            _.each(tags, function (tag) {
                var tree = new Tree(content),
                    token = { type: 'StartTag', name: tag };
                putElementInScope(tree, 'p', ['button']);
                tree['in body'](token);
                should.strictEqual(_.last(tree.stack).name, tag);
            });
        });
    });

    describe('A start tag whose tag name is one of: "pre", "listing"', function () {
        var tags = ['pre', 'listing'],
            content = '<!doctype html><html><head></head><body><button><p>';
        it('If the stack of open elements has a p element in button scope, then act as if an end tag with the tag name "p" had been seen.', function () {
            _.each(tags, function (tag) {
                var tree = new Tree(content + '<' + tag + '>');
                should.notStrictEqual(tree.stack[tree.stack.length - 2].name, 'p');
            });
        });

        it('Insert an HTML element for the token.', function () {
            _.each(tags, function (tag) {
                var tree = new Tree(content + '<' + tag + '>');
                should.strictEqual(_.last(tree.stack).name, tag);
            });
        });

        it('If the next token is a "LF" (U+000A) character token, then ignore that token and move on to the next one. (Newlines at the start of pre blocks are ignored as an authoring convenience.)', function () {
            _.each(tags, function (tag) {
                var tree = new Tree(content + '<' + tag + '>\n');
                should.deepEqual(_.last(tree.stack).content, []);
            });
        });

        it('Set the frameset-ok flag to "not ok".', function () {
            _.each(tags, function (tag) {
                var tree = new Tree(content + '<' + tag + '>');
                should.ok(!tree.flags['frameset-ok']);
            });
        });
    });

    describe('A start tag whose tag name is "form"', function () {
        var token = { type: 'StartTag', name: 'form' };
        it('If the form element pointer is not null, then this is a parse error; ignore the token.', function () {
            var tree = new Tree(content + '<form>');
            tree['in body'](token);
            should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
            should.notStrictEqual(tree.stack[tree.stack.length - 2].name, 'form');
        });

        it('If the stack of open elements has a p element in button scope, then act as if an end tag with the tag name "p" had been seen.', function () {
            var tree = new Tree(content);
            putElementInScope(tree, 'p', ['button']);
            tree['in body'](token);
            should.notStrictEqual(tree.stack[tree.stack.length - 2].name, 'p');
        });

        it('Insert an HTML element for the token, and set the form element pointer to point to the element created.', function () {
            var tree = new Tree(content);
            should.ok(!tree.pointers.form);
            tree['in body'](token);
            should.strictEqual(_.last(tree.stack).name, 'form', 'form element inserted');
            should.ok(tree.pointers.form);
        });
    });

    describe('A start tag whose tag name is "li"', function () {
        it('Set the frameset-ok flag to "not ok".', function () {
            var tree = new Tree(content + '<li>');
            should.strictEqual(tree.flags['frameset-ok'], false);
        });

        it('Initialize node to be the current node (the bottommost node of the stack). If node is an li element, then act as if an end tag with the tag name "li" had been seen', function () {
            var tree = new Tree(content + '<li><li>');
            should.notStrictEqual(tree.stack[tree.stack.length - 2].name, 'li');
        });

        it('If the stack of open elements has a p element in button scope, then act as if an end tag with the tag name "p" had been seen.', function () {
            var tree = new Tree(content + '<button><p><li>');
            should.notStrictEqual(tree.stack[tree.stack.length - 2].name, 'p');
        });

        it('Insert an HTML element for the token.', function () {
            var tree = new Tree(content + '<li>');
            should.deepEqual(getLastNode(tree.documentNode).name, 'li');
        });
    });

    describe('A start tag whose tag name is one of: "dd", "dt"', function () {
        _.each(['dd', 'dt'], function (tag) {
            describe(tag, function () {
                it('Set the frameset-ok flag to "not ok".', function () {
                    var tree = new Tree(content + '<' + tag + '>');
                    should.strictEqual(tree.flags['frameset-ok'], false);
                });

                it('Initialize node to be the current node (the bottommost node of the stack). If node is an li element, then act as if an end tag with the tag name "li" had been seen', function () {
                    var tree = new Tree(content + '<' + tag + '><' + tag + '>');
                    should.notStrictEqual(tree.stack[tree.stack.length - 2].name, tag);
                });

                it('If the stack of open elements has a p element in button scope, then act as if an end tag with the tag name "p" had been seen.', function () {
                    var tree = new Tree(content + '<button><p><' + tag + '>');
                    should.notStrictEqual(tree.stack[tree.stack.length - 2].name, 'p');
                });

                it('Insert an HTML element for the token.', function () {
                    var tree = new Tree(content + '<' + tag + '>');
                    should.deepEqual(getLastNode(tree.documentNode).name, tag);
                });
            });
        });
    });

    describe('A start tag whose tag name is "plaintext"', function () {
        it('If the stack of open elements has a p element in button scope, then act as if an end tag with the tag name "p" had been seen.', function () {
            var tree = new Tree(content + '<button><p><plaintext>');
            should.notStrictEqual(tree.stack[tree.stack.length - 2].name, 'p');
        });

        it('Insert an HTML element for the token.', function () {
            var tree = new Tree(content + '<plaintext>');
            should.strictEqual(getLastNode(tree.documentNode).name, 'plaintext');
        });

        it('Switch the tokenizer to the PLAINTEXT state.', function () {
            // TODO: Do we need to expose the tokenizer object to know about state?
        });
    });

    describe('A start tag whose tag name is "button"', function () {
        var tree;
        beforeEach(function () {
            tree = new Tree(content + '<button>');
        });

        it('If the stack of open elements has a button element in scope, then this is a parse error; act as if an end tag with the tag name "button" had been seen, then reprocess the token.', function () {
            var token = { type: 'StartTag', name: 'button' };
            tree['in body'](token);
            should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
        });

        it('Reconstruct the active formatting elements, if any.', function () {
            // TODO: unsure how elements become "active formatting elements"
        });

        it('Insert an HTML element for the token.', function () {
            should.strictEqual(_.last(tree.stack).name, 'button');
        });

        it('Set the frameset-ok flag to "not ok".', function () {
            should.strictEqual(tree.flags['frameset-ok'], false);
        });
    });

    describe('An end tag whose tag name is one of: "address", "article", "aside", "blockquote", "button", "center", "details", "dir", "div", "dl", "fieldset", "figcaption", "figure", "footer", "header", "hgroup", "listing", "menu", "nav", "ol", "pre", "section", "summary", "ul"', function () {
        var tags = ['address', 'article', 'aside', 'blockquote', 'button', 'center', 'details', 'dir', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'header', 'hgroup', 'listing', 'menu', 'nav', 'ol', 'pre', 'section', 'summary', 'ul'];

        function parseError(tag, tree) {
            var token = { type: 'EndTag', name: tag };
            tree['in body'](token);
            should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
        }

        it('If the stack of open elements does not have an element in scope with the same tag name as that of the token, then this is a parse error; ignore the token.', function () {
            var tree = new Tree(content);
            _.each(tags, function (tag) { parseError(tag, tree); });
        });

        it('Generate implied end tags.', function () {
            _.each(tags, function (tag) {
                var tree = new Tree(content + '<' + tag + '><p></' + tag + '>');
                should.ok(!_.find(tree.stack, function (el) { return el.name === 'p'; }));
            });
        });

        it('If the current node is not an element with the same tag name as that of the token, then this is a parse error.', function () {
            var tree = new Tree(content + '<table>');
            _.each(tags, function (tag) { parseError(tag, tree); });
        });

        it('Pop elements from the stack of open elements until an element with the same tag name as the token has been popped from the stack.', function () {
            _.each(tags, function (tag) {
                var tree = new Tree(content + '<' + tag + '><bar><foo></' + tag + '>');
                should.strictEqual(_.last(tree.stack).name, 'body');
            });
        });
    });

    describe('An end tag whose tag name is "form"', function () {
        it('Set the form element pointer to null.', function () {
            var tree = new Tree(content + '<form></form>');
            should.ok(!tree.pointers.form);
        });

        it('If node is null or the stack of open elements does not have node in scope, then this is a parse error; ignore the token.', function () {
            var tree = new Tree(content),
                token = { type: 'EndTag', name: 'form' };
            tree['in body'](token);
            should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
        });

        describe('Otherwise', function () {
            it('Generate implied end tags.', function () {
                var tree = new Tree(content + '<form><p></form>');
                should.ok(!_.find(tree.stack, function (el) { return el.name === 'p'; }));
            });

            it('If the current node is not node, then this is a parse error.', function () {
                var tree = new Tree(content + '<form><div></form>'),
                    token = { type: 'EndTag', name: 'form' };
                tree['in body'](token);
                should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
            });

            it('Remove node from the stack of open elements.', function () {
                var tree = new Tree(content + '<form></form>');
                should.ok(!_.find(tree.stack, function (el) { return el.name === 'form'; }));
            });
        });
    });

    function endTagInBodyParseError(tag) {
        var tree = new Tree(content),
            token = { type: 'EndTag', name: tag };
        tree['in body'](token);
        should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
        should.notStrictEqual(_.last(tree.stack).name, tag);
        return tree;
    }

    function generatesImpliedExceptToken(tag) {
        var tree = new Tree(content + '<' + tag + '><rp></' + tag + '>');
        should.deepEqual(tree.errors, []);
        should.ok(!_.find(tree.stack, function (el) { return el.name === 'rp'; }));
        return tree;
    }

    function currentNodeMismatchParseError(tag) {
        var tree = new Tree(content + '<' + tag + '><div>'),
            token = { type: 'EndTag', name: tag };
        tree['in body'](token);
        should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
        return tree;
    }

    describe('An end tag whose tag name is "p"', function () {
        it('If the stack of open elements does not have an element in button scope with the same tag name as that of the token, then this is a parse error; act as if a start tag with the tag name "p" had been seen, then reprocess the current token.', function () {
            var tree = endTagInBodyParseError('p');
            should.strictEqual(getLastNode(tree.documentNode).name, 'p');
        });

        describe('Otherwise', function () {
            it('Generate implied end tags, except for elements with the same tag name as the token.', function () {
                generatesImpliedExceptToken('p');
            });

            it('If the current node is not an element with the same tag name as that of the token, then this is a parse error.', function () {
                currentNodeMismatchParseError('p');
            });

            it('Pop elements from the stack of open elements until an element with the same tag name as the token has been popped from the stack.', function () {
                var tree = new Tree(content + '<p>asdf</p>');
                should.ok(!_.find(tree.stack, function (el) { return el.name === 'p'; }));
                should.strictEqual(tree.documentNode[0].content[1].content[0].name, 'p');
            });
        });
    });

    describe('An end tag whose tag name is "li"', function () {
        it('If the stack of open elements does not have an element in list item scope with the same tag name as that of the token, then this is a parse error; ignore the token.', function () {
            endTagInBodyParseError('li');
        });

        describe('Otherwise', function () {
            it('Generate implied end tags, except for elements with the same tag name as the token.', function () {
                generatesImpliedExceptToken('li');
            });

            it('If the current node is not an element with the same tag name as that of the token, then this is a parse error.', function () {
                currentNodeMismatchParseError('li');
            });

            it('Pop elements from the stack of open elements until an element with the same tag name as the token has been popped from the stack.', function () {
                var tree = new Tree(content + '<ul><li>asdf</li>');
                should.ok(!_.find(tree.stack, function (el) { return el.name === 'li'; }));
                should.strictEqual(tree.documentNode[0].content[1].content[0].content[0].name, 'li');
            });
        });
    });

    describe('An end tag whose tag name is one of: "dd", "dt"', function () {
        var tags = ['dd', 'dt'];
        it('If the stack of open elements does not have an element in scope with the same tag name as that of the token, then this is a parse error; ignore the token.', function () {
            _.each(tags, endTagInBodyParseError);
        });

        describe('Otherwise', function () {
            it('Generate implied end tags, except for elements with the same tag name as the token.', function () {
                _.each(tags, generatesImpliedExceptToken);
            });

            it('If the current node is not an element with the same tag name as that of the token, then this is a parse error.', function () {
                _.each(tags, currentNodeMismatchParseError);
            });

            it('Pop elements from the stack of open elements until an element with the same tag name as the token has been popped from the stack.', function () {
                _.each(tags, function (tag) {
                    var tree = new Tree(content + '<dl><' + tag + '><span></' + tag + '>');
                    should.ok(!_.find(tree.stack, function (el) { return el.name === tag; }));
                    should.strictEqual(tree.documentNode[0].content[1].content[0].content[0].name, tag);
                });
            });
        });
    });

    describe('An end tag whose tag name is one of: "h1", "h2", "h3", "h4", "h5", "h6"', function () {
    });

    describe('An end tag whose tag name is "sarcasm"', function () {
    });

    describe('A start tag whose tag name is "a"', function () {
    });

    describe('A start tag whose tag name is one of: "b", "big", "code", "em", "font", "i", "s", "small", "strike", "strong", "tt", "u"', function () {
    });

    describe('A start tag whose tag name is "nobr"', function () {
    });

    describe('An end tag whose tag name is one of: "a", "b", "big", "code", "em", "font", "i", "nobr", "s", "small", "strike", "strong", "tt", "u"', function () {
    });

    describe('A start tag token whose tag name is one of: "applet", "marquee", "object"', function () {
    });

    describe('An end tag token whose tag name is one of: "applet", "marquee", "object"', function () {
    });

    describe('A start tag whose tag name is "table"', function () {
    });

    describe('A start tag whose tag name is one of: "area", "br", "embed", "img", "keygen", "wbr"', function () {
    });

    describe('A start tag whose tag name is "input"', function () {
    });

    describe('A start tag whose tag name is one of: "param", "source", "track"', function () {
    });

    describe('A start tag whose tag name is "hr"', function () {
    });

    describe('A start tag whose tag name is "image"', function () {
    });

    describe('A start tag whose tag name is "isindex"', function () {
    });

    describe('A start tag whose tag name is "textarea"', function () {
    });

    describe('A start tag whose tag name is "xmp"', function () {
    });

    describe('A start tag whose tag name is "iframe"', function () {
    });

    describe('A start tag whose tag name is "noembed"; A start tag whose tag name is "noscript", if the scripting flag is enabled', function () {
    });

    describe('A start tag whose tag name is "select"', function () {
    });

    describe('A start tag whose tag name is one of: "optgroup", "option"', function () {
    });

    describe('A start tag whose tag name is one of: "rp", "rt"', function () {
    });

    describe('An end tag whose tag name is "br"', function () {
    });

    describe('A start tag whose tag name is "math"', function () {
    });

    describe('A start tag whose tag name is "svg"', function () {
    });

    describe('A start tag whose tag name is one of: "caption", "col", "colgroup", "frame", "head", "tbody", "td", "tfoot", "th", "thead", "tr"', function () {
    });

    describe('Any other start tag', function () {
    });

    describe('Any other end tag', function () {
    });
});
