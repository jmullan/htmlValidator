module.exports = {
    root: __dirname + '/../',
    pathIgnore: ['*node_modules*']
};

// A lot of these parameters are backwards from the official docs. npm's Nodelint is quite out of date.
var options = {
    adsafe: false,
    bitwise: true,
    browser: true,
    cap: false,
    confusion: false,
    continue: true,
    css: false,
    debug: false,
    devel: true,
    eqeq: false,
    es5: true,
    evil: false,
    forin: false,
    fragment: false,
    indent: 4,
    maxerr: 300,
    maxlen: 1000,
    newcap: true,
    node: true,
    nomen: true,
    on: false,
    passfail: false,
    plusplus: false,
    predef: ['it', 'before', 'beforeEach', 'describe'],
    regexp: true,
    rhino: false,
    safe: false,
    sloppy: true,
    sub: false,
    undef: false,
    unparam: false,
    vars: false,
    white: false,
    widget: false,
    windows: false
};

