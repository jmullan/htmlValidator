var should = require('should'),
    _ = require('underscore'),
    HTMLTokenizer = require('./HTMLTokenizer').HTMLTokenizer,
    fs = require('fs');

function testAgainstFile(filename, done) {
    fs.readFile(filename, 'UTF-8', function (err, data) {
        var tokenizer;
        if (err) {
            should.ok(false);
        } else {
            tokenizer = new HTMLTokenizer(data);
            while (!tokenizer.EOF()) {
                tokenizer.nextToken();
            }
        }
        done();
    });
}

describe('Tokenizing', function () {
    describe('when given anything', function () {
        it('does not have any extra tokens', function () {
            var tokenizer = new HTMLTokenizer(' ');
            while (!tokenizer.EOF()) {
                tokenizer.nextToken();
            }
            should.deepEqual(tokenizer.tokens, [' ']);
        });
    });

    describe('when pumped', function () {
        var tokenizer = new HTMLTokenizer('foo');
        it('does not throw', function () {
            tokenizer.nextToken();
        });

        it('does not throw pumped through EOF', function () {
            while (!tokenizer.EOF()) {
                tokenizer.nextToken();
            }
        });
    });

    describe('when given a doctype', function () {
        it('is not unhappy', function () {
            var tokenizer = new HTMLTokenizer('<!DOCTYPE html>');
            while (!tokenizer.EOF()) {
                tokenizer.nextToken();
            }
        });
    });

    describe('Files', function () {
        _.each(['untitled', 'basic', 'template'], function (file) {
            it('should not explode on "' + file + '.html"', function (done) {
                testAgainstFile(__dirname + '/../tests/samples/valid/' + file + '.html', done);
            });
        });
    });

});
