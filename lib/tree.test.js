var Tree = require('./tree').Tree;

exports.basic = function (test) {
    var tree = new Tree('<!DOCTYPE html><html><head></head><body id="foo" class="bar"><p>baz<br />monkey</p></body></html>');
    console.log(tree.documentNode);
    test.done();
};
