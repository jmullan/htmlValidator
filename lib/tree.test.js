var Tree = require('./tree').Tree,
    util = require('util');

exports.basic = function (test) {
    var tree = new Tree('<!DOCTYPE html><html><head></head><body id="foo" class="bar"><button><p>baz<br />monkey</p><p>foo</p></button></body></html>');
    // console.log(util.inspect(tree.documentNode, null, 10));
    test.done();
};
