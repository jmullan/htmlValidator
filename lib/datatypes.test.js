var datatypes = require('./datatypes'),
    should = require('should'),
    _ = require('underscore'),
// Apparently the reference validtor operates slightly differently from the
// specification, so we should copy the validator until we decide otherwise
// validate_by = 'specification'
    validate_by = 'reference validator',
    expect_valid = function () {
        var input = _.toArray(arguments),
            validation = input[0],
            args = input.slice(1);
        describe('"' + args.join(', ') + '"', function () {
            it('should be valid', function () {
                should.ok(datatypes[validation].apply(null, args));
            });
        });
    },
    expect_invalid = function () {
        var input = _.toArray(arguments),
            validation = input[0],
            args = input.slice(1);

        describe('"' + args.join(', ') + '"', function () {
            it('should not be valid', function () {
                should.ok(!datatypes[validation].apply(null, args));
            });
        });
    };

// See http://wiki.whatwg.org/wiki/MicrosyntaxDescriptions
// http://code.google.com/p/epub-revision/source/browse/trunk/src/schema/mod/datatypes.rnc
// http://www.w3.org/TR/xmlschema-2/#built-in-primitive-datatypes

describe('ID', function () {
    expect_valid('ID', 'a');
    expect_invalid('ID', '');
    expect_invalid('ID', 'a ');
    expect_invalid('ID', 'a b');
});

describe('IDREF', function () {
});

describe('IDREFS', function () {
});

describe('pattern', function () {
});

describe('datetime', function () {
    expect_valid('datetime', '1995-12-31T23:59:59.99Z');
    expect_valid('datetime', '1996-01-01T12:05Z');
    expect_valid('datetime', '1996-01-01T12:05:25.6Z');
});

describe('datetime-local', function () {
    expect_valid('datetime-local', '1996-01-01T12:05');
    // TODO
    // expect_valid('datetime-local', '1996-01-01T12:05:25-02:00');
    // expect_valid('datetime-local', '1996-01-01T12:05:25.6');
});

describe('datetime-tz', function () {
    // TODO
    // expect_valid('datetime-tz', '1995-12-31T23:59:59.99');
    // expect_valid('datetime-tz', '1996-01-01T12:05:25-02:00');
    expect_valid('datetime-tz', '1996-01-01T12:05:25Z');

    if ('specification' === validate_by) {
        expect_valid('datetime-local', '1996-01-01T12:05Z');
    } else if ('reference validator' === validate_by) {
        expect_invalid('datetime-local', '1996-01-01T12:05Z');
    }
});

describe('date-or-time', function () {

    expect_valid('date-or-time', '1996-01-01');
    expect_valid('date-or-time', '12:05:25');
    expect_valid('date-or-time', '1996-01-01T12:05:25-02:00');


    // TODO
    // expect_valid('date-or-time', '1996-01-01T12:05:25.6');

    if ('specification' === validate_by) {
        expect_invalid('date-or-time', '1996-01-01T12:05:25');
        expect_invalid('date-or-time', '12:05:25Z');
    } else if ('reference validator' === validate_by) {
        expect_valid('date-or-time', '1996-01-01T12:05:25');
        expect_valid('date-or-time', '12:05:25Z');
    }
});

describe('date-or-time-content', function () {
});

describe('date', function () {
    expect_valid('date', '1995-12-31');
    expect_invalid('date', '1995-12-3112');
});

describe('month', function () {
    expect_valid('month', '1995-12');
    expect_valid('month', '11995-12');
    expect_invalid('month', '1995-122');
    expect_invalid('month', '');
    expect_invalid('month', '1995');
});

describe('week', function () {
    expect_valid('week', '2005-W52');
    expect_invalid('week', '2005-123');
    expect_invalid('week', '2005-W123');
    expect_invalid('week', '2005-');
    expect_invalid('week', '2005');
});

describe('time', function () {
    expect_valid('time', '00:00:05');
    expect_valid('time', '23:59:00.00000');
    expect_valid('time', '00:00');
    expect_invalid('time', '0:0');
    expect_invalid('time', 'A0:00');
    expect_invalid('time', '110:00');
});

describe('iri', function () {
    // TODO
    // expect_valid('iri', 'http://example.org/hello');
    // expect_valid('iri', 'http://example.org/hello%20world');
    expect_invalid('iri', 'http://example.org/hello world');
    expect_invalid('iri', '/hello');
});

describe('iri-ref', function () {
    // TODO
    // expect_valid('iri','http://example.org/hello');
    // expect_valid('iri','http://example.org/hello%20world');
    expect_invalid('iri', 'http://example.org/hello world');
    // expect_valid('iri', '/hello');
    // expect_valid('iri', '#canvas');
});

describe('string', function () {
    expect_valid('string', '');
    expect_valid('string', 'Hello');
    expect_valid('string', '1234');
    expect_invalid('string', 0);
});

describe('language', function () {
});

describe('media-query', function () {
});

describe('mime-type', function () {
    expect_invalid('mime-type', 'application/html');
    expect_valid('mime-type', 'text/html');
    expect_valid('mime-type', 'text/css');
    expect_valid('mime-type', 'video/x-ms-wmv');
    expect_invalid('mime-type', 'video/vnd.nokia.interleaved-multimedia');
});

describe('browsing-context', function () {
    expect_valid('browsing-context', 'a');
    expect_invalid('browsing-context', '_a');
});

describe('browsing-context-or-keyword', function () {
    expect_valid('browsing-context-or-keyword', 'a');
    expect_valid('browsing-context-or-keyword', '_blank');
    expect_valid('browsing-context-or-keyword', '_self');
    expect_valid('browsing-context-or-keyword', '_parent');
    expect_valid('browsing-context-or-keyword', '_top');
    expect_valid('browsing-context-or-keyword', '_Blank');
    expect_valid('browsing-context-or-keyword', '_Self');
    expect_valid('browsing-context-or-keyword', '_Parent');
    expect_valid('browsing-context-or-keyword', '_Top');
    expect_invalid('browsing-context-or-keyword', '_a');
});

describe('hash-name', function () {
    expect_valid('hash-name', '#a');
    expect_invalid('hash-name', '#');
    expect_invalid('hash-name', 'a');
    expect_invalid('hash-name', '');
});

describe('integer', function () {
    expect_valid('integer', '42');
    expect_valid('integer', '-273');
    expect_invalid('integer', '+42');
    expect_invalid('integer', '42.');
    expect_invalid('hash-name', '42.0');
});

describe('integer-non-negative', function () {
    expect_valid('integer-non-negative', '42');
    expect_invalid('integer-non-negative', '-273');
    expect_invalid('integer-non-negative', '+42');
    expect_invalid('integer-non-negative', '42.');
    expect_invalid('integer-non-negative', '42.0');
});

describe('integer-positive', function () {
    expect_valid('integer-positive', '42');
    expect_invalid('integer-positive', '-273');
    expect_invalid('integer-positive', '+42');
    expect_invalid('integer-positive', '42.');
    expect_invalid('integer-positive', '42.0');
});

describe('float', function () {
    expect_valid('float', '-42.42E+42');
    expect_invalid('float', '.5');
    expect_invalid('float', '+2');

    expect_valid('float', '0');
    expect_invalid('float', '-');
    expect_invalid('float', '.');
    expect_valid('float', '-42.42e+42');
    expect_valid('float', '42.42e+42');
    expect_valid('float', '42.42');
    expect_valid('float', '42');
    expect_valid('float', '0.42');

});

describe('float-non-negative', function () {

    expect_invalid('float-non-negative', '-42.42E+42');
    expect_invalid('float-non-negative', '.5');
    expect_invalid('float-non-negative', '+2');

    expect_invalid('float-non-negative', '-42.42e+42');
    expect_valid('float-non-negative', '42.42e+42');
    expect_valid('float-non-negative', '42.42');
    expect_valid('float-non-negative', '42');
    expect_valid('float-non-negative', '0.42');

    expect_valid('float-non-negative', '42.42E+42');
    expect_valid('float-non-negative', '-000.000');
    expect_invalid('float-non-negative', '-0.01');

});

describe('float-positive', function () {

    expect_invalid('float-positive', '-42.42E+42');
    expect_invalid('float-positive', '.5');
    expect_invalid('float-positive', '+2');

    expect_invalid('float-positive', '-42.42e+42');
    expect_valid('float-positive', '42.42e+42');
    expect_valid('float-positive', '42.42');
    expect_valid('float-positive', '42');
    expect_valid('float-positive', '0.42');

    expect_valid('float-positive', '42.42E+42');
    expect_invalid('float-positive', '-000.000');
    expect_invalid('float-positive', '-0.01');

    expect_invalid('float-positive', '0.0');
    expect_invalid('float-positive', '-2');

});

describe('float-exp', function () {
});

describe('float-exp-positive', function () {
});

describe('mime-type-list', function () {
    expect_invalid('mime-type-list', 'application/html');
    expect_valid('mime-type-list', 'text/html, , text/css');
    expect_valid('mime-type-list', 'text/css, text/html');
    expect_valid('mime-type-list', 'video/x-ms-wmv, text/html , text/css');
    expect_invalid('mime-type-list', 'text/html text/css');
});

describe('circle', function () {
    expect_valid('circle', '5,5,10');
    expect_valid('circle', '-5,0,20');
    expect_invalid('circle', 'circle');
});

describe('rectangle', function () {
    expect_valid('rectangle', '1,2,3,4');
    expect_valid('rectangle', '-1,2,-3,4');
    expect_valid('rectangle', '10,20,30,40');
    expect_valid('rectangle', '-10,20,-30,40');
    expect_invalid('rectangle', '1,2,3');
    expect_invalid('rectangle', '1,2,3,4,');
    expect_invalid('rectangle', '0,0,0,0');
    expect_invalid('rectangle', '3,4,1,2');
    expect_invalid('rectangle', 'a,b,c,d');
    expect_invalid('rectangle', 'rectangle');
});

describe('polyline', function () {
    expect_valid('polyline', '1,2,3,4');
    expect_valid('polyline', '-1,2,-3,4');
    expect_valid('polyline', '10,20,30,40');
    expect_valid('polyline', '-10,20,-30,40');
    expect_valid('polyline', '0,0,0,0');
    expect_valid('polyline', '3,4,1,2');
    expect_valid('polyline', '1,2,3,4,5,6');
    expect_invalid('polyline', '1,2,3');
    expect_invalid('polyline', '1,2,3,4,');
    expect_invalid('polyline', '1,2,3,4,5');
    expect_invalid('polyline', 'a,b,c,d');
    expect_invalid('polyline', 'rectangle');
});

describe('xml-name', function () {
});

describe('meta-charset', function () {
});

describe('microdata-identifier', function () {
});

describe('charset', function () {
    expect_valid('charset', 'utf-8');
    expect_valid('charset', 'UTF-8');
    expect_valid('charset', 'iso-8859-1');
    expect_valid('charset', 'csWindows30Latin1');

    expect_invalid('charset', 'derp');
});

describe('refresh', function () {
});

describe('paren-start', function () {
});

describe('paren-end', function () {
});

describe('color', function () {
    expect_valid('color', '#aaaaaa');
    expect_valid('color', '#AAAAAA');
    expect_valid('color', '#B1000d');
    expect_invalid('color', '#aaaaa');
    expect_invalid('color', '#aaa');
    expect_invalid('color', '#');
    expect_invalid('color', '');
    expect_invalid('color', 'blue');
});

describe('email-address', function () {
    // See http://tools.ietf.org/html/rfc2822#section-3.4.1
    expect_valid('email-address', 'mary@example.net');
    expect_valid('email-address', 'john.q.public@example.com');
    expect_valid('email-address', 'jdoe@example.org');
    expect_valid('email-address', 'sysservices@example.net');
    expect_invalid('email-address', 'foo');
});

