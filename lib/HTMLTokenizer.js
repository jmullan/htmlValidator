/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 * Copyright (C) 2009 Torch Mobile, Inc. http://www.torchmobile.com/
 * Copyright (C) 2010 Google, Inc. All Rights Reserved.
 * Copyright (C) 2012 Jesse Mullan All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var util = require('util'),
    TokenHelper = function () {
        this.name = '';
        this.type = '';
        this.data = '';
        this.attributes = [];
        this.selfClosing = false;
        this.currentAttribute = null;
    },
    HTMLTokenizer = function (source) {
        this.shouldAllowCDATA = false;
        this.source = source;
        this.lines = source.split(/\r\n|\r|\n/);
        this.sourcePointer = -1;
        this.state = 'Data';
        this.token = new TokenHelper();
        this.tokens = [];
        this.lineNumber = 0;
        this.skipLeadingNewLineForListing = false;
        this.forceNullCharacterReplacement = false;
        this.additionalAllowedCharacter = '';
        this.bufferedEndTagName = '';
        this.usePreHTML5ParserQuirks = null;
        this.temporaryBuffer = '';
        this.appropriateEndTagName = null;
        this.forceQuirks = false;
    },
    HTMLTokenizerState = {},
    HTMLTokenTypes = {},
    isASCIIUpper = function (c) {
        return (/^[A-Z]+$/).test(c);
    },
    isASCIILower = function (c) {
        return (/^[a-z]+$/).test(c);
    },
    QualifiedName = function () {},
    AtomicString = function () {},
    assert = require('assert'),
    _ = require('underscore'),
    notImplemented = function () {
        assert.ok(false, 'Not implemented');
    },
    notReached = function () {
        assert.ok(false, 'Should not have gotten to this line in the file.');
    },
    InputStreamPreprocessor = {};


TokenHelper.prototype.addNewAttribute = function () {
    this.currentAttribute = {name: '', value: ''};
    this.attributes[this.attributes.length] = this.currentAttribute;
};
TokenHelper.prototype.appendToAttributeName = function (cc) {
    this.currentAttribute.name = this.currentAttribute.name + cc;
};
TokenHelper.prototype.appendToAttributeValue = function (cc) {
    this.currentAttribute.value = this.currentAttribute.value + cc;
};
TokenHelper.prototype.appendToCharacter = function () {
    notImplemented();
};
TokenHelper.prototype.appendToComment = function (cc) {
    this.data = this.data + cc;
};
TokenHelper.prototype.appendToName = function (string) {
    assert.ok(this.type === 'StartTag' || this.type === 'EndTag' || this.type === 'DOCTYPE');
    this.name = this.name + string;
};
TokenHelper.prototype.appendToPublicIdentifier = function () {
    notImplemented();
};
TokenHelper.prototype.appendToSystemIdentifier = function () {
    notImplemented();
};
TokenHelper.prototype.beginAttributeName = function () {
    assert.ok(this.type === 'StartTag' || this.type === 'EndTag');
    notImplemented();
};
TokenHelper.prototype.beginAttributeValue = function () {
    notImplemented();
};
TokenHelper.prototype.beginComment = function (cc) {
    this.setType('comment');
};
TokenHelper.prototype.beginDOCTYPE = function (cc) {
    this.setType('DOCTYPE');
    this.appendToName(cc);
};
TokenHelper.prototype.beginEndTag = function (cc) {
    this.setType('EndTag');
    this.appendToName(cc);
};
TokenHelper.prototype.beginStartTag = function (cc) {
    this.setType('StartTag');
    this.appendToName(cc);
    this.selfClosing = false;
};
TokenHelper.prototype.setType = function (type) {
    assert('' === this.type);
    this.type = type;
};
TokenHelper.prototype.addStringToData = function (string) {
    if (null !== string) {
        this.data = this.data + string;
    }
};
TokenHelper.prototype.endAttributeName = function () {
    notImplemented();
};
TokenHelper.prototype.endAttributeValue = function () {
    notImplemented();
};
HTMLTokenizer.prototype.setForceQuirks = function () {
    this.forceQuirks = true;
};
TokenHelper.prototype.setPublicIdentifierToEmptyString = function () {
    notImplemented();
};
TokenHelper.prototype.setSelfClosing = function () {
    assert.ok(this.type === 'StartTag' || this.type === 'EndTag');
    this.selfClosing = true;
};
TokenHelper.prototype.setSystemIdentifierToEmptyString = function () {
    notImplemented();
};
TokenHelper.prototype.type = function () {
    return this.type;
};

HTMLTokenizer.prototype.dump = function () {
    console.log(this.source);
    console.log(util.inspect(this.tokens, false, 10));
};

HTMLTokenizer.prototype.EOF = function () {
    return this.sourcePointer >= this.source.length;
};

HTMLTokenizer.prototype.lookAhead = function (lookForString) {
    var subString = this.source.substr(this.sourcePointer, lookForString.length);
    if (subString.length < lookForString.length) {
        return 'NotEnoughCharacters';
    } else if (subString === lookForString) {
        return 'DidMatch';
    } else {
        return false;
    }
};


HTMLTokenizer.prototype.lookAheadIgnoringCase = function (lookForString) {
    var subString = this.source.substr(this.sourcePointer, lookForString.length);
    if (subString.length < lookForString.length) {
        return 'NotEnoughCharacters';
    } else if (subString.toLowerCase() === lookForString.toLowerCase()) {
        return 'DidMatch';
    } else {
        return false;
    }
};

HTMLTokenizer.prototype.isWhiteSpace = function (string) {
    return (/^[\u0020\u0009\u000D\u000A]+$/).test(string);
};

HTMLTokenizer.prototype.haveBufferedCharacterToken = function () {
    assert.ok(false);
};


HTMLTokenizer.prototype.advanceTo = function (state) {
    /* I think that this is supposed to buffer a character and switch the state*/
    this.state = state;
};
HTMLTokenizer.prototype.reconsumeIn = function (state) {
    /* consume buffer in the given state, but do not change the current state */
    notImplemented();
    return true;
};
HTMLTokenizer.prototype.switchTo = function (state) {
    /* I think that this changes the state but does not update the current buffer */
    this.state = state;
};

