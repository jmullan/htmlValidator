exports.datetime = function (input) {
    return (/^([0-9]{4,})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\.[0-9]+)?)?Z$/).test(input);
};

exports['datetime-local'] = function (input) {
    return (/^([0-9]{4,})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\.[0-9]+)?)?$/).test(input);
};

exports['datetime-tz'] = function (input) {
    return ("/^([0-9]{4,})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\\.[0-9]+)?(?:Z|(?:([+-][0-9]{2}):([0-9]{2})))$/").test(input);
};

exports['date-or-time'] = function (input) {
    return ("/^(?:(?:([0-9]{4,})-([0-9]{2})-([0-9]{2})(?:T([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\\.[0-9]+)?)?(?:Z|(?:([+-][0-9]{2}):([0-9]{2})))?)?)|(?:([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\\.[0-9]+)?)?(?:Z|(?:([+-][0-9]{2}):([0-9]{2})))?))$/").test(input);
};

exports['date-or-time-content'] = function (input) {
    return ("/^\\p{Zs}*(?:(?:([0-9]{4,})-([0-9]{2})-([0-9]{2})(?:\\p{Zs}*(?:T|\\p{Zs})\\p{Zs}*([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\\.[0-9]+)?)?\\p{Zs}*(?:Z|(?:([+-][0-9]{2}):([0-9]{2})))?)?)|(?:([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\\.[0-9]+)?)?\\p{Zs}*(?:Z|(?:([+-][0-9]{2}):([0-9]{2})))?))\\p{Zs}*$/").test(input);
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

exports.language = function (input) {
    return false;
};

exports['media-query'] = function (input) {
    return false;
};

exports['mime-type'] = function (input) {
    return false;
};

exports['browsing-content'] = function (input) {
    return false;
};

exports['browsing-context-or-keyword'] = function (input) {
    return false;
};

exports['hash-name'] = function (input) {
    return false;
};

exports.integer = function (input) {
    return false;
};

exports['integer-non-negative'] = function (input) {
    return false;
};

exports['integer-positive'] = function (input) {
    return false;
};

exports.float = function (input) {
    return false;
};

exports['float-non-negative'] = function (input) {
    return false;
};

exports['float-positive'] = function (input) {
    return false;
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
    return false;
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
    return false;
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
    return false;
};