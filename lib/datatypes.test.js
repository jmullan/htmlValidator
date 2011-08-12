var datatypes = require('./datatypes');

exports.ID = function (test) {
    test.done();
};

exports.IDREF = function (test) {
    test.done();
};

exports.IDREFS = function (test) {
    test.done();
};

exports.pattern = function (test) {
    test.done();
};

exports.datetime = function (test) {
    test.ok(datatypes.datetime('1995-12-31T23:59:59.99Z'));
    test.done();
};

exports['datetime-local'] = function (test) {
    test.ok(datatypes['datetime-local']('1995-12-31T23:59:59.99'));
    test.done();
};

exports['datetime-tz'] = function (test) {
    test.done();
};

exports['date-or-time'] = function (test) {
    test.done();
};

exports['date-or-time-content'] = function (test) {
    test.done();
};

exports.date = function (test) {
    test.ok(datatypes.date('1995-12-31'));
    test.done();
};

exports.month = function (test) {
    test.ok(datatypes.month('1995-12'));
    test.done();
};

exports.week = function (test) {
    test.ok(datatypes.week('2005-W52'));
    test.done();
};

exports.time = function (test) {
    test.ok(datatypes.time('00:00:05'));
    test.done();
};

exports.iri = function (test) {
    test.done();
};

exports['iri-ref'] = function (test) {
    test.done();
};

exports.string = function (test) {
    test.done();
};

exports.language = function (test) {
    test.done();
};

exports['media-query'] = function (test) {
    test.done();
};

exports['mime-type'] = function (test) {
    test.done();
};

exports['browsing-content'] = function (test) {
    test.done();
};

exports['browsing-context-or-keyword'] = function (test) {
    test.done();
};

exports['hash-name'] = function (test) {
    test.done();
};

exports.integer = function (test) {
    test.done();
};

exports['integer-non-negative'] = function (test) {
    test.done();
};

exports['integer-positive'] = function (test) {
    test.done();
};

exports.float = function (test) {
    test.done();
};

exports['float-non-negative'] = function (test) {
    test.done();
};

exports['float-positive'] = function (test) {
    test.done();
};

exports['float-exp'] = function (test) {
    test.done();
};

exports['float-exp-positive'] = function (test) {
    test.done();
};

exports['mime-type-list'] = function (test) {
    test.done();
};

exports.circle = function (test) {
    test.done();
};

exports.rectangle = function (test) {
    test.done();
};

exports.polyline = function (test) {
    test.done();
};

exports['xml-name'] = function (test) {
    test.done();
};

exports['meta-charset'] = function (test) {
    test.done();
};

exports['microdata-identifier'] = function (test) {
    test.done();
};

exports.charset = function (test) {
    test.done();
};

exports.refresh = function (test) {
    test.done();
};

exports['paren-start'] = function (test) {
    test.done();
};

exports['paren-end'] = function (test) {
    test.done();
};

exports.color = function (test) {
    test.done();
};

exports['email-address'] = function (test) {
    test.done();
};

exports['email-address-list'] = function (test) {
    test.done();
};

exports.keylabellist = function (test) {
    test.done();
};

exports.zero = function (test) {
    test.done();
};

exports['cdo-cdc-pair'] = function (test) {
    test.done();
};