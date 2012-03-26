var should = require('should'),
    errors = require('./errors'),
    Token = require('./token').Token;

describe('When an Invalid Element is Given', function () {
    it('should have an InvalidElement error', function () {
        var token = new Token({ name: 'foobar', line: 1 });
        token.validate();
        should.ok(token.errors[0] instanceof errors.InvalidElement);
    });
});

describe('Attributes', function () {
    describe('when missing', function () {
        it('should have missing attribute errors', function () {
            var token = new Token({ name: 'param', line: 20 });
            token.validate();
            should.ok(token.errors[0] instanceof errors.AttributeMissing);
            should.ok(token.errors[1] instanceof errors.AttributeMissing);
        });
    });

    describe('when unknown', function () {
        it('should have an AttributeUnknown error', function () {
            var token = new Token({ name: 'a', line: 1, attributes: [{ attr: 'foo', val: 'bar' }]});
            token.validate();
            should.ok(token.errors[0] instanceof errors.AttributeUnknown);
        });
    });

    describe('when invalid', function () {
        it('should have an InvalidAttribute error', function () {
            var token = new Token({ name: 'script', line: 1, attributes: [{ attr: 'type', val: 'bar' }]});
            token.validate();
            should.ok(token.errors[0] instanceof errors.InvalidAttribute);
        });
    });
});

describe('Content', function () {
    describe('when invalid', function () {
        it('should have an InvalidContent error', function () {
            var token = new Token({ name: 'p', line: 1, content: ['p', 'b'] });
            token.validate();
            should.ok(token.errors[0] instanceof errors.InvalidContent);
        });
    });

    describe('when transparent', function () {
        it('should not have errors', function () {
            var parent = new Token({ name: 'p', line: 1, content: ['ins'] }),
                token = new Token({ name: 'ins', line: 3, content: [], context: parent });

            token.validate();
            should.deepEqual(token.errors, []);
        });
    });

    describe('when invalid transparent', function () {
        it('should have an InvalidContent Error', function () {
            // ins and del are both transparent. Testing asserting up a chain.
            var parent2 = new Token({ name: 'p', line: 1, content: ['del'] }),
                parent1 = new Token({ name: 'del', line: 2, content: ['ins'], context: parent2 }),
                token = new Token({ name: 'ins', line: 3, content: ['p'], context: parent1 });

            token.validate();
            should.ok(token.errors[0] instanceof errors.InvalidContent);
        });
    });
});

describe('Context', function () {
    describe('when valid', function () {
        it('should not have any errors', function () {
            var parent = new Token({ name: 'p', line: 3, content: ['ins'] }),
                token = new Token({ name: 'ins', line: 4, content: [], context: parent });

            token.validate();
            should.deepEqual(token.errors, []);
        });
    });

    describe('when invalid', function () {
        it('should have an InvalidContext error', function () {
            var parent = new Token({ name: 'p', line: 3, content: ['track'] }),
                token = new Token({ name: 'track', line: 4, content: [], context: parent });

            token.validate();
            should.ok(token.errors[0] instanceof errors.InvalidContext);
        });
    });
});
