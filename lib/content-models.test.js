var Token = require('./token').Token,
    should = require('should'),
    models = require('./content-models');

// FIXME: what is being tested here?
exports.transparent = function (test) {
    var parent = new Token({ name: 'p', content: ['ins'], line: 3 }),
        token = new Token({ name: 'ins', content: ['hi!'], line: 4, context: parent });

    parent.rules = { content: models.phrasing };
    test.deepEqual(models.phrasing, models.transparent(token));
    test.done();
};

exports.text = function (test) {
    test.done();
};
