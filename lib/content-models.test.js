var Token = require('./token').Token,
    models = require('./content-models');

exports.transparent = function (test) {
    var token = new Token({ name: 'ins', content: ['hi!'], line: 4 }),
        parent = new Token({ name: 'p', content: ['ins'], line: 3 });

    parent.rules = { content: models.phrasing };
    token.parentToken = parent;

    test.deepEqual(models.phrasing, models.transparent(token, parent));
    test.done();
};

exports.text = function (test) {
    test.done();
};
