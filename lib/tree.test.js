var Tree = require('./tree').Tree,
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
        test.deepEqual(this.tree.errors[0], new errors.ParseError({ type: 'DOCTYPE', name: 'html' }), 'parse error');
        test.deepEqual(this.tree.tokens, [], 'ignore the token');
        test.done();
    }
});
