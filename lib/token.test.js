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

exports.Content = testCase({
    'invalid content': function (test) {
        var token = new Token({ name: 'p', line: 1, content: ['p', 'b'] });
        token.validate();
        test.deepEqual(token.errors, ['Element "p" must not have a child element "p" on line 1.']);
        test.done();
    },

    'transparent content': function (test) {
        var token = new Token({ name: 'ins', line: 3, content: [] }),
            parent = new Token({ name: 'p', line: 1, content: ['ins'] });

        parent.validate();
        token.parentToken = parent;

        token.validate();
        test.deepEqual(token.errors, []);
        test.done();
    },

    'invalid transparent content': function (test) {
        // ins and del are both transparent. Testing asserting up a chain.
        var token = new Token({ name: 'ins', line: 3, content: ['p'] }),
            parent1 = new Token({ name: 'del', line: 2, content: ['ins'] }),
            parent2 = new Token({ name: 'p', line: 1, content: ['del'] });

        parent2.validate();
        parent1.parentToken = parent2;
        parent1.validate();
        token.parentToken = parent1;

        token.validate();
        test.deepEqual(token.errors, ['Element "ins" must not have a child element "p" on line 3.']);
        test.done();
    }

});