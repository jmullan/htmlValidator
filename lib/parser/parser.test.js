var _ = require('underscore'),
    Tree = require('./parser').Tree,
    should = require('should'),
    errors = require('../errors'),
    util = require('util');

exports.getLastNode = function (node) {
    var last = _.last(node);
    while (last.hasOwnProperty('content') && last.content.length) {
        last = _.last(last.content);
    }

    return last;
};

exports.testDoctypeParseError = function (tree, mode) {
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
};

exports.testWhitespace = function (tree, mode, ignored) {
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
                should.strictEqual(exports.getLastNode(tree.stack), content);
            });
        });
    }
};

exports.testComment = function (tree, mode) {
    it('Append a Comment node to the Document object with the data attribute set to the data given in the comment token.', function () {
        var token = { type: 'comment', data: 'foo' },
            last = _.last(tree.stack);
        tree[mode](token);
        should.strictEqual(tree.mode, mode);
        should.equal(exports.getLastNode(tree.documentNode), token);
        should.strictEqual(_.last(tree.stack), last);
    });
};

exports.testHtmlInBody = function (content) {
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
};

exports.putElementInScope = function (tree, el, scope) {
    tree[tree.mode]({ type: 'StartTag', name: scope });
    tree[tree.mode]({ type: 'StartTag', name: el });
};
