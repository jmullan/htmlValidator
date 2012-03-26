var testCase = require('nodeunit').testCase,
    HTMLTokenizer = require('./HTMLTokenizer').HTMLTokenizer,
    fs = require('fs'),
    _ = require('underscore'),
    testAgainstFile = function (callback, test, filename) {
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
            callback();
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
        testAgainstFile(test.done, test, __dirname + '/../tests/samples/valid/untitled.html');
    },
    'test basic': function (test) {
        testAgainstFile(test.done, test, __dirname + '/../tests/samples/valid/basic.html');
    },
    'test template': function (test) {
        testAgainstFile(test.done, test, __dirname + '/../tests/samples/valid/template.html');
    },
    'test any external files': function (test) {
        var relativePath = __dirname + '/../tests/samples/external/';
        fs.readdir(relativePath, function (err, files) {
            if (err) {
                test.ok(false, 'There was some error, whatever');
                return;
            }
            var todo,
                filtered,
                checkTodo = function () {
                    todo -= 1;
                    if (0 >= todo) {
                        test.done();
                    }
                },
                checkFile = function (element, index, list) {
                    testAgainstFile(checkTodo, test, relativePath + element);
                },
                htmlOnly = function (element) {
                    return element.match(/.htm$/);
                };
            filtered = _.filter(files, htmlOnly);
            todo = filtered.length;
            if (todo) {
                _.each(filtered, checkFile);
            } else {
                test.done();
            }
        });
    }
});