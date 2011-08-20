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
    return false;
};

// TODO: should match BCP47: http://www.ietf.org/rfc/bcp/bcp47.txt
exports.language = function (input) {
    return false;
};

exports['media-query'] = function (input) {
    return false;
};

exports['mime-type'] = function (input) {
    return false;
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
    return false;
};

exports.circle = function (input) {
    return (/^-?[0-9]+,-?[0-9]+,-?[0-9]+$/).test(input);
};

exports.rectangle = function (input) {
    return false;
};

exports.polyline = function (input) {
    return false;
};

exports['xml-name'] = function (input) {
    return false;
};

exports['meta-charset'] = function (input) {
    return false;
};

exports['microdata-identifier'] = function (input) {
    return false;
};

exports.charset = function (input) {
    return false;
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
    return false;
};

exports['email-address'] = function (input) {
    // http://www.regular-expressions.info/email.html has a few regexes

    // TODO: decide on the right regex
    return (/^[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+(?:\.[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+)*@(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)$/).test(input);
};

exports['email-address-list'] = function (input) {
    return false;
};

exports.keylabellist = function (input) {
    return false;
};

exports.zero = function (input) {
    return false;
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
