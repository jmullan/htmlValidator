var _ = require('underscore'),
    Mocha = require('mocha'),
    mocha = new Mocha(),
    child_process = require('child_process'),
    config = require('./config-test'),
    ignore = '',
    l,
    i;

mocha.reporter(config.reporter).ui(config.ui);

function runTests(error, stdout, stderr) {
    var tests = stdout.trim().split("\n"),
        runner;

    _.each(tests, function (test) {
        mocha.addFile(test);
    });

    runner = mocha.run(function () {
        // console.log('finished');
    });

    runner.on('pass', function (test) {
        // console.log('... %s passed', test.title);
    });

    runner.on('fail', function (test) {
        // console.log('... %s failed', test.title);
    });
}

l = config.pathIgnore.length;
for (i = 0; i < l; i += 1) {
    ignore += ' ! -path "' + config.pathIgnore[i] + '"';
}

child_process.exec('find . -name "*.test.js" ' + ignore, { cwd: config.root }, runTests);
