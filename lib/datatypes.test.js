var datatypes = require('./datatypes'),
    util = require('util'),
// Apparently the reference validtor operates slightly differently from the
// specification, so we should copy the validator until we decide otherwise
// validate_by = 'specification'
    validate_by = 'reference validator',
    expect_valid = function (test, validation, string) {
        test.ok(datatypes[validation](string), util.inspect(string) + ' should be a valid ' + validation);
    },
    expect_invalid = function (test, validation, string) {
        test.ok(!datatypes[validation](string), util.inspect(string) + ' should not be a valid ' + validation);
    };

// See http://wiki.whatwg.org/wiki/MicrosyntaxDescriptions
// http://code.google.com/p/epub-revision/source/browse/trunk/src/schema/mod/datatypes.rnc
// http://www.w3.org/TR/xmlschema-2/#built-in-primitive-datatypes

exports.ID = function (test) {
    expect_valid(test, 'ID', 'a');
    expect_invalid(test, 'ID', '');
    expect_invalid(test, 'ID', 'a ');
    expect_invalid(test, 'ID', 'a b');
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
    expect_valid(test, 'datetime', '1995-12-31T23:59:59.99Z');
    expect_valid(test, 'datetime', '1996-01-01T12:05Z');
    expect_valid(test, 'datetime', '1996-01-01T12:05:25.6Z');
    test.done();
};

exports['datetime-local'] = function (test) {
    expect_valid(test, 'datetime-local', '1996-01-01T12:05');
    // TODO
    // expect_valid(test, 'datetime-local', '1996-01-01T12:05:25-02:00');
    // expect_valid(test, 'datetime-local', '1996-01-01T12:05:25.6');
    test.done();
};

exports['datetime-tz'] = function (test) {
    // TODO
    // expect_valid(test, 'datetime-tz', '1995-12-31T23:59:59.99');
    // expect_valid(test, 'datetime-tz', '1996-01-01T12:05:25-02:00');
    expect_valid(test, 'datetime-tz', '1996-01-01T12:05:25Z');

    if ('specification' === validate_by) {
        expect_valid(test, 'datetime-local', '1996-01-01T12:05Z');
    } else if ('reference validator' === validate_by) {
        expect_invalid(test, 'datetime-local', '1996-01-01T12:05Z');
    }
    test.done();
};

exports['date-or-time'] = function (test) {

    expect_valid(test, 'date-or-time', '1996-01-01');
    expect_valid(test, 'date-or-time', '12:05:25');
    expect_valid(test, 'date-or-time', '1996-01-01T12:05:25-02:00');


    // TODO
    // expect_valid(test, 'date-or-time', '1996-01-01T12:05:25.6');

    if ('specification' === validate_by) {
        expect_invalid(test, 'date-or-time', '1996-01-01T12:05:25');
        expect_invalid(test, 'date-or-time', '12:05:25Z');
    } else if ('reference validator' === validate_by) {
        expect_valid(test, 'date-or-time', '1996-01-01T12:05:25');
        expect_valid(test, 'date-or-time', '12:05:25Z');
    }
    test.done();
};

exports['date-or-time-content'] = function (test) {
    test.done();
};

exports.date = function (test) {
    expect_valid(test, 'date', '1995-12-31');
    expect_invalid(test, 'date', '1995-12-3112');
    test.done();
};

exports.month = function (test) {
    expect_valid(test, 'month', '1995-12');
    expect_valid(test, 'month', '11995-12');
    expect_invalid(test, 'month', '1995-122');
    expect_invalid(test, 'month', '');
    expect_invalid(test, 'month', '1995');
    test.done();
};

exports.week = function (test) {
    expect_valid(test, 'week', '2005-W52');
    expect_invalid(test, 'week', '2005-123');
    expect_invalid(test, 'week', '2005-W123');
    expect_invalid(test, 'week', '2005-');
    expect_invalid(test, 'week', '2005');
    test.done();
};

exports.time = function (test) {
    expect_valid(test, 'time', '00:00:05');
    expect_valid(test, 'time', '23:59:00.00000');
    expect_valid(test, 'time', '00:00');
    expect_invalid(test, 'time', '0:0');
    expect_invalid(test, 'time', 'A0:00');
    expect_invalid(test, 'time', '110:00');
    test.done();
};

exports.iri = function (test) {
    // TODO
    // expect_valid(test, 'iri', 'http://example.org/hello');
    // expect_valid(test, 'iri', 'http://example.org/hello%20world');
    expect_invalid(test, 'iri', 'http://example.org/hello world');
    expect_invalid(test, 'iri', '/hello');
    test.done();
};

exports['iri-ref'] = function (test) {
    // TODO
    // expect_valid(test, 'iri','http://example.org/hello');
    // expect_valid(test, 'iri','http://example.org/hello%20world');
    expect_invalid(test, 'iri', 'http://example.org/hello world');
    // expect_valid(test, 'iri', '/hello');
    // expect_valid(test, 'iri', '#canvas');
    test.done();
};

exports.string = function (test) {
    expect_valid(test, 'string', '');
    expect_valid(test, 'string', 'Hello');
    expect_valid(test, 'string', '1234');
    expect_invalid(test, 'string', 0);
    test.done();
};

exports.language = function (test) {
    test.done();
};

exports['media-query'] = function (test) {
    test.done();
};

exports['mime-type'] = function (test) {
    expect_invalid(test, 'mime-type', 'application/html');
    expect_valid(test, 'mime-type', 'text/html');
    expect_valid(test, 'mime-type', 'text/css');
    expect_valid(test, 'mime-type', 'video/x-ms-wmv');
    expect_invalid(test, 'mime-type', 'video/vnd.nokia.interleaved-multimedia');
    test.done();
};

exports['browsing-context'] = function (test) {
    expect_valid(test, 'browsing-context', 'a');
    expect_invalid(test, 'browsing-context', '_a');
    test.done();
};

exports['browsing-context-or-keyword'] = function (test) {
    expect_valid(test, 'browsing-context-or-keyword', 'a');
    expect_valid(test, 'browsing-context-or-keyword', '_blank');
    expect_valid(test, 'browsing-context-or-keyword', '_self');
    expect_valid(test, 'browsing-context-or-keyword', '_parent');
    expect_valid(test, 'browsing-context-or-keyword', '_top');
    expect_valid(test, 'browsing-context-or-keyword', '_Blank');
    expect_valid(test, 'browsing-context-or-keyword', '_Self');
    expect_valid(test, 'browsing-context-or-keyword', '_Parent');
    expect_valid(test, 'browsing-context-or-keyword', '_Top');
    expect_invalid(test, 'browsing-context-or-keyword', '_a');
    test.done();
};

exports['hash-name'] = function (test) {
    expect_valid(test, 'hash-name', '#a');
    expect_invalid(test, 'hash-name', '#');
    expect_invalid(test, 'hash-name', 'a');
    expect_invalid(test, 'hash-name', '');
    test.done();
};

exports.integer = function (test) {
    expect_valid(test, 'integer', '42');
    expect_valid(test, 'integer', '-273');
    expect_invalid(test, 'integer', '+42');
    expect_invalid(test, 'integer', '42.');
    expect_invalid(test, 'hash-name', '42.0');
    test.done();
};

exports['integer-non-negative'] = function (test) {
    expect_valid(test, 'integer-non-negative', '42');
    expect_invalid(test, 'integer-non-negative', '-273');
    expect_invalid(test, 'integer-non-negative', '+42');
    expect_invalid(test, 'integer-non-negative', '42.');
    expect_invalid(test, 'integer-non-negative', '42.0');
    test.done();
};

exports['integer-positive'] = function (test) {
    expect_valid(test, 'integer-positive', '42');
    expect_invalid(test, 'integer-positive', '-273');
    expect_invalid(test, 'integer-positive', '+42');
    expect_invalid(test, 'integer-positive', '42.');
    expect_invalid(test, 'integer-positive', '42.0');
    test.done();
};

exports.float = function (test) {
    expect_valid(test, 'float', '-42.42E+42');
    expect_invalid(test, 'float', '.5');
    expect_invalid(test, 'float', '+2');

    expect_valid(test, 'float', '0');
    expect_invalid(test, 'float', '-');
    expect_invalid(test, 'float', '.');
    expect_valid(test, 'float', '-42.42e+42');
    expect_valid(test, 'float', '42.42e+42');
    expect_valid(test, 'float', '42.42');
    expect_valid(test, 'float', '42');
    expect_valid(test, 'float', '0.42');

    test.done();
};

exports['float-non-negative'] = function (test) {

    expect_invalid(test, 'float-non-negative', '-42.42E+42');
    expect_invalid(test, 'float-non-negative', '.5');
    expect_invalid(test, 'float-non-negative', '+2');

    expect_invalid(test, 'float-non-negative', '-42.42e+42');
    expect_valid(test, 'float-non-negative', '42.42e+42');
    expect_valid(test, 'float-non-negative', '42.42');
    expect_valid(test, 'float-non-negative', '42');
    expect_valid(test, 'float-non-negative', '0.42');

    expect_valid(test, 'float-non-negative', '42.42E+42');
    expect_valid(test, 'float-non-negative', '-000.000');
    expect_invalid(test, 'float-non-negative', '-0.01');

    test.done();
};

exports['float-positive'] = function (test) {

    expect_invalid(test, 'float-positive', '-42.42E+42');
    expect_invalid(test, 'float-positive', '.5');
    expect_invalid(test, 'float-positive', '+2');

    expect_invalid(test, 'float-positive', '-42.42e+42');
    expect_valid(test, 'float-positive', '42.42e+42');
    expect_valid(test, 'float-positive', '42.42');
    expect_valid(test, 'float-positive', '42');
    expect_valid(test, 'float-positive', '0.42');

    expect_valid(test, 'float-positive', '42.42E+42');
    expect_invalid(test, 'float-positive', '-000.000');
    expect_invalid(test, 'float-positive', '-0.01');

    expect_invalid(test, 'float-positive', '0.0');
    expect_invalid(test, 'float-positive', '-2');

    test.done();
};

exports['float-exp'] = function (test) {
    test.done();
};

exports['float-exp-positive'] = function (test) {
    test.done();
};

exports['mime-type-list'] = function (test) {
    expect_invalid(test, 'mime-type-list', 'application/html');
    expect_valid(test, 'mime-type-list', 'text/html, , text/css');
    expect_valid(test, 'mime-type-list', 'text/css, text/html');
    expect_valid(test, 'mime-type-list', 'video/x-ms-wmv, text/html , text/css');
    expect_invalid(test, 'mime-type-list', 'text/html text/css');
    test.done();
};

exports.circle = function (test) {
    expect_valid(test, 'circle', '5,5,10');
    expect_valid(test, 'circle', '-5,0,20');
    expect_invalid(test, 'circle', 'circle');
    test.done();
};

exports.rectangle = function (test) {
    expect_valid(test, 'rectangle', '1,2,3,4');
    expect_valid(test, 'rectangle', '-1,2,-3,4');
    expect_valid(test, 'rectangle', '10,20,30,40');
    expect_valid(test, 'rectangle', '-10,20,-30,40');
    expect_invalid(test, 'rectangle', '1,2,3');
    expect_invalid(test, 'rectangle', '1,2,3,4,');
    expect_invalid(test, 'rectangle', '0,0,0,0');
    expect_invalid(test, 'rectangle', '3,4,1,2');
    expect_invalid(test, 'rectangle', 'a,b,c,d');
    expect_invalid(test, 'rectangle', 'rectangle');
    test.done();
};

exports.polyline = function (test) {
    expect_valid(test, 'polyline', '1,2,3,4');
    expect_valid(test, 'polyline', '-1,2,-3,4');
    expect_valid(test, 'polyline', '10,20,30,40');
    expect_valid(test, 'polyline', '-10,20,-30,40');
    expect_valid(test, 'polyline', '0,0,0,0');
    expect_valid(test, 'polyline', '3,4,1,2');
    expect_valid(test, 'polyline', '1,2,3,4,5,6');
    expect_invalid(test, 'polyline', '1,2,3');
    expect_invalid(test, 'polyline', '1,2,3,4,');
    expect_invalid(test, 'polyline', '1,2,3,4,5');
    expect_invalid(test, 'polyline', 'a,b,c,d');
    expect_invalid(test, 'polyline', 'rectangle');
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
    expect_valid(test, 'color', '#aaaaaa');
    expect_valid(test, 'color', '#AAAAAA');
    expect_valid(test, 'color', '#B1000d');
    expect_invalid(test, 'color', '#aaaaa');
    expect_invalid(test, 'color', '#aaa');
    expect_invalid(test, 'color', '#');
    expect_invalid(test, 'color', '');
    expect_invalid(test, 'color', 'blue');
    test.done();
};

exports['email-address'] = function (test) {
    // See http://tools.ietf.org/html/rfc2822#section-3.4.1
    expect_valid(test, 'email-address', 'mary@example.net');
    expect_valid(test, 'email-address', 'john.q.public@example.com');
    expect_valid(test, 'email-address', 'jdoe@example.org');
    expect_valid(test, 'email-address', 'sysservices@example.net');
    expect_invalid(test, 'email-address', 'foo');
    test.done();
};

exports['email-address-list'] = function (test) {
    test.done();
};

exports.keylabellist = function (test) {
    test.done();
};

exports.zero = function (test) {
    expect_valid(test, 'zero', '0');
    expect_invalid(test, 'zero', '');
    expect_invalid(test, 'zero', '1');
    expect_invalid(test, 'zero', '01');
    test.done();
};

exports['cdo-cdc-pair'] = function (test) {
    expect_invalid(test, 'cdo-cdc-pair', '<!--');
    expect_valid(test, 'cdo-cdc-pair', '<!-- -->');
    expect_valid(test, 'cdo-cdc-pair', '<!---->');
    expect_valid(test, 'cdo-cdc-pair', '-->');
    test.done();
};
