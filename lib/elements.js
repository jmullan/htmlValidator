var _ = require('underscore'),
    edits = require('./elements/edits'),
    embedded = require('./elements/embedded'),
    forms = require('./elements/forms'),
    grouping = require('./elements/grouping'),
    interactive = require('./elements/interactive'),
    metadata = require('./elements/metadata'),
    root = require('./elements/root'),
    scripting = require('./elements/scripting'),
    sections = require('./elements/sections'),
    tabular = require('./elements/tabular'),
    text = require('./elements/text');

exports.elements = _.extend({}, edits, embedded, forms, grouping, interactive, metadata, root, scripting, sections, tabular, text);
