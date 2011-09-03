var datatypes = require('./datatypes'),
    util = require('util'),
    _ = require('underscore'),
// Apparently the reference validtor operates slightly differently from the
// specification, so we should copy the validator until we decide otherwise
// validate_by = 'specification'
    validate_by = 'reference validator',
    expect_valid = function () {
        var input = _.toArray(arguments),
            test = input[0],
            validation = input[1],
            args = input.slice(2);

        test.ok(datatypes[validation].apply(null, args), util.inspect(args) + ' should be a valid ' + validation);
    },
    expect_invalid = function () {
        var input = _.toArray(arguments),
            test = input[0],
            validation = input[1],
            args = input.slice(2);

        test.ok(!datatypes[validation].apply(null, args), util.inspect(args) + ' should not be a valid ' + validation);
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

/**
 * https://github.com/cakephp/cakephp/blob/2.0.0-beta/lib/Cake/Test/Case/Utility/ValidationTest.php
 * ValidationTest file
 *
 * PHP Version 5.x
 *
 * CakePHP(tm) Tests <http://book.cakephp.org/view/1196/Testing>
 * Copyright 2005-2011, Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The Open Group Test Suite License
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright 2005-2011, Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://book.cakephp.org/view/1196/Testing CakePHP(tm) Tests
 * @package       Cake.Test.Case.Utility
 * @since         CakePHP(tm) v 1.2.0.4206
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
exports.URL = function (test) {
    expect_valid(test, 'URL', 'http://www.cakephp.org');
    expect_valid(test, 'URL', 'http://cakephp.org');
    expect_valid(test, 'URL', 'http://www.cakephp.org/somewhere#anchor');
    expect_valid(test, 'URL', 'http://192.168.0.1');
    expect_valid(test, 'URL', 'https://www.cakephp.org');
    expect_valid(test, 'URL', 'https://cakephp.org');
    expect_valid(test, 'URL', 'https://www.cakephp.org/somewhere#anchor');
    expect_valid(test, 'URL', 'https://192.168.0.1');
    expect_valid(test, 'URL', 'ftps://www.cakephp.org/pub/cake');
    expect_valid(test, 'URL', 'ftps://cakephp.org/pub/cake');
    expect_valid(test, 'URL', 'ftps://192.168.0.1/pub/cake');
    expect_valid(test, 'URL', 'ftp://www.cakephp.org/pub/cake');
    expect_valid(test, 'URL', 'ftp://cakephp.org/pub/cake');
    expect_valid(test, 'URL', 'ftp://192.168.0.1/pub/cake');
    expect_invalid(test, 'URL', 'ftps://256.168.0.1/pub/cake');
    expect_invalid(test, 'URL', 'ftp://256.168.0.1/pub/cake');
    expect_valid(test, 'URL', 'https://my.domain.com/gizmo/app?class=MySip;proc=start');
    // TODO: @jmullan: Failing URL test
    // expect_valid(test, 'URL', 'www.domain.tld');
    expect_invalid(test, 'URL', 'http://w_w.domain.co_m');
    expect_invalid(test, 'URL', 'http://www.domain.12com');
    expect_invalid(test, 'URL', 'http://www.domain.longttldnotallowed');
    expect_invalid(test, 'URL', 'http://www.-invaliddomain.tld');
    expect_invalid(test, 'URL', 'http://www.domain.-invalidtld');
    expect_valid(test, 'URL', 'http://123456789112345678921234567893123456789412345678951234567896123.com');
    expect_invalid(test, 'URL', 'http://this-domain-is-too-loooooong-by-icann-rules-maximum-length-is-63.com');
    expect_valid(test, 'URL', 'http://www.domain.com/blogs/index.php?blog=6&tempskin=_rss2');
    expect_valid(test, 'URL', 'http://www.domain.com/blogs/parenth()eses.php');
    expect_valid(test, 'URL', 'http://www.domain.com/index.php?get=params&amp;get2=params');
    expect_valid(test, 'URL', 'http://www.domain.com/ndex.php?get=params&amp;get2=params#anchor');
    expect_invalid(test, 'URL', 'http://www.domain.com/fakeenco%ode');
    expect_valid(test, 'URL', 'http://www.domain.com/real%20url%20encodeing');
    expect_valid(test, 'URL', 'http://en.wikipedia.org/wiki/Architectural_pattern_(computer_science)');
    expect_invalid(test, 'URL', 'http://en.(wikipedia).org/');
    expect_invalid(test, 'URL', 'www.cakephp.org', true);
    expect_valid(test, 'URL', 'http://www.cakephp.org', true);
    expect_valid(test, 'URL', 'http://example.com/~userdir/');

    expect_valid(test, 'URL', 'http://example.com/~userdir/subdir/index.html');
    expect_valid(test, 'URL', 'http://www.zwischenraume.de');
    expect_valid(test, 'URL', 'http://www.zwischenraume.cz');
    // TODO: @jmullan: Failing URL test
    // expect_valid(test, 'URL', 'http://www.last.fm/music/浜崎あゆみ');
    expect_valid(test, 'URL', 'http://www.electrohome.ro/images/239537750-284232-215_300[1].jpg');

    expect_valid(test, 'URL', 'http://cakephp.org:80');
    expect_valid(test, 'URL', 'http://cakephp.org:443');
    expect_valid(test, 'URL', 'http://cakephp.org:2000');
    expect_valid(test, 'URL', 'http://cakephp.org:27000');
    expect_valid(test, 'URL', 'http://cakephp.org:65000');

    // TODO: @jmullan: failing IPV6 URL tests
    // expect_valid(test, 'URL', '[2001:0db8::1428:57ab]');
    // expect_valid(test, 'URL', '[::1]');
    // expect_valid(test, 'URL', '[2001:0db8::1428:57ab]:80');
    // expect_valid(test, 'URL', '[::1]:80');
    expect_valid(test, 'URL', 'http://[2001:0db8::1428:57ab]');
    expect_valid(test, 'URL', 'http://[::1]');
    expect_valid(test, 'URL', 'http://[2001:0db8::1428:57ab]:80');
    expect_valid(test, 'URL', 'http://[::1]:80');

    expect_invalid(test, 'URL', '[1::2::3]');
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

// http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#set-of-space-separated-tokens
exports['space-tokens-unordered'] = function (test) {
    expect_invalid(test, 'space-tokens-unordered', 'foo foo');
    expect_invalid(test, 'space-tokens-unordered', 'foo bar', ['bar']);
    expect_valid(test, 'space-tokens-unordered', '');
    expect_valid(test, 'space-tokens-unordered', 'foo bar baz');
    expect_valid(test, 'space-tokens-unordered', ' foo bar   baz ');
    expect_valid(test, 'space-tokens-unordered', 'foo bar', ['bar', 'foo']);
    test.done();
};

exports['space-tokens-ordered'] = function (test) {
    expect_invalid(test, 'space-tokens-unordered', 'foo foo');
    expect_invalid(test, 'space-tokens-unordered', 'foo bar', ['bar']);
    expect_valid(test, 'space-tokens-unordered', '');
    expect_valid(test, 'space-tokens-unordered', 'foo bar baz');
    expect_valid(test, 'space-tokens-unordered', ' foo bar   baz ');
    expect_valid(test, 'space-tokens-unordered', 'foo bar', ['bar', 'foo']);
    test.done();
};

// http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#comma-separated-tokens
exports['comma-tokens'] = function (test) {
    expect_valid(test, 'comma-tokens', 'foo, bar');
    expect_valid(test, 'comma-tokens', ' a ,b,,d d ');

    expect_valid(test, 'comma-tokens', 'foo, bar', function (token, tokens) {
        return _.indexOf(['foo', 'bar'], token) !== -1;
    });

    expect_invalid(test, 'comma-tokens', 'foo, bar', function (token, tokens) {
        return _.indexOf(['bop', 'baz'], token) !== -1;
    });
    test.done();
};