describe('email-address-list', function () {
});

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
describe('URL', function () {
    expect_valid('URL', 'http://www.cakephp.org');
    expect_valid('URL', 'http://cakephp.org');
    expect_valid('URL', 'http://www.cakephp.org/somewhere#anchor');
    expect_valid('URL', 'http://192.168.0.1');
    expect_valid('URL', 'https://www.cakephp.org');
    expect_valid('URL', 'https://cakephp.org');
    expect_valid('URL', 'https://www.cakephp.org/somewhere#anchor');
    expect_valid('URL', 'https://192.168.0.1');
    expect_valid('URL', 'ftps://www.cakephp.org/pub/cake');
    expect_valid('URL', 'ftps://cakephp.org/pub/cake');
    expect_valid('URL', 'ftps://192.168.0.1/pub/cake');
    expect_valid('URL', 'ftp://www.cakephp.org/pub/cake');
    expect_valid('URL', 'ftp://cakephp.org/pub/cake');
    expect_valid('URL', 'ftp://192.168.0.1/pub/cake');
    expect_invalid('URL', 'ftps://256.168.0.1/pub/cake');
    expect_invalid('URL', 'ftp://256.168.0.1/pub/cake');
    expect_valid('URL', 'https://my.domain.com/gizmo/app?class=MySip;proc=start');
    // TODO: @jmullan: Failing URL test
    // expect_valid('URL', 'www.domain.tld');
    expect_invalid('URL', 'http://w_w.domain.co_m');
    expect_invalid('URL', 'http://www.domain.12com');
    expect_invalid('URL', 'http://www.domain.longttldnotallowed');
    expect_invalid('URL', 'http://www.-invaliddomain.tld');
    expect_invalid('URL', 'http://www.domain.-invalidtld');
    expect_valid('URL', 'http://123456789112345678921234567893123456789412345678951234567896123.com');
    expect_invalid('URL', 'http://this-domain-is-too-loooooong-by-icann-rules-maximum-length-is-63.com');
    expect_valid('URL', 'http://www.domain.com/blogs/index.php?blog=6&tempskin=_rss2');
    expect_valid('URL', 'http://www.domain.com/blogs/parenth()eses.php');
    expect_valid('URL', 'http://www.domain.com/index.php?get=params&amp;get2=params');
    expect_valid('URL', 'http://www.domain.com/ndex.php?get=params&amp;get2=params#anchor');
    expect_invalid('URL', 'http://www.domain.com/fakeenco%ode');
    expect_valid('URL', 'http://www.domain.com/real%20url%20encodeing');
    expect_valid('URL', 'http://en.wikipedia.org/wiki/Architectural_pattern_(computer_science)');
    expect_invalid('URL', 'http://en.(wikipedia).org/');
    expect_invalid('URL', 'www.cakephp.org', true);
    expect_valid('URL', 'http://www.cakephp.org', true);
    expect_valid('URL', 'http://example.com/~userdir/');

    expect_valid('URL', 'http://example.com/~userdir/subdir/index.html');
    expect_valid('URL', 'http://www.zwischenraume.de');
    expect_valid('URL', 'http://www.zwischenraume.cz');
    // TODO: @jmullan: Failing URL test
    // expect_valid('URL', 'http://www.last.fm/music/浜崎あゆみ');
    expect_valid('URL', 'http://www.electrohome.ro/images/239537750-284232-215_300[1].jpg');

    expect_valid('URL', 'http://cakephp.org:80');
    expect_valid('URL', 'http://cakephp.org:443');
    expect_valid('URL', 'http://cakephp.org:2000');
    expect_valid('URL', 'http://cakephp.org:27000');
    expect_valid('URL', 'http://cakephp.org:65000');

    // TODO: @jmullan: failing IPV6 URL tests
    // expect_valid('URL', '[2001:0db8::1428:57ab]');
    // expect_valid('URL', '[::1]');
    // expect_valid('URL', '[2001:0db8::1428:57ab]:80');
    // expect_valid('URL', '[::1]:80');
    expect_valid('URL', 'http://[2001:0db8::1428:57ab]');
    expect_valid('URL', 'http://[::1]');
    expect_valid('URL', 'http://[2001:0db8::1428:57ab]:80');
    expect_valid('URL', 'http://[::1]:80');

    expect_invalid('URL', '[1::2::3]');
});

describe('keylabellist', function () {
});

describe('zero', function () {
    expect_valid('zero', '0');
    expect_invalid('zero', '');
    expect_invalid('zero', '1');
    expect_invalid('zero', '01');
});

describe('cdo-cdc-pair', function () {
    expect_invalid('cdo-cdc-pair', '<!--');
    expect_valid('cdo-cdc-pair', '<!-- -->');
    expect_valid('cdo-cdc-pair', '<!---->');
    expect_valid('cdo-cdc-pair', '-->');
});

// http://dev.w3.org/html5/spec/common-microsyntaxes.html#set-of-space-separated-tokens
describe('space-tokens-unordered', function () {
    expect_invalid('space-tokens-unordered', 'foo foo');
    expect_invalid('space-tokens-unordered', 'foo bar', ['bar']);
    expect_valid('space-tokens-unordered', '');
    expect_valid('space-tokens-unordered', 'foo bar baz');
    expect_valid('space-tokens-unordered', ' foo bar   baz ');
    expect_valid('space-tokens-unordered', 'foo bar', ['bar', 'foo']);
});

describe('space-tokens-ordered', function () {
    expect_invalid('space-tokens-unordered', 'foo foo');
    expect_invalid('space-tokens-unordered', 'foo bar', ['bar']);
    expect_valid('space-tokens-unordered', '');
    expect_valid('space-tokens-unordered', 'foo bar baz');
    expect_valid('space-tokens-unordered', ' foo bar   baz ');
    expect_valid('space-tokens-unordered', 'foo bar', ['bar', 'foo']);
});

// http://dev.w3.org/html5/spec/common-microsyntaxes.html#comma-separated-tokens
describe('comma-tokens', function () {
    expect_valid('comma-tokens', 'foo, bar');
    expect_valid('comma-tokens', ' a ,b,,d d ');

    expect_valid('comma-tokens', 'foo, bar', function (token, tokens) {
        return _.indexOf(['foo', 'bar'], token) !== -1;
    });

    expect_invalid('comma-tokens', 'foo, bar', function (token, tokens) {
        return _.indexOf(['bop', 'baz'], token) !== -1;
    });
});