HTMLTokenizer.prototype.emitAndResumeIn = function (state) {
    /* Flush the buffer as a token, change state */
    var token = {
        name: this.token.name,
        type: this.token.type,
        data: this.token.data,
        attributes: this.token.attributes,
        selfClosing: this.token.selfClosing
    };
    this.tokens.push(token);
    this.token = new TokenHelper();
    this.state = state;
};
HTMLTokenizer.prototype.flushEmitAndReconsumeIn = function () {
    notImplemented();
};

HTMLTokenizer.prototype.consumeHTMLEntity = function () {
    notImplemented();
};

HTMLTokenizer.prototype.advanceStringAndASSERT = function (findString) {
    assert(this.lookAhead(findString));
    this.sourcePointer += findString.length - 1;
    /* TODO consume the string as a token? */
};

HTMLTokenizer.prototype.advanceStringAndASSERTIgnoringCase = function (findString) {
    assert(this.lookAheadIgnoringCase(findString));
    this.sourcePointer += findString.length - 1;
    /* TODO consume the string as a token? */
};

HTMLTokenizer.prototype.flushBufferedEndTag = function () {
    assert.ok(this.token.type() === HTMLTokenTypes.Character || this.token.type() === HTMLTokenTypes.Uninitialized);

    this.source.advance(this.lineNumber);
    if (this.token.type() === HTMLTokenTypes.Character) {
        return true;
    }
    this.token.beginEndTag(this.bufferedEndTagName);
    this.bufferedEndTagName = '';
    return false;
};

HTMLTokenizer.prototype.flushEmitAndResumeIn = function (state) {
    this.state = state;
    this.flushBufferedEndTag();
    return true;
};

HTMLTokenizer.prototype.peek = function (lineNumber) {
    return (this.lines.length > lineNumber) && this.lines[lineNumber].length;
};

HTMLTokenizer.prototype.updateStateFor = function (tagName, frame) {
    if (tagName === 'textarea' || tagName === 'title') {
        this.setState('RCDATA');
    } else if (tagName === 'plaintext') {
        this.setState('PLAINTEXT');
    } else if (tagName === 'script') {
        this.setState('ScriptData');
    } else if (
        tagName === 'style'
            || tagName === 'iframe'
            || tagName === 'xmp'
            || (tagName === 'noembed')/* && HTMLTreeBuilder.pluginsEnabled(frame) */
            || tagName === 'noframes'
            || (tagName === 'noscript')/* && HTMLTreeBuilder.scriptEnabled(frame) */
    ) {
        this.setState('RAWTEXT');
    }
};

HTMLTokenizer.prototype.temporaryBufferIs = function (expectedString) {
    return this.temporaryBuffer === expectedString;
};

HTMLTokenizer.prototype.addToPossibleEndTag = function (cc) {
    assert.ok(HTMLTokenizerState.isEndTagBufferingState(this.state));
    this.bufferedEndTagName += cc;
};

HTMLTokenizer.prototype.isAppropriateEndTag = function () {
    return this.bufferedEndTagName === this.appropriateEndTagName;
};

HTMLTokenizer.prototype.parseError = function () {
    notImplemented();
};

HTMLTokenizer.prototype.nextInputCharacter = function () {
    this.sourcePointer += 1;
    return this.currentInputCharacter();
};

HTMLTokenizer.prototype.currentInputCharacter = function () {
    return this.getInputCharacter(this.sourcePointer);
};

HTMLTokenizer.prototype.getInputCharacter = function (index) {
    if (this.sourcePointer >= this.source.length) {
        return 'EOF';
    } else {
        return this.source.charAt(this.sourcePointer);
    }
};

HTMLTokenizer.prototype.flushAndAdvanceTo = function (state) {
    this.state = state;
    return this.flushBufferedEndTag();
};

HTMLTokenizer.prototype.emitEndOfFile = function () {
    return true;
};

HTMLTokenizer.prototype.emitCharacterToken = function (cc) {
    this.tokens.push(cc);
    return true;
};

HTMLTokenizer.prototype.attemptConsumeCharacterReference = function (additionalAllowedCharacter) {
    /* TODO try to consume a character */
    if (this.consumeCharacterReference(additionalAllowedCharacter)) {
        /* emit the token as a reference */
        return false;
    } else {
        return this.emitCharacterToken(this.currentInputCharacter());
    }
};

