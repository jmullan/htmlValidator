var testCase = require('nodeunit').testCase,
    HTMLTokenizer = require('./HTMLTokenizer').HTMLTokenizer;

exports.Tokenizing = testCase({
    'test stub': function (test) {
        var tokenizer = new HTMLTokenizer('');
        test.done();
    },
    'test what happens when the tokenizer is pumped once': function (test) {
        var tokenizer = new HTMLTokenizer('foo');
        tokenizer.nextToken();
        test.done();
    },
    'test what happens when the tokenizer is pumped until the EOF': function (test) {
        var tokenizer = new HTMLTokenizer('foo');
        while (!tokenizer.EOF()) {
            tokenizer.nextToken();
        }
        test.done();
    },
    'test what happens when tokenizing the doctype': function (test) {
        var tokenizer = new HTMLTokenizer('<!DOCTYPE html>');
        while (!tokenizer.EOF()) {
            tokenizer.nextToken();
        }
        test.done();
    }

});