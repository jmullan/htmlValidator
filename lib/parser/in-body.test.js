var utils = require('./parser.test'),
    _ = require('underscore'),
    Tree = require('./parser').Tree,
    should = require('should'),
    errors = require('../errors');

describe('in body', function () {
    var content = '<!doctype html><html foo="bar"><head></head><body>';

    describe('null character', function () {
        var tree = new Tree(content),
            nullchar = '\u0000';
        tree.process('in body', nullchar);
        it('Parse error.', function () {
            should.deepEqual(_.last(tree.errors), (new errors.ParseError(nullchar)));
        });

        it('Ignore the token.', function () {
            should.deepEqual(_.last(tree.stack).content, []);
        });
    });

    describe('A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE', function () {
        utils.testWhitespace((new Tree(content)), 'in body');
    });

    describe('Any other character token', function () {
        var tree = new Tree(content),
            c = '';

        it('Insert the token\'s character into the current node.', function () {
            _.each(['a', 'b', 'c', '0', '$'], function (input) {
                tree.flags['frameset-ok'] = true;
                tree.process('in body', input);
                c += input;
                should.strictEqual(utils.getLastNode(tree.stack), c);
            });
        });
        it('Set the frameset-ok flag to "not ok".', function () {
            _.each(['a', 'b', 'c', '0', '$'], function (input) {
                tree.flags['frameset-ok'] = true;
                tree.process('in body', input);
                should.ok(!tree.flags['frameset-ok']);
            });
        });
    });

    describe('A comment token', function () {
        utils.testComment((new Tree(content)), 'in body');
    });

    describe('A DOCTYPE token', function () {
        utils.testDoctypeParseError((new Tree(content)), 'after head');
    });

    describe('A start tag whose tag name is "html"', function () {
        utils.testHtmlInBody('<head></head><body>');
    });

    describe('A start tag token whose tag name is one of: "base", "basefont", "bgsound", "command", "link", "meta", "noframes", "script", "style", "title"', function () {
        // FIXME: duplication with 'in head' for same elements
        it('Process the token using the rules for the "in head" insertion mode.', function () {
            _.each(['base', 'basefont', 'bgsound', 'command', 'link'], function (tag) {
                var tree = new Tree(content + '<' + tag + '>');
                should.strictEqual(utils.getLastNode(_.last(tree.stack).content).name, tag);
                // TODO: Acknowledge the token's self-closing flag, if it is set.
            });
        });
    });

    describe('A start tag whose tag name is "body"', function () {
        var tree = new Tree(content),
            token = { type: 'StartTag', name: 'body', attributes: [{ name: 'foo', value: 'bar' }] };
        tree.process('in body', token);
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
        tree.process('in body', token);

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
            tree.process('in body', token);
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
                tree.process('in body', token);
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
                utils.putElementInScope(tree, 'p', ['button']);
                p = _.last(tree.stack);
                tree.process('in body', token);
                should.notStrictEqual(tree.stack[tree.stack.length - 2].name, tag);
            });
        });

        it('If the current node is an element whose tag name is one of "h1", "h2", "h3", "h4", "h5", or "h6", then this is a parse error; pop the current node off the stack of open elements.', function () {
            _.each(tags, function (tag) {
                var tree = new Tree(content + '<' + tag + '>'),
                    token = { type: 'StartTag', name: tag };
                tree.process('in body', token);
                should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
            });
        });

        it('Insert an HTML element for the token.', function () {
            _.each(tags, function (tag) {
                var tree = new Tree(content),
                    token = { type: 'StartTag', name: tag };
                utils.putElementInScope(tree, 'p', ['button']);
                tree.process('in body', token);
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
            tree.process('in body', token);
            should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
            should.notStrictEqual(tree.stack[tree.stack.length - 2].name, 'form');
        });

        it('If the stack of open elements has a p element in button scope, then act as if an end tag with the tag name "p" had been seen.', function () {
            var tree = new Tree(content);
            utils.putElementInScope(tree, 'p', ['button']);
            tree.process('in body', token);
            should.notStrictEqual(tree.stack[tree.stack.length - 2].name, 'p');
        });

        it('Insert an HTML element for the token, and set the form element pointer to point to the element created.', function () {
            var tree = new Tree(content);
            should.ok(!tree.pointers.form);
            tree.process('in body', token);
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
            should.deepEqual(utils.getLastNode(tree.documentNode).name, 'li');
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
                    should.deepEqual(utils.getLastNode(tree.documentNode).name, tag);
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
            should.strictEqual(utils.getLastNode(tree.documentNode).name, 'plaintext');
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
            tree.process('in body', token);
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
            tree.process('in body', token);
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
            tree.process('in body', token);
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
                tree.process('in body', token);
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
        tree.process('in body', token);
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
        tree.process('in body', token);
        should.deepEqual(_.last(tree.errors), (new errors.ParseError(token)));
        return tree;
    }

    describe('An end tag whose tag name is "p"', function () {
        it('If the stack of open elements does not have an element in button scope with the same tag name as that of the token, then this is a parse error; act as if a start tag with the tag name "p" had been seen, then reprocess the current token.', function () {
            var tree = endTagInBodyParseError('p');
            should.strictEqual(utils.getLastNode(tree.documentNode).name, 'p');
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