HTMLTokenizer.prototype.consumeCharacterReference = function (additionalAllowedCharacter) {
    // http://www.whatwg.org/specs/web-apps/current-work/multipage/tokenization.html#tokenizing-character-references
    var i = this.sourcePointer + 1,
        c = this.getInputCharacter(i),
        chunk = '',
        o = null,
        replacements = [],
        exclusions = [0x000B, 0xFFFE, 0xFFFF, 0x1FFFE, 0x1FFFF, 0x2FFFE, 0x2FFFF, 0x3FFFE, 0x3FFFF, 0x4FFFE, 0x4FFFF, 0x5FFFE, 0x5FFFF, 0x6FFFE, 0x6FFFF, 0x7FFFE, 0x7FFFF, 0x8FFFE, 0x8FFFF, 0x9FFFE, 0x9FFFF, 0xAFFFE, 0xAFFFF, 0xBFFFE, 0xBFFFF, 0xCFFFE, 0xCFFFF, 0xDFFFE, 0xDFFFF, 0xEFFFE, 0xEFFFF, 0xFFFFE, 0xFFFFF, 0x10FFFE, 0x10FFFF];

    replacements[0x00] = "\uFFFD";
    replacements[0x0D] = "\u000D";
    replacements[0x80] = "\u20AC";
    replacements[0x81] = "\u0081";
    replacements[0x82] = "\u201A";
    replacements[0x83] = "\u0192";
    replacements[0x84] = "\u201E";
    replacements[0x85] = "\u2026";
    replacements[0x86] = "\u2020";
    replacements[0x87] = "\u2021";
    replacements[0x88] = "\u02C6";
    replacements[0x89] = "\u2030";
    replacements[0x8A] = "\u0160";
    replacements[0x8B] = "\u2039";
    replacements[0x8C] = "\u0152";
    replacements[0x8D] = "\u008D";
    replacements[0x8E] = "\u017D";
    replacements[0x8F] = "\u008F";
    replacements[0x90] = "\u0090";
    replacements[0x91] = "\u2018";
    replacements[0x92] = "\u2019";
    replacements[0x93] = "\u201C";
    replacements[0x94] = "\u201D";
    replacements[0x95] = "\u2022";
    replacements[0x96] = "\u2013";
    replacements[0x97] = "\u2014";
    replacements[0x98] = "\u02DC";
    replacements[0x99] = "\u2122";
    replacements[0x9A] = "\u0161";
    replacements[0x9B] = "\u203A";
    replacements[0x9C] = "\u0153";
    replacements[0x9D] = "\u009D";
    replacements[0x9E] = "\u017E";
    replacements[0x9F] = "\u0178";

    if (/^[\u0009\u000a\u000c\u0020\u0036\u0026]$/.test()) {
        return false;
    } else if (c === additionalAllowedCharacter) {
        return false;
    } else if (c === '#') {
        i += 1;
        c = this.getInputCharacter(i);
        if (/^[Xx]$/.test(c)) {
            while (true) {
                i += 1;
                c = this.getInputCharacter(i);
                if (/^[0-9A-Fa-f]$/.test(c)) {
                    /* TODO is there a better way to assemble this string without doing inadvertant type casting? */
                    chunk += c.toString();
                } else {
                    break;
                }
            }
            if (!chunk.length()) {
                this.parseError();
                return false;
            } else {
                o = parseInt(chunk, 16);
            }
        } else if (/^[0-9]$/.test(c)) {
            /* Move back one, so the loop can move forward again */
            i -= 1;
            while (true) {
                i += 1;
                c = this.getInputCharacter(i);
                if (/^[0-9]$/.test(c)) {
                    /* TODO is there a better way to assemble this string without doing inadvertant type casting? */
                    chunk += c.toString();
                } else {
                    break;
                }
            }
            if (!chunk.length()) {
                this.parseError();
                return false;
            } else {
                o = parseInt(chunk, 10);
            }
        } else {
            this.parseError();
            return false;
        }
        i += 1;
        c = this.getInputCharacter(i);
        if (';' !== c) {
            this.parseError();
            return false;
        }
        if (undefined !== replacements[o]) {
            this.parseError();
            /* TODO emit the replacement character token */
        }
        if (
            (0x0001 <= o && 0x0008 >= o)
                || (0x000E <= o && 0x001F >= o)
                || (0x007F <= o && 0x009F >= o)
                || (0xFDD0 <= o && 0xFDEF >= o)
                || _.include(exclusions, o)
        ) {
            this.parseError();
            /* TODO emit the character token anyway */
        }
    } else {
        /* TODO get a named token */
        return false;
    }
    return false;
};

