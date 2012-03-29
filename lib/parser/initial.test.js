var utils = require('./parser.test'),
    _ = require('underscore'),
    Tree = require('./parser').Tree,
    should = require('should'),
    errors = require('../errors');

describe('initial', function () {
    describe('A character token that is one of U+0009 CHARACTER TABULATION, "LF" (U+000A), "FF" (U+000C), "CR" (U+000D), or U+0020 SPACE', function () {
        utils.testWhitespace((new Tree(' ')), 'initial', true);
    });

    describe('A comment token', function () {
        utils.testComment((new Tree(' ')), 'initial');
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
