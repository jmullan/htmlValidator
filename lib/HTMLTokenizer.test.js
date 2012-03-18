var testCase = require('nodeunit').testCase,
    HTMLTokenizer = require('./HTMLTokenizer').HTMLTokenizer,
    fs = require('fs'),
    testAgainstFile = function (test, filename) {
        fs.readFile(filename, 'UTF-8', function (err, data) {
            var tokenizer;
            if (err) {
                test.ok(false, 'Could not read sample file');
            } else {
                tokenizer = new HTMLTokenizer(data);
                while (!tokenizer.EOF()) {
                    tokenizer.nextToken();
                }
            }
            test.done();
        });
    };


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
    },
    'another test 2': function (test) {
        var tokenizer = new HTMLTokenizer('<!DOCTYPE html><html><head></head><body id="foo" class="bar"><p>baz<br />monkey</p></body></html>');
        while (!tokenizer.EOF()) {
            tokenizer.nextToken();
        }
        test.done();
    },
    'no EOF token': function (test) {
        var tokenizer = new HTMLTokenizer(' ');
        while (!tokenizer.EOF()) {
            tokenizer.nextToken();
        }
        test.deepEqual(tokenizer.tokens, [' '], 'there should be no EOF token');
        test.done();
    },
    'test untitled': function (test) {
        testAgainstFile(test, __dirname + '/../tests/samples/valid/untitled.html');
    },
    'test basic': function (test) {
        testAgainstFile(test, __dirname + '/../tests/samples/valid/basic.html');
    },
    'test template': function (test) {
        testAgainstFile(test, __dirname + '/../tests/samples/valid/template.html');
    }
});