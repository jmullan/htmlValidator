var mime = require('mime'),
    charsets = require('./charsets').charsets,
    _ = require('underscore');

exports.ID = function (input) {
    return (/^[^ \t\n\r]+$/).test(input);
};

exports.datetime = function (input) {
    return (/^([0-9]{4,})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\.[0-9]+)?)?Z$/).test(input);
};

exports['datetime-local'] = function (input) {
    return (/^([0-9]{4,})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\.[0-9]+)?)?$/).test(input);
};

exports['datetime-tz'] = function (input) {
    return (/^([0-9]{4,})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\\.[0-9]+)?(?:Z|(?:([+\-][0-9]{2}):([0-9]{2})))$/).test(input);
};

exports['date-or-time'] = function (input) {
    return (/^(?:(?:([0-9]{4,})-([0-9]{2})-([0-9]{2})(?:T([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\\.[0-9]+)?)?(?:Z|(?:([+\-][0-9]{2}):([0-9]{2})))?)?)|(?:([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\\.[0-9]+)?)?(?:Z|(?:([+\-][0-9]{2}):([0-9]{2})))?))$/).test(input);
};

exports['date-or-time-content'] = function (input) {
    return false;
    //    return (/^\\p{Zs}*(?:(?:([0-9]{4,})-([0-9]{2})-([0-9]{2})(?:\\p{Zs}*(?:T|\\p{Zs})\\p{Zs}*([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\\.[0-9]+)?)?\\p{Zs}*(?:Z|(?:([+\-][0-9]{2}):([0-9]{2})))?)?)|(?:([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\\.[0-9]+)?)?\\p{Zs}*(?:Z|(?:([+\-][0-9]{2}):([0-9]{2})))?))\\p{Zs}*$/).test(input);
};

exports.date = function (input) {
    return (/^([0-9]{4,})-([0-9]{2})-([0-9]{2})$/).test(input);
};

exports.month = function (input) {
    return (/^([0-9]{4,})-([0-9]{2})$/).test(input);
};

exports.week = function (input) {
    return (/^([0-9]{4,})-W([0-9]{2})$/).test(input);
};

exports.time = function (input) {
    return (/^([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\.[0-9]+)?)?$/).test(input);
};

exports.iri = function (input) {
    return false;
};

exports['iri-ref'] = function (input) {
    return false;
};

exports.string = function (input) {
    // The spirit of this restriction seems to be such that a string cannot
    // contain another element. I thought about testing it against /./ or
    // /^.*$/, but that should match anything with a toString method?
    return 'string' === typeof input;
};

// TODO: should match BCP47: http://www.ietf.org/rfc/bcp/bcp47.txt
exports.language = function (input) {
    return false;
};

exports['media-query'] = function (input) {
    // http://www.w3.org/TR/css3-mediaqueries/
    // whattf builds a state machine here. UGH.
    return false;
};

exports['mime-type'] = function (input) {
    return !!mime.extension(input);
};

exports['browsing-context'] = function (input) {
    return (/^[^_].*$/).test(input);
};

exports['browsing-context-or-keyword'] = function (input) {
    return (/^[^_].*$/).test(input) || (/^_(blank|self|parent|top)$/i).test(input);
};

exports['hash-name'] = function (input) {
    return (/^#.+$/).test(input);
};

exports.integer = function (input) {
    return (/^-?[0-9]+$/).test(input);
};

exports['integer-non-negative'] = function (input) {
    return (/^[0-9]+$/).test(input);
};

exports['integer-positive'] = function (input) {
    return (/^[0-9]*[1-9]+[0-9]*$/).test(input);
};

exports.float = function (input) {
    return (/^-?([0-9]+\.)?[0-9]+([Ee]\+[0-9]+)?$/).test(input);
};

exports['float-non-negative'] = function (input) {
    return (/^([0-9]+\.)?[0-9]+([Ee]\+[0-9]+)?$/).test(input) || (/^-0+(\.0+)$/).test(input);
};

exports['float-positive'] = function (input) {
    return (
        // positive whole numbers and anything with a non-zero numeric
        // character after the decimal point
        (/^([0-9]+\.)?[0-9]*[1-9]+[0-9]*([Ee]\+[0-9]+)?$/).test(input)
        // anything with a non-zero numeric character before the decimal point
        || (/^[0-9]*[1-9]+[0-9]*(\.[0-9]*)?([Ee]\+[0-9]+)?$/).test(input)
    );
};

exports['float-exp'] = function (input) {
    return false;
};

exports['float-exp-positive'] = function (input) {
    return false;
};

exports['mime-type-list'] = function (input) {
    return exports['comma-tokens'](input, exports['mime-type']);
};

exports.circle = function (input) {
    return (/^-?[0-9]+,-?[0-9]+,-?[0-9]+$/).test(input);
};

exports.rectangle = function (input) {
    var matched = input.match(/^(-?[0-9]+),(-?[0-9]+),(-?[0-9]+),(-?[0-9]+)$/);
    return (matched && (matched[1] < matched[3]) && (matched[2] < matched[4]));
};

exports.polyline = function (input) {
    var ok = (/^[,\-0-9]+/).test(input),
        values,
        i;
    if (ok) {
        values = input.split(',');
        ok = ((values.length >= 4) && (0 === (values.length % 2)));
        for (i in values) {
            if (!((/^-?[0-9]+$/).test(values[i]))) {
                ok = false;
                break;
            }
        }
    }
    return ok;
};

exports['xml-name'] = function (input) {
    return false;
};

exports['meta-charset'] = function (input) {
    // The validator is willfully violating the RFC spec.
    // http://www.whatwg.org/specs/web-apps/current-work/multipage/semantics.html#character-encoding-declaration
    return false;
};

exports['microdata-identifier'] = function (input) {
    return false;
};

exports.charset = function (input) {
    // ASCII-compatible character encoding
    // http://www.whatwg.org/specs/web-apps/current-work/multipage/infrastructure.html#ascii-compatible-character-encoding
    // http://tools.ietf.org/html/rfc2978
    if (!(/^([a-zA-Z0-9-!#$%&\'+_`{}~\^])+$/).test(input)) {
        return false;
    }

    input = input.toLowerCase();

    var charset = _.select(charsets, function (val) {
        if (val.hasOwnProperty('aliases')) {
            var alias = _.select(val.aliases, function (val) {
                return val.toLowerCase() === input;
            });

            if (alias.length === 1) {
                return true;
            }
        }

        return val.name.toLowerCase() === input || (val.hasOwnProperty('preferred') && val.preferred.toLowerCase() === input);
    });

    if (charset.length !== 1) {
        return false;
    }

    if (charset.hasOwnProperty('preferred') && charset.preferred.toLowerCase() !== input) {
        // TODO: throw a warning about not using preferred.
    }

    return true;
};

exports.refresh = function (input) {
    return false;
};

exports['paren-start'] = function (input) {
    return false;
};

exports['paren-end'] = function (input) {
    return false;
};

exports.color = function (input) {
    return (/#[A-Za-z0-9]{6}/).test(input);
};

exports['email-address'] = function (input) {
    // http://www.regular-expressions.info/email.html has a few regexes

    // TODO: decide on the right regex
    return (/^[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+(?:\.[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+)*@(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)$/).test(input);
};

exports['email-address-list'] = function (input) {
    return false;
};

/**
 * https://github.com/cakephp/cakephp/blob/2.0.0-beta/lib/Cake/Utility/Validation.php
 * Validation Class.  Used for validation of model data
 *
 * PHP Version 5.x
 *
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright 2005-2011, Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright 2005-2011, Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://cakephp.org CakePHP(tm) Project
 * @package       Cake.Utility
 * @since         CakePHP(tm) v 1.2.0.3830
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
exports.URL = function (input) {
    function preg_quote(str, delimiter) {
        return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
    }

    var hostname = '(?:[a-z0-9][-a-z0-9]*\\.)*(?:[a-z0-9][-a-z0-9]{0,62})\\.(?:(?:[a-z]{2}\\.)?[a-z]{2,4}|museum|travel)',
        ipv4 = '(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|255[0-5])\\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])',
        ipv6 = '((([0-9A-Fa-f]{1,4}:){7}(([0-9A-Fa-f]{1,4})|:))|(([0-9A-Fa-f]{1,4}:){6}' +
                '(:|((25[0-5]|2[0-4]\\d|[01]?\\d{1,2})(\\.(25[0-5]|2[0-4]\\d|[01]?\\d{1,2})){3})' +
                '|(:[0-9A-Fa-f]{1,4})))|(([0-9A-Fa-f]{1,4}:){5}((:((25[0-5]|2[0-4]\\d|[01]?\\d{1,2})' +
                '(\\.(25[0-5]|2[0-4]\\d|[01]?\\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}:)' +
                '{4}(:[0-9A-Fa-f]{1,4}){0,1}((:((25[0-5]|2[0-4]\\d|[01]?\\d{1,2})(\\.(25[0-5]|2[0-4]\\d|[01]?\\d{1,2}))' +
                '{3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}:){3}(:[0-9A-Fa-f]{1,4}){0,2}' +
                '((:((25[0-5]|2[0-4]\\d|[01]?\\d{1,2})(\\.(25[0-5]|2[0-4]\\d|[01]?\\d{1,2})){3})?)|' +
                '((:[0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}:){2}(:[0-9A-Fa-f]{1,4}){0,3}' +
                '((:((25[0-5]|2[0-4]\\d|[01]?\\d{1,2})(\\.(25[0-5]|2[0-4]\\d|[01]?\\d{1,2}))' +
                '{3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}:)(:[0-9A-Fa-f]{1,4})' +
                '{0,4}((:((25[0-5]|2[0-4]\\d|[01]?\\d{1,2})(\\.(25[0-5]|2[0-4]\\d|[01]?\\d{1,2})){3})?)' +
                '|((:[0-9A-Fa-f]{1,4}){1,2})))|(:(:[0-9A-Fa-f]{1,4}){0,5}((:((25[0-5]|2[0-4]' +
                '\\d|[01]?\\d{1,2})(\\.(25[0-5]|2[0-4]\\d|[01]?\\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4})' +
                '{1,2})))|(((25[0-5]|2[0-4]\\d|[01]?\\d{1,2})(\\.(25[0-5]|2[0-4]\\d|[01]?\\d{1,2})){3})))(%.+)?',
        validChars = '([' + preg_quote('!"$&\'()*+,-.@_:;=~[]') + '\\/0-9a-z\\p{L}\\p{N}]|(%[0-9a-f]{2}))',
        regex = '^((https?|ftps?|file|news|gopher):\\/\\/)' +
            '(?:' + ipv4 + '|\\[' + ipv6 + '\\]|' + hostname + ')(?::[1-9][0-9]{0,4})?' +
            '(?:\\/?|\\/' + validChars + '*)?' +
            '(?:\\?' + validChars + '*)?' +
            '(?:#' + validChars + '*)?$';

    return (new RegExp(regex, 'i')).test(input);
};

exports.keylabellist = function (input) {
    return false;
};

exports.zero = function (input) {
    return input === '0';
};

exports['cdo-cdc-pair'] = function (input) {
    var i,
        c,
    state = 'DATA';

    for (i = 0; i < input.length; i += 1) {
        c = input.charAt(i);
        switch (state) {
        case 'DATA':
            if ('<' === c) {
                state = 'LESS_THAN_SIGN';
            }
            break;
        case 'LESS_THAN_SIGN':
            if ('!' === c) {
                state = 'LESS_THAN_SIGN_BANG';
            } else {
                state = 'DATA';
            }
            break;
        case 'LESS_THAN_SIGN_BANG':
            if ('-' === c) {
                state = 'LESS_THAN_SIGN_BANG_HYPHEN';
            } else {
                state = 'DATA';
            }
            break;
        case 'LESS_THAN_SIGN_BANG_HYPHEN':
            if ('-' === c) {
                state = 'HAS_CDO';
            } else {
                state = 'DATA';
            }
            break;
        case 'HAS_CDO':
            if ('-' === c) {
                state = 'HAS_CDO_AND_HYPHEN';
            }
            break;
        case 'HAS_CDO_AND_HYPHEN':
            if ('-' === c) {
                state = 'HAS_CDO_AND_DOUBLE_HYPHEN';
            }
            break;
        case 'HAS_CDO_AND_DOUBLE_HYPHEN':
            if ('>' === c) {
                state = 'DATA';
            } else {
                state = 'HAS_CDO';
            }
            break;
        }
    }
    return (
        state !== 'HAS_CDO'
        && state !== 'HAS_CDO_AND_HYPHEN'
        && state !== 'HAS_CDO_AND_DOUBLE_HYPHEN'
    );

};

exports.tokens = function (tokens, allowed) {
    var uniq = _.uniq(tokens),
        ret = true;

    if (tokens.length !== uniq.length) {
        return false;
    }

    if (_.isArray(allowed) && _.difference(tokens, allowed).length) {
        return false;
    }

    if (typeof allowed === 'function') {
        _.each(tokens, function (token) {
            if (!allowed(token, tokens)) {
                ret = false;
            }
        });
        return ret;
    }

    return ret;
};

exports['space-tokens-unordered'] = function (input, allowed) {
    var tokens = _.without(input.split(' '), '');

    return exports.tokens(tokens, allowed);
};

exports['space-tokens-ordered'] = function (input, allowed) {
    return exports['space-tokens-unordered'](input, allowed);
};

exports['comma-tokens'] = function (input, allowed) {
    var tokens = _.map(_.without(input.split(','), '', ' '), function (token) {
            return token.trim();
        });

    return exports.tokens(tokens, allowed);
};

