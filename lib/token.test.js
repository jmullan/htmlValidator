var testCase = require('nodeunit').testCase,
    Token = require('./token').Token;

exports['invalid element'] = function (test) {
    var token = new Token({ name: 'foobar', line: 1 });
    token.validate();
    test.deepEqual(token.errors, ['Element "foobar" on line 1 is not a valid element.']);
    test.done();
};

exports.Attributes = testCase({
    'required attributes': function (test) {
        var token = new Token({ name: 'param', line: 20 });
        token.validate();
        test.deepEqual(token.errors, [
            'Element "param" on line 20 missing required attribute "name".',
            'Element "param" on line 20 missing required attribute "value".'
        ]);
        test.done();
    },

    'unknown attribute': function (test) {
        var token = new Token({ name: 'a', line: 1, attributes: { foo: 'bar' }});
        token.validate();
        test.deepEqual(token.errors, ['Element "a" on line 1 includes unknown attribute "foo".']);
        test.done();
    },

    'invalid attribute': function (test) {
        var token = new Token({ name: 'script', line: 1, attributes: { type: 'bar' }});
        token.validate();
        test.deepEqual(token.errors, ['Attribute "type" value "bar" is invalid for element "script" on line 1.']);
        test.done();
    }
});
