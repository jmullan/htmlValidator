var testCase = require('nodeunit').testCase,
    errors = require('./errors'),
    Token = require('./token').Token;

exports['invalid element'] = function (test) {
    var token = new Token({ name: 'foobar', line: 1 });
    token.validate();
    test.ok(token.errors[0] instanceof errors.InvalidElement);
    test.done();
};

exports.Attributes = testCase({
    'required attributes': function (test) {
        var token = new Token({ name: 'param', line: 20 });
        token.validate();

        test.ok(token.errors[0] instanceof errors.AttributeMissing);
        test.ok(token.errors[1] instanceof errors.AttributeMissing);
        test.done();
    },

    'unknown attribute': function (test) {
        var token = new Token({ name: 'a', line: 1, attributes: [{ attr: 'foo', val: 'bar' }]});
        token.validate();
        test.ok(token.errors[0] instanceof errors.AttributeUnknown);
        test.done();
    },

    'invalid attribute': function (test) {
        var token = new Token({ name: 'script', line: 1, attributes: [{ attr: 'type', val: 'bar' }]});
        token.validate();
        test.ok(token.errors[0] instanceof errors.InvalidAttribute);
        test.done();
    }
});

exports.Content = testCase({
    'invalid content': function (test) {
        var token = new Token({ name: 'p', line: 1, content: ['p', 'b'] });
        token.validate();
        test.ok(token.errors[0] instanceof errors.InvalidContent);
        test.done();
    },

    'transparent content': function (test) {
        var parent = new Token({ name: 'p', line: 1, content: ['ins'] }),
            token = new Token({ name: 'ins', line: 3, content: [], context: parent });

        token.validate();
        test.deepEqual(token.errors, []);
        test.done();
    },

    'invalid transparent content': function (test) {
        // ins and del are both transparent. Testing asserting up a chain.
        var parent2 = new Token({ name: 'p', line: 1, content: ['del'] }),
            parent1 = new Token({ name: 'del', line: 2, content: ['ins'], context: parent2 }),
            token = new Token({ name: 'ins', line: 3, content: ['p'], context: parent1 });

        token.validate();
        test.ok(token.errors[0] instanceof errors.InvalidContent);
        test.done();
    }
});

exports.Context = testCase({
    'valid context': function (test) {
        var parent = new Token({ name: 'p', line: 3, content: ['ins'] }),
            token = new Token({ name: 'ins', line: 4, content: [], context: parent });

        token.validate();
        test.deepEqual(token.errors, []);
        test.done();
    },

    'invalid context': function (test) {
        var parent = new Token({ name: 'p', line: 3, content: ['track'] }),
            token = new Token({ name: 'track', line: 4, content: [], context: parent });

        token.validate();
        test.ok(token.errors[0] instanceof errors.InvalidContext);
        test.done();
    }
});