HTMLTokenizer.prototype.nextToken = function () {
    var result,
        decodedEntity,
        notEnoughCharacters,
        success,
        i,
        cc,
        token;

    if ('' !== this.bufferedEndTagName && !HTMLTokenizerState.isEndTagBufferingState(this.state)) {
        // FIXME: This should call this.flushBufferedEndTag().
        // We started an end tag during our last iteration.
        this.token.beginEndTag(this.bufferedEndTagName);
        this.bufferedEndTagName.clear();
        if (this.state === 'Data') {
            // We're back in the data state, so we must be done with the tag.
            return true;
        }
    }

    if ('' === this.source || !this.peek(this.lineNumber)) {
        return this.haveBufferedCharacterToken();
    }
    cc = this.nextInputCharacter();

    // http://www.whatwg.org/specs/web-apps/current-work/multipage/tokenization.html#parsing-main-inbody
    // Note that this logic is different than the generic \r\n collapsing
    // handled in the input stream preprocessor. This logic is here as an
    // "authoring convenience" so folks can write:
    //
    // <pre>
    // lorem ipsum
    // lorem ipsum
    // </pre>
    //
    // without getting an extra newline at the start of their <pre> element.
    if (this.skipLeadingNewLineForListing) {
        this.skipLeadingNewLineForListing = false;
        if (cc === '\n') {
            if (this.state === 'Data') {
                return this.advanceTo('Data');
            }
            if (this.state === 'RCDATA') {
                return this.advanceTo('RCDATA');
            }
            // When parsing text/plain documents, we run the tokenizer in the
            // PLAINTEXTState and ignore this.skipLeadingNewLineForListing.
            assert.ok(this.state === 'PLAINTEXT');
        }
    }

    // console.log(util.inspect([cc, this.state]));

    // Source: http://www.whatwg.org/specs/web-apps/current-work/#tokenization
    // http://www.whatwg.org/specs/web-apps/current-work/multipage/tokenization.html#tokenization
    switch (this.state) {
    case 'Data':
        if (cc === '&') {
            return this.advanceTo('CharacterReferenceInData');
        } else if (cc === '<') {
            return this.advanceTo('TagOpen');
        } else if (cc === "\u0000") {
            this.parseError();
            return this.emitCharacterToken(cc);
        } else if (cc === 'EOF') {
            return this.emitEndOfFile();
        } else {
            return this.emitCharacterToken(cc);
        }

    case 'CharacterReferenceInData':
        this.attemptConsumeCharacterReference();
        return this.switchTo('Data');

    case 'RCDATA':
        if (cc === '&') {
            return this.advanceTo('CharacterReferenceInRCDATA');
        } else if (cc === '<') {
            return this.advanceTo('RCDATALessThanSign');
        } else if (cc === "\u0000") {
            this.parseError();
            return this.emitCharacterToken("\uFFFD");
        } else if (cc === 'EOF') {
            return this.emitEndOfFile();
        } else {
            return this.emitCharacterToken(cc);
        }

    case 'CharacterReferenceInRCDATA':
        this.attemptConsumeCharacterReference();
        return this.switchTo('RCDATA');

    case 'RAWTEXT':
        if (cc === '<') {
            return this.advanceTo('RAWTEXTLessThanSign');
        } else if (cc === "\u0000") {
            this.parseError();
            return this.emitCharacterToken("\uFFFD");
        } else if (cc === 'EOF') {
            return this.emitEndOfFile();
        } else {
            return this.emitCharacterToken(cc);
        }

    case 'ScriptData':
        if (cc === '<') {
            return this.advanceTo('ScriptDataLessThanSign');
        } else if (cc === "\u0000") {
            this.parseError();
            return this.emitCharacterToken("\uFFFD");
        } else if (cc === 'EOF') {
            return this.emitEndOfFile();
        } else {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptData');
        }

    case 'PLAINTEXT':
        if (cc === "\u0000") {
            this.parseError();
            return this.emitCharacterToken("\uFFFD");
        } else if (cc === 'EOF') {
            return this.emitEndOfFile();
        } else {
            this.bufferCharacter(cc);
        }
        return this.advanceTo('PLAINTEXT');

    case 'TagOpen':
        if (cc === '!') {
            return this.advanceTo('MarkupDeclarationOpen');
        } else if (cc === '/') {
            return this.advanceTo('EndTagOpen');
        } else if (isASCIIUpper(cc)) {
            this.token.beginStartTag(cc.toLowerCase());
            return this.advanceTo('TagName');
        } else if (isASCIILower(cc)) {
            this.token.beginStartTag(cc);
            return this.advanceTo('TagName');
        } else if (cc === '?') {
            this.parseError();
            return this.reconsumeIn('BogusComment');
        } else {
            this.parseError();
            this.bufferCharacter('<');
            return this.reconsumeIn('Data');
        }

    case 'EndTagOpen':
        if (isASCIIUpper(cc)) {
            this.token.beginEndTag(cc.toLowerCase());
            return this.advanceTo('TagName');
        } else if (isASCIILower(cc)) {
            this.token.beginEndTag(cc);
            return this.advanceTo('TagName');
        } else if (cc === '>') {
            this.parseError();
            return this.advanceTo('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            return this.reconsumeIn('Data');
        } else {
            this.parseError();
            return this.reconsumeIn('BogusComment');
        }

    case 'TagName':
        if (this.isWhiteSpace(cc)) {
            return this.advanceTo('BeforeAttributeName');
        } else if (cc === '/') {
            return this.advanceTo('SelfClosingStartTag');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (this.usePreHTML5ParserQuirks && cc === '<') {
            return this.emitAndReconsumeIn('Data');
        } else if (isASCIIUpper(cc)) {
            this.token.appendToName(cc.toLowerCase());
            return this.advanceTo('TagName');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.reconsumeIn('Data');
        } else {
            this.token.appendToName(cc);
            return this.advanceTo('TagName');
        }

    case 'RCDATALessThanSign':
        if (cc === '/') {
            this.temporaryBuffer = '';
            assert.ok('' === this.bufferedEndTagName);
            return this.advanceTo('RCDATAEndTagOpen');
        } else {
            this.bufferCharacter('<');
            return this.reconsumeIn('RCDATA');
        }

    case 'RCDATAEndTagOpen':
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc.toLowerCase());
            return this.advanceTo('RCDATAEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc);
            return this.advanceTo('RCDATAEndTagName');
        } else {
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            return this.reconsumeIn('RCDATA');
        }

    case 'RCDATAEndTagName':
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc.toLowerCase());
            return this.advanceTo('RCDATAEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc);
            return this.advanceTo('RCDATAEndTagName');
        } else {
            if (this.isWhiteSpace(cc)) {
                if (this.isAppropriateEndTag()) {
                    this.flushAndAdvanceTo('BeforeAttributeName');
                }
            } else if (cc === '/') {
                if (this.isAppropriateEndTag()) {
                    this.flushAndAdvanceTo('SelfClosingStartTag');
                }
            } else if (cc === '>') {
                if (this.isAppropriateEndTag()) {
                    return this.flushEmitAndResumeIn('Data');
                }
            }
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            this.token.appendToCharacter(this.temporaryBuffer);
            this.bufferedEndTagName.clear();
            return this.reconsumeIn('RCDATA');
        }

    case 'RAWTEXTLessThanSign':
        if (cc === '/') {
            this.temporaryBuffer = '';
            assert.ok('' === this.bufferedEndTagName);
            return this.advanceTo('RAWTEXTEndTagOpen');
        } else {
            this.bufferCharacter('<');
            return this.reconsumeIn('RAWTEXT');
        }

    case 'RAWTEXTEndTagOpen':
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc.toLowerCase());
            return this.advanceTo('RAWTEXTEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc);
            return this.advanceTo('RAWTEXTEndTagName');
        } else {
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            return this.reconsumeIn('RAWTEXT');
        }

    case 'RAWTEXTEndTagName':
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc.toLowerCase());
            return this.advanceTo('RAWTEXTEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc);
            return this.advanceTo('RAWTEXTEndTagName');
        } else {
            if (this.isWhiteSpace(cc)) {
                if (this.isAppropriateEndTag()) {
                    this.flushAndAdvanceTo('BeforeAttributeName');
                }
            } else if (cc === '/') {
                if (this.isAppropriateEndTag()) {
                    this.flushAndAdvanceTo('SelfClosingStartTag');
                }
            } else if (cc === '>') {
                if (this.isAppropriateEndTag()) {
                    return this.flushEmitAndResumeIn('Data');
                }
            }
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            this.token.appendToCharacter(this.temporaryBuffer);
            this.bufferedEndTagName.clear();
            return this.reconsumeIn('RAWTEXT');
        }

    case 'ScriptDataLessThanSign':
        if (cc === '/') {
            this.temporaryBuffer = '';
            assert.ok('' === this.bufferedEndTagName);
            return this.advanceTo('ScriptDataEndTagOpen');
        } else if (cc === '!') {
            this.bufferCharacter('<');
            this.bufferCharacter('!');
            return this.advanceTo('ScriptDataEscapeStart');
        } else {
            this.bufferCharacter('<');
            return this.reconsumeIn('ScriptData');
        }

    case 'ScriptDataEndTagOpen':
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc.toLowerCase());
            return this.advanceTo('ScriptDataEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc);
            return this.advanceTo('ScriptDataEndTagName');
        } else {
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            return this.reconsumeIn('ScriptData');
        }

    case 'ScriptDataEndTagName':
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc.toLowerCase());
            return this.advanceTo('ScriptDataEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc);
            return this.advanceTo('ScriptDataEndTagName');
        } else {
            if (this.isWhiteSpace(cc)) {
                if (this.isAppropriateEndTag()) {
                    this.flushAndAdvanceTo('BeforeAttributeName');
                }
            } else if (cc === '/') {
                if (this.isAppropriateEndTag()) {
                    this.flushAndAdvanceTo('SelfClosingStartTag');
                }
            } else if (cc === '>') {
                if (this.isAppropriateEndTag()) {
                    return this.flushEmitAndResumeIn('Data');
                }
            }
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            this.token.appendToCharacter(this.temporaryBuffer);
            this.bufferedEndTagName.clear();
            return this.reconsumeIn('ScriptData');
        }

    case 'ScriptDataEscapeStart':
        if (cc === '-') {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptDataEscapeStartDash');
        } else {
            return this.reconsumeIn('ScriptData');
        }

    case 'ScriptDataEscapeStartDash':
        if (cc === '-') {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptDataEscapedDashDash');
        } else {
            return this.reconsumeIn('ScriptData');
        }

    case 'ScriptDataEscaped':
        if (cc === '-') {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptDataEscapedDash');
        } else if (cc === '<') {
            return this.advanceTo('ScriptDataEscapedLessThanSign');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.reconsumeIn('Data');
        } else {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptDataEscaped');
        }

    case 'ScriptDataEscapedDash':
        if (cc === '-') {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptDataEscapedDashDash');
        } else if (cc === '<') {
            return this.advanceTo('ScriptDataEscapedLessThanSign');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.reconsumeIn('Data');
        } else {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptDataEscaped');
        }

    case 'ScriptDataEscapedDashDash':
        if (cc === '-') {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptDataEscapedDashDash');
        } else if (cc === '<') {
            return this.advanceTo('ScriptDataEscapedLessThanSign');
        } else if (cc === '>') {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptData');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.reconsumeIn('Data');
        } else {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptDataEscaped');
        }

    case 'ScriptDataEscapedLessThanSign':
        if (cc === '/') {
            this.temporaryBuffer = '';
            assert.ok('' === this.bufferedEndTagName);
            return this.advanceTo('ScriptDataEscapedEndTagOpen');
        } else if (isASCIIUpper(cc)) {
            this.bufferCharacter('<');
            this.bufferCharacter(cc);
            this.temporaryBuffer = '';
            this.temporaryBuffer += cc.toLowerCase();
            return this.advanceTo('ScriptDataDoubleEscapeStart');
        } else if (isASCIILower(cc)) {
            this.bufferCharacter('<');
            this.bufferCharacter(cc);
            this.temporaryBuffer = '';
            this.temporaryBuffer += cc;
            return this.advanceTo('ScriptDataDoubleEscapeStart');
        } else {
            this.bufferCharacter('<');
            return this.reconsumeIn('ScriptDataEscaped');
        }

    case 'ScriptDataEscapedEndTagOpen':
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc.toLowerCase());
            return this.advanceTo('ScriptDataEscapedEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc);
            return this.advanceTo('ScriptDataEscapedEndTagName');
        } else {
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            return this.reconsumeIn('ScriptDataEscaped');
        }

    case 'ScriptDataEscapedEndTagName':
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc.toLowerCase());
            return this.advanceTo('ScriptDataEscapedEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc);
            return this.advanceTo('ScriptDataEscapedEndTagName');
        } else {
            if (this.isWhiteSpace(cc)) {
                if (this.isAppropriateEndTag()) {
                    this.flushAndAdvanceTo('BeforeAttributeName');
                }
            } else if (cc === '/') {
                if (this.isAppropriateEndTag()) {
                    this.flushAndAdvanceTo('SelfClosingStartTag');
                }
            } else if (cc === '>') {
                if (this.isAppropriateEndTag()) {
                    return this.flushEmitAndResumeIn('Data');
                }
            }
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            this.token.appendToCharacter(this.temporaryBuffer);
            this.bufferedEndTagName.clear();
            return this.reconsumeIn('ScriptDataEscaped');
        }

    case 'ScriptDataDoubleEscapeStart':
        if (this.isWhiteSpace(cc) || cc === '/' || cc === '>') {
            this.bufferCharacter(cc);
            if (this.temporaryBufferIs('script')) {
                return this.advanceTo('ScriptDataDoubleEscaped');
            } else {
                return this.advanceTo('ScriptDataEscaped');
            }
        } else if (isASCIIUpper(cc)) {
            this.bufferCharacter(cc);
            this.temporaryBuffer += cc.toLowerCase();
            return this.advanceTo('ScriptDataDoubleEscapeStart');
        } else if (isASCIILower(cc)) {
            this.bufferCharacter(cc);
            this.temporaryBuffer += cc;
            return this.advanceTo('ScriptDataDoubleEscapeStart');
        } else {
            return this.reconsumeIn('ScriptDataEscaped');
        }

    case 'ScriptDataDoubleEscaped':
        if (cc === '-') {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptDataDoubleEscapedDash');
        } else if (cc === '<') {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptDataDoubleEscapedLessThanSign');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.reconsumeIn('Data');
        } else {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptDataDoubleEscaped');
        }

    case 'ScriptDataDoubleEscapedDash':
        if (cc === '-') {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptDataDoubleEscapedDashDash');
        } else if (cc === '<') {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptDataDoubleEscapedLessThanSign');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.reconsumeIn('Data');
        } else {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptDataDoubleEscaped');
        }

    case 'ScriptDataDoubleEscapedDashDash':
        if (cc === '-') {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptDataDoubleEscapedDashDash');
        } else if (cc === '<') {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptDataDoubleEscapedLessThanSign');
        } else if (cc === '>') {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptData');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.reconsumeIn('Data');
        } else {
            this.bufferCharacter(cc);
            return this.advanceTo('ScriptDataDoubleEscaped');
        }

    case 'ScriptDataDoubleEscapedLessThanSign':
        if (cc === '/') {
            this.bufferCharacter(cc);
            this.temporaryBuffer = '';
            return this.advanceTo('ScriptDataDoubleEscapeEnd');
        } else {
            return this.reconsumeIn('ScriptDataDoubleEscaped');
        }

    case 'ScriptDataDoubleEscapeEnd':
        if (this.isWhiteSpace(cc) || cc === '/' || cc === '>') {
            this.bufferCharacter(cc);
            if (this.temporaryBufferIs('script')) {
                return this.advanceTo('ScriptDataEscaped');
            } else {
                return this.advanceTo('ScriptDataDoubleEscaped');
            }
        } else if (isASCIIUpper(cc)) {
            this.bufferCharacter(cc);
            this.temporaryBuffer += cc.toLowerCase();
            return this.advanceTo('ScriptDataDoubleEscapeEnd');
        } else if (isASCIILower(cc)) {
            this.bufferCharacter(cc);
            this.temporaryBuffer += cc;
            return this.advanceTo('ScriptDataDoubleEscapeEnd');
        } else {
            return this.reconsumeIn('ScriptDataDoubleEscaped');
        }

    case 'BeforeAttributeName':
        if (this.isWhiteSpace(cc)) {
            return this.advanceTo('BeforeAttributeName');
        } else if (cc === '/') {
            return this.advanceTo('SelfClosingStartTag');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (this.usePreHTML5ParserQuirks && cc === '<') {
            return this.emitAndReconsumeIn('Data');
        } else if (isASCIIUpper(cc)) {
            this.token.addNewAttribute();

            this.token.appendToAttributeName(cc.toLowerCase());
            return this.advanceTo('AttributeName');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.reconsumeIn('Data');
        } else {
            if (cc === '"' || cc === '\'' || cc === '<' || cc === '=') {
                this.parseError();
            }
            this.token.addNewAttribute();

            this.token.appendToAttributeName(cc);
            return this.advanceTo('AttributeName');
        }

    case 'AttributeName':
        if (this.isWhiteSpace(cc)) {

            return this.advanceTo('AfterAttributeName');
        } else if (cc === '/') {

            return this.advanceTo('SelfClosingStartTag');
        } else if (cc === '=') {

            return this.advanceTo('BeforeAttributeValue');
        } else if (cc === '>') {

            return this.emitAndResumeIn('Data');
        } else if (this.usePreHTML5ParserQuirks && cc === '<') {

            return this.emitAndReconsumeIn('Data');
        } else if (isASCIIUpper(cc)) {
            this.token.appendToAttributeName(cc.toLowerCase());
            return this.advanceTo('AttributeName');
        } else if (cc === 'EOF') {
            this.parseError();

            return this.reconsumeIn('Data');
        } else {
            if (cc === '"' || cc === '\'' || cc === '<' || cc === '=') {
                this.parseError();
            }
            this.token.appendToAttributeName(cc);
            return this.advanceTo('AttributeName');
        }

    case 'AfterAttributeName':
        if (this.isWhiteSpace(cc)) {
            return this.advanceTo('AfterAttributeName');
        } else if (cc === '/') {
            return this.advanceTo('SelfClosingStartTag');
        } else if (cc === '=') {
            return this.advanceTo('BeforeAttributeValue');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (this.usePreHTML5ParserQuirks && cc === '<') {
            return this.emitAndReconsumeIn('Data');
        } else if (isASCIIUpper(cc)) {
            this.token.addNewAttribute();

            this.token.appendToAttributeName(cc.toLowerCase());
            return this.advanceTo('AttributeName');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.reconsumeIn('Data');
        } else {
            if (cc === '"' || cc === '\'' || cc === '<') {
                this.parseError();
            }
            this.token.addNewAttribute();

            this.token.appendToAttributeName(cc);
            return this.advanceTo('AttributeName');
        }

    case 'BeforeAttributeValue':
        if (this.isWhiteSpace(cc)) {
            return this.advanceTo('BeforeAttributeValue');
        } else if (cc === '"') {

            return this.advanceTo('AttributeValueDoubleQuoted');
        } else if (cc === '&') {

            return this.reconsumeIn('AttributeValueUnquoted');
        } else if (cc === '\'') {

            return this.advanceTo('AttributeValueSingleQuoted');
        } else if (cc === '>') {
            this.parseError();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.reconsumeIn('Data');
        } else {
            if (cc === '<' || cc === '=' || cc === '`') {
                this.parseError();
            }

            this.token.appendToAttributeValue(cc);
            return this.advanceTo('AttributeValueUnquoted');
        }

    case 'AttributeValueDoubleQuoted':
        if (cc === '"') {

            return this.advanceTo('AfterAttributeValueQuoted');
        } else if (cc === '&') {
            this.additionalAllowedCharacter = '"';
            return this.advanceTo('CharacterReferenceInAttributeValue');
        } else if (cc === 'EOF') {
            this.parseError();

            return this.reconsumeIn('Data');
        } else {
            this.token.appendToAttributeValue(cc);
            return this.advanceTo('AttributeValueDoubleQuoted');
        }

    case 'AttributeValueSingleQuoted':
        if (cc === '\'') {

            return this.advanceTo('AfterAttributeValueQuoted');
        } else if (cc === '&') {
            this.additionalAllowedCharacter = '\'';
            return this.advanceTo('CharacterReferenceInAttributeValue');
        } else if (cc === 'EOF') {
            this.parseError();

            return this.reconsumeIn('Data');
        } else {
            this.token.appendToAttributeValue(cc);
            return this.advanceTo('AttributeValueSingleQuoted');
        }

    case 'AttributeValueUnquoted':
        if (this.isWhiteSpace(cc)) {

            return this.advanceTo('BeforeAttributeName');
        } else if (cc === '&') {
            this.additionalAllowedCharacter = '>';
            return this.advanceTo('CharacterReferenceInAttributeValue');
        } else if (cc === '>') {

            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();

            return this.reconsumeIn('Data');
        } else {
            if (cc === '"' || cc === '\'' || cc === '<' || cc === '=' || cc === '`') {
                this.parseError();
            }
            this.token.appendToAttributeValue(cc);
            return this.advanceTo('AttributeValueUnquoted');
        }

    case 'CharacterReferenceInAttributeValue':
        notEnoughCharacters = false;
        success = this.consumeHTMLEntity(decodedEntity, notEnoughCharacters, this.additionalAllowedCharacter);
        if (notEnoughCharacters) {
            return this.haveBufferedCharacterToken();
        }

        if (!success) {
            assert.ok('' === decodedEntity);
            this.token.appendToAttributeValue('&');
        } else {
            for (i = 0; i < decodedEntity.length(); i += 1) {
                this.token.appendToAttributeValue(decodedEntity[i]);
            }
        }
        // We're supposed to switch back to the attribute value state that
        // we were in when we were switched into this state. Rather than
        // keeping track of this explictly, we observe that the previous
        // state can be determined by this.additionalAllowedCharacter.
        if (this.additionalAllowedCharacter === '"') {
            return this.switchTo('AttributeValueDoubleQuoted');
        } else if (this.additionalAllowedCharacter === '\'') {
            return this.switchTo('AttributeValueSingleQuoted');
        } else if (this.additionalAllowedCharacter === '>') {
            return this.switchTo('AttributeValueUnquoted');
        } else {
            assert.ok(false);
        }
        return false;

    case 'AfterAttributeValueQuoted':
        if (this.isWhiteSpace(cc)) {
            return this.advanceTo('BeforeAttributeName');
        } else if (cc === '/') {
            return this.advanceTo('SelfClosingStartTag');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (this.usePreHTML5ParserQuirks && cc === '<') {
            return this.emitAndReconsumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.reconsumeIn('Data');
        } else {
            this.parseError();
            return this.reconsumeIn('BeforeAttributeName');
        }

    case 'SelfClosingStartTag':
        if (cc === '>') {
            this.token.setSelfClosing();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.reconsumeIn('Data');
        } else {
            this.parseError();
            return this.reconsumeIn('BeforeAttributeName');
        }

    case 'BogusComment':
        this.token.beginComment();
        return this.reconsumeIn('ContinueBogusComment');

    case 'ContinueBogusComment':
        if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToComment(cc);
            return this.advanceTo('ContinueBogusComment');
        }

    case 'MarkupDeclarationOpen':
        if (cc === '-') {
            result = this.lookAhead('--');
            if (result === 'DidMatch') {
                this.advanceStringAndASSERT('-');
                this.advanceStringAndASSERT('-');
                this.token.beginComment();
                return this.switchTo('CommentStart');
            } else if (result === 'NotEnoughCharacters') {
                return this.haveBufferedCharacterToken();
            }
        } else if (cc === 'D' || cc === 'd') {
            result = this.lookAheadIgnoringCase("doctype");
            if (result === 'DidMatch') {
                this.advanceStringAndASSERTIgnoringCase("doctype");
                return this.switchTo('DOCTYPE');
            } else if (result === 'NotEnoughCharacters') {
                return this.haveBufferedCharacterToken();
            }
        } else if (cc === '[' && this.shouldAllowCDATA) {
            result = this.lookAhead("[CDATA[");
            if (result === 'DidMatch') {
                this.advanceStringAndASSERT("[CDATA[");
                return this.switchTo('CDATASection');
            } else if (result === 'NotEnoughCharacters') {
                return this.haveBufferedCharacterToken();
            }
        }
        this.parseError();
        return this.reconsumeIn('BogusComment');

    case 'CommentStart':
        if (cc === '-') {
            return this.advanceTo('CommentStartDash');
        } else if (cc === '>') {
            this.parseError();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToComment(cc);
            return this.advanceTo('Comment');
        }

    case 'CommentStartDash':
        if (cc === '-') {
            return this.advanceTo('CommentEnd');
        } else if (cc === '>') {
            this.parseError();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToComment('-');
            this.token.appendToComment(cc);
            return this.advanceTo('Comment');
        }

    case 'Comment':
        if (cc === '-') {
            return this.advanceTo('CommentEndDash');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToComment(cc);
            return this.advanceTo('Comment');
        }

    case 'CommentEndDash':
        if (cc === '-') {
            return this.advanceTo('CommentEnd');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToComment('-');
            this.token.appendToComment(cc);
            return this.advanceTo('Comment');
        }

    case 'CommentEnd':
        if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (cc === '!') {
            this.parseError();
            return this.advanceTo('CommentEndBang');
        } else if (cc === '-') {
            this.parseError();
            this.token.appendToComment('-');
            return this.advanceTo('CommentEnd');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.token.appendToComment('-');
            this.token.appendToComment('-');
            this.token.appendToComment(cc);
            return this.advanceTo('Comment');
        }

    case 'CommentEndBang':
        if (cc === '-') {
            this.token.appendToComment('-');
            this.token.appendToComment('-');
            this.token.appendToComment('!');
            return this.advanceTo('CommentEndDash');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToComment('-');
            this.token.appendToComment('-');
            this.token.appendToComment('!');
            this.token.appendToComment(cc);
            return this.advanceTo('Comment');
        }

    case 'DOCTYPE':
        if (this.isWhiteSpace(cc)) {
            return this.advanceTo('BeforeDOCTYPEName');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.beginDOCTYPE();
            this.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            return this.reconsumeIn('BeforeDOCTYPEName');
        }

    case 'BeforeDOCTYPEName':
        if (this.isWhiteSpace(cc)) {
            return this.advanceTo('BeforeDOCTYPEName');
        } else if (isASCIIUpper(cc)) {
            this.token.beginDOCTYPE(cc.toLowerCase());
            return this.advanceTo('DOCTYPEName');
        } else if (cc === '>') {
            this.parseError();
            this.token.beginDOCTYPE();
            this.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.beginDOCTYPE();
            this.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.beginDOCTYPE(cc);
            return this.advanceTo('DOCTYPEName');
        }

    case 'DOCTYPEName':
        if (this.isWhiteSpace(cc)) {
            return this.advanceTo('AfterDOCTYPEName');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (isASCIIUpper(cc)) {
            this.token.appendToName(cc.toLowerCase());
            return this.advanceTo('DOCTYPEName');
        } else if (cc === 'EOF') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToName(cc);
            return this.advanceTo('DOCTYPEName');
        }

    case 'AfterDOCTYPEName':
        if (this.isWhiteSpace(cc)) {
            return this.advanceTo('AfterDOCTYPEName');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            if (cc === 'P' || cc === 'p') {
                result = this.lookAheadIgnoringCase("public");
                if (result === 'DidMatch') {
                    this.advanceStringAndASSERTIgnoringCase("public");
                    return this.switchTo('AfterDOCTYPEPublicKeyword');
                } else if (result === 'NotEnoughCharacters') {
                    return this.haveBufferedCharacterToken();
                }
            } else if (cc === 'S' || cc === 's') {
                result = this.lookAheadInoringCase("system");
                if (result === 'DidMatch') {
                    this.advanceStringAndASSERTIgnoringCase("system");
                    return this.switchTo('AfterDOCTYPESystemKeyword');
                } else if (result === 'NotEnoughCharacters') {
                    return this.haveBufferedCharacterToken();
                }
            }
            this.parseError();
            this.setForceQuirks();
            return this.advanceTo('BogusDOCTYPE');
        }

    case 'AfterDOCTYPEPublicKeyword':
        if (this.isWhiteSpace(cc)) {
            return this.advanceTo('BeforeDOCTYPEPublicIdentifier');
        } else if (cc === '"') {
            this.parseError();
            this.token.setPublicIdentifierToEmptyString();
            return this.advanceTo('DOCTYPEPublicIdentifierDoubleQuoted');
        } else if (cc === '\'') {
            this.parseError();
            this.token.setPublicIdentifierToEmptyString();
            return this.advanceTo('DOCTYPEPublicIdentifierSingleQuoted');
        } else if (cc === '>') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.setForceQuirks();
            return this.advanceTo('BogusDOCTYPE');
        }

    case 'BeforeDOCTYPEPublicIdentifier':
        if (this.isWhiteSpace(cc)) {
            return this.advanceTo('BeforeDOCTYPEPublicIdentifier');
        } else if (cc === '"') {
            this.token.setPublicIdentifierToEmptyString();
            return this.advanceTo('DOCTYPEPublicIdentifierDoubleQuoted');
        } else if (cc === '\'') {
            this.token.setPublicIdentifierToEmptyString();
            return this.advanceTo('DOCTYPEPublicIdentifierSingleQuoted');
        } else if (cc === '>') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.setForceQuirks();
            return this.advanceTo('BogusDOCTYPE');
        }

    case 'DOCTYPEPublicIdentifierDoubleQuoted':
        if (cc === '"') {
            return this.advanceTo('AfterDOCTYPEPublicIdentifier');
        } else if (cc === '>') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToPublicIdentifier(cc);
            return this.advanceTo('DOCTYPEPublicIdentifierDoubleQuoted');
        }

    case 'DOCTYPEPublicIdentifierSingleQuoted':
        if (cc === '\'') {
            return this.advanceTo('AfterDOCTYPEPublicIdentifier');
        } else if (cc === '>') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToPublicIdentifier(cc);
            return this.advanceTo('DOCTYPEPublicIdentifierSingleQuoted');
        }

    case 'AfterDOCTYPEPublicIdentifier':
        if (this.isWhiteSpace(cc)) {
            return this.advanceTo('BetweenDOCTYPEPublicAndSystemIdentifiers');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (cc === '"') {
            this.parseError();
            this.token.setSystemIdentifierToEmptyString();
            return this.advanceTo('DOCTYPESystemIdentifierDoubleQuoted');
        } else if (cc === '\'') {
            this.parseError();
            this.token.setSystemIdentifierToEmptyString();
            return this.advanceTo('DOCTYPESystemIdentifierSingleQuoted');
        } else if (cc === 'EOF') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.setForceQuirks();
            return this.advanceTo('BogusDOCTYPE');
        }

    case 'BetweenDOCTYPEPublicAndSystemIdentifiers':
        if (this.isWhiteSpace(cc)) {
            return this.advanceTo('BetweenDOCTYPEPublicAndSystemIdentifiers');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (cc === '"') {
            this.token.setSystemIdentifierToEmptyString();
            return this.advanceTo('DOCTYPESystemIdentifierDoubleQuoted');
        } else if (cc === '\'') {
            this.token.setSystemIdentifierToEmptyString();
            return this.advanceTo('DOCTYPESystemIdentifierSingleQuoted');
        } else if (cc === 'EOF') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.setForceQuirks();
            return this.advanceTo('BogusDOCTYPE');
        }

    case 'AfterDOCTYPESystemKeyword':
        if (this.isWhiteSpace(cc)) {
            return this.advanceTo('BeforeDOCTYPESystemIdentifier');
        } else if (cc === '"') {
            this.parseError();
            this.token.setSystemIdentifierToEmptyString();
            return this.advanceTo('DOCTYPESystemIdentifierDoubleQuoted');
        } else if (cc === '\'') {
            this.parseError();
            this.token.setSystemIdentifierToEmptyString();
            return this.advanceTo('DOCTYPESystemIdentifierSingleQuoted');
        } else if (cc === '>') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.setForceQuirks();
            return this.advanceTo('BogusDOCTYPE');
        }

    case 'BeforeDOCTYPESystemIdentifier':
        if (this.isTokenizerWhitespace(cc)) {
            return this.advanceTo('BeforeDOCTYPESystemIdentifier');
        } else if (cc === '"') {
            this.token.setSystemIdentifierToEmptyString();
            return this.advanceTo('DOCTYPESystemIdentifierDoubleQuoted');
        } else if (cc === '\'') {
            this.token.setSystemIdentifierToEmptyString();
            return this.advanceTo('DOCTYPESystemIdentifierSingleQuoted');
        } else if (cc === '>') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.setForceQuirks();
            return this.advanceTo('BogusDOCTYPE');
        }

    case 'DOCTYPESystemIdentifierDoubleQuoted':
        if (cc === '"') {
            return this.advanceTo('AfterDOCTYPESystemIdentifier');
        } else if (cc === '>') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToSystemIdentifier(cc);
            return this.advanceTo('DOCTYPESystemIdentifierDoubleQuoted');
        }

    case 'DOCTYPESystemIdentifierSingleQuoted':
        if (cc === '\'') {
            return this.advanceTo('AfterDOCTYPESystemIdentifier');
        } else if (cc === '>') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToSystemIdentifier(cc);
            return this.advanceTo('DOCTYPESystemIdentifierSingleQuoted');
        }

    case 'AfterDOCTYPESystemIdentifier':
        if (this.isWhiteSpace(cc)) {
            return this.advanceTo('AfterDOCTYPESystemIdentifier');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            return this.advanceTo('BogusDOCTYPE');
        }

    case 'BogusDOCTYPE':
        if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            return this.emitAndReconsumeIn('Data');
        } else {
            return this.advanceTo('BogusDOCTYPE');
        }

    case 'CDATASection':
        if (cc === ']') {
            return this.advanceTo('CDATASectionRightSquareBracket');
        } else if (cc === 'EOF') {
            return this.reconsumeIn('Data');
        } else {
            this.bufferCharacter(cc);
            return this.advanceTo('CDATASection');
        }

    case 'CDATASectionRightSquareBracket':
        if (cc === ']') {
            return this.advanceTo('CDATASectionDoubleRightSquareBracket');
        } else {
            this.bufferCharacter(']');
            return this.reconsumeIn('CDATASection');
        }

    case 'CDATASectionDoubleRightSquareBracket':
        if (cc === '>') {
            return this.advanceTo('Data');
        } else {
            this.bufferCharacter(']');
            this.bufferCharacter(']');
            return this.reconsumeIn('CDATASection');
        }

    default:
        return false;
    }
};

exports.HTMLTokenizer = HTMLTokenizer;