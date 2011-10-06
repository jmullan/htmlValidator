/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 * Copyright (C) 2009 Torch Mobile, Inc. http://www.torchmobile.com/
 * Copyright (C) 2010 Google, Inc. All Rights Reserved.
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

var AtomicMarkupTokenBase_HTMLToken = {},
    MarkupTokenizerBase_HTMLToken_HTMLTokenizerState = {},
    HTMLTokenizer = function () {
        this.shouldAllowCDATA = false;
        this.source = '';
        this.sourcePointer = -1;
        this.state = 'Data';
        this.token = {};
        this.tokens = [];
        this.lineNumber = 0;
        this.skipLeadingNewLineForListing = false;
        this.forceNullCharacterReplacement = false;
        this.additionalAllowedCharacter = '';
        this.bufferedEndTagName = '';
        this.usePreHTML5ParserQuirks = null;
        this.temporaryBuffer = '';
        this.appropriateEndTagName = null;
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
        assert.ok(false, 'Not implmented');
    },
    notReached = function () {
        assert.ok(false, 'Should not have gotten to this line in the file.');
    },
    InputStreamPreprocessor = {},
    SegmentedString = {}
;

HTMLTokenizer.prototype.haveBufferedCharacterToken = function () {

};


HTMLTokenizer.prototype.advanceTo = function (state) {
    /* I think that this is supposed to buffer a character and switch the state*/
    this.state = state;
};
HTMLTokenizer.prototype.reconsumeIn = function (state) {
    /* consume buffer in the given state, but do not change the current state */
};
HTMLTokenizer.prototype.switchTo = function (state) {
    /* I think that this changes the state but does not update the current buffer */
    this.state = state;
};

HTMLTokenizer.prototype.emitAndResumeIn = function (state) {
    /* Flush the buffer as a token, change state */
    this.state = state;
};
HTMLTokenizer.prototype.flushEmitAndReconsumeIn = function () {};

HTMLTokenizer.prototype.consumeHTMLEntity = function () {
};
HTMLTokenizer.prototype.advanceStringAndASSERT = function () {
};
HTMLTokenizer.prototype.advanceStringAndASSERTIgnoringCase = function () {
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

HTMLTokenizer.prototype.flushEmitAndResumeIn = function (/* 'State */ state) {
    this.state = state;
    this.flushBufferedEndTag();
    return true;
};

HTMLTokenizer.prototype.updateStateFor = function (/* const AtomicString& */ tagName, /* Frame* */ frame) {
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
            || (tagName === 'noembed' /* && HTMLTreeBuilder.pluginsEnabled(frame) */)
            || tagName === 'noframes'
            || (tagName === 'noscript' /* && HTMLTreeBuilder.scriptEnabled(frame) */)
    ) {
        this.setState('RAWTEXT');
    }
};

HTMLTokenizer.prototype.temporaryBufferIs = function (/* const String& */ expectedString) {
    return this.temporaryBuffer === expectedString;
};

HTMLTokenizer.prototype.addToPossibleEndTag = function (/* UChar */ cc) {
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
    this.tokens.append('EOF');
};

HTMLTokenizer.prototype.emitCharacterToken = function (cc) {
    this.tokens.append(cc);
};

HTMLTokenizer.prototype.attemptConsumeCharacterReference = function (additionalAllowedCharacter) {
    /* TODO try to consume a character */
    if (this.consumeCharacterReference(additionalAllowedCharacter)) {
        /* emit the token as a reference */
    } else {
        this.emitCharacterToken(this.currentInputCharacter());
    }
    return true;
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
                    chunk = chunk + c + '';
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
                    chunk = chunk + c + '';
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

    if (!this.bufferedEndTagName.isEmpty() && !HTMLTokenizerState.isEndTagBufferingState(this.state)) {
        // FIXME: This should call this.flushBufferedEndTag().
        // We started an end tag during our last iteration.
        this.token.beginEndTag(this.bufferedEndTagName);
        this.bufferedEndTagName.clear();
        if (this.state === 'Data') {
            // We're back in the data state, so we must be done with the tag.
            return true;
        }
    }

    if (this.source.isEmpty() || !this.peek(this.lineNumber)) {
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
                this.advanceTo('Data');
            }
            if (this.state === 'RCDATA') {
                this.advanceTo('RCDATA');
            }
            // When parsing text/plain documents, we run the tokenizer in the
            // PLAINTEXTState and ignore this.skipLeadingNewLineForListing.
            assert.ok(this.state === 'PLAINTEXT');
        }
    }

    // Source: http://www.whatwg.org/specs/web-apps/current-work/#tokenization
    switch (this.state) {
    case ('Data') :
        if (cc === '&') {
            this.advanceTo('CharacterReferenceInData');
        } else if (cc === "\u0000") {
            this.parseError();
            this.emitCharacterToken(cc);
        } else if (cc === '<') {
            if (this.token.type() === HTMLTokenTypes.Character) {
                // We have a bunch of character tokens queued up that we
                // are emitting lazily here.
                return true;
            }
            this.advanceTo('TagOpen');
        } else if (cc === 'EOF') {
            return this.emitEndOfFile();
        } else {
            this.bufferCharacter(cc);
            this.advanceTo('Data');
        }
        break;

    case ('CharacterReferenceInData') :
        this.attemptConsumeCharacterReference();
        this.switchTo('Data');
        break;

    case ('RCDATA') :
        if (cc === '&') {
            this.advanceTo('CharacterReferenceInRCDATA');
        } else if (cc === '<') {
            this.advanceTo('RCDATALessThanSign');
        } else if (cc === 'EOF') {
            return this.emitEndOfFile();
        } else {
            this.bufferCharacter(cc);
            this.advanceTo('RCDATA');
        }
        break;

    case ('CharacterReferenceInRCDATA') :
        this.attemptConsumeCharacterReference();
        this.switchTo('RCDATA');
        break;

    case ('RAWTEXT') :
        if (cc === '<') {
            this.advanceTo('RAWTEXTLessThanSign');
        } else if (cc === 'EOF') {
            return this.emitEndOfFile();
        } else {
            this.bufferCharacter(cc);
            this.advanceTo('RAWTEXT');
        }
        break;

    case ('ScriptData') :
        if (cc === '<') {
            this.advanceTo('ScriptDataLessThanSign');
        } else if (cc === 'EOF') {
            return this.emitEndOfFile();
        } else {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptData');
        }
        break;

    case ('PLAINTEXT') :
        if (cc === 'EOF') {
            return this.emitEndOfFile();
        } else {
            this.bufferCharacter(cc);
        }
        this.advanceTo('PLAINTEXT');
        break;

    case ('TagOpen') :
        if (cc === '!') {
            this.advanceTo('MarkupDeclarationOpen');
        } else if (cc === '/') {
            this.advanceTo('EndTagOpen');
        } else if (isASCIIUpper(cc)) {
            this.token.beginStartTag(cc.toLowerCase());
            this.advanceTo('TagName');
        } else if (isASCIILower(cc)) {
            this.token.beginStartTag(cc);
            this.advanceTo('TagName');
        } else if (cc === '?') {
            this.parseError();
            // The spec consumes the current character before switching
            // to the bogus comment state, but it's easier to implement
            // if we reconsume the current character.
            this.reconsumeIn('BogusComment');
        } else {
            this.parseError();
            this.bufferCharacter('<');
            this.reconsumeIn('Data');
        }
        break;

    case ('EndTagOpen') :
        if (isASCIIUpper(cc)) {
            this.token.beginEndTag(cc.toLowerCase());
            this.advanceTo('TagName');
        } else if (isASCIILower(cc)) {
            this.token.beginEndTag(cc);
            this.advanceTo('TagName');
        } else if (cc === '>') {
            this.parseError();
            this.advanceTo('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            this.reconsumeIn('Data');
        } else {
            this.parseError();
            this.reconsumeIn('BogusComment');
        }
        break;

    case ('TagName') :
        if (this.isWhiteSpace(cc)) {
            this.advanceTo('BeforeAttributeName');
        } else if (cc === '/') {
            this.advanceTo('SelfClosingStartTag');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (this.usePreHTML5ParserQuirks && cc === '<') {
            return this.emitAndReconsumeIn('Data');
        } else if (isASCIIUpper(cc)) {
            this.token.appendToName(cc.toLowerCase());
            this.advanceTo('TagName');
        } else if (cc === 'EOF') {
            this.parseError();
            this.reconsumeIn('Data');
        } else {
            this.token.appendToName(cc);
            this.advanceTo('TagName');
        }
        break;

    case ('RCDATALessThanSign') :
        if (cc === '/') {
            this.temporaryBuffer = '';
            assert.ok(this.bufferedEndTagName.isEmpty());
            this.advanceTo('RCDATAEndTagOpen');
        } else {
            this.bufferCharacter('<');
            this.reconsumeIn('RCDATA');
        }
        break;

    case ('RCDATAEndTagOpen') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc.toLowerCase());
            this.advanceTo('RCDATAEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc);
            this.advanceTo('RCDATAEndTagName');
        } else {
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            this.reconsumeIn('RCDATA');
        }
        break;

    case ('RCDATAEndTagName') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc.toLowerCase());
            this.advanceTo('RCDATAEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc);
            this.advanceTo('RCDATAEndTagName');
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
            this.reconsumeIn('RCDATA');
        }
        break;

    case ('RAWTEXTLessThanSign') :
        if (cc === '/') {
            this.temporaryBuffer = '';
            assert.ok(this.bufferedEndTagName.isEmpty());
            this.advanceTo('RAWTEXTEndTagOpen');
        } else {
            this.bufferCharacter('<');
            this.reconsumeIn('RAWTEXT');
        }
        break;

    case ('RAWTEXTEndTagOpen') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc.toLowerCase());
            this.advanceTo('RAWTEXTEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc);
            this.advanceTo('RAWTEXTEndTagName');
        } else {
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            this.reconsumeIn('RAWTEXT');
        }
        break;

    case ('RAWTEXTEndTagName') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc.toLowerCase());
            this.advanceTo('RAWTEXTEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc);
            this.advanceTo('RAWTEXTEndTagName');
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
            this.reconsumeIn('RAWTEXT');
        }
        break;

    case ('ScriptDataLessThanSign') :
        if (cc === '/') {
            this.temporaryBuffer = '';
            assert.ok(this.bufferedEndTagName.isEmpty());
            this.advanceTo('ScriptDataEndTagOpen');
        } else if (cc === '!') {
            this.bufferCharacter('<');
            this.bufferCharacter('!');
            this.advanceTo('ScriptDataEscapeStart');
        } else {
            this.bufferCharacter('<');
            this.reconsumeIn('ScriptData');
        }
        break;

    case ('ScriptDataEndTagOpen') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc.toLowerCase());
            this.advanceTo('ScriptDataEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc);
            this.advanceTo('ScriptDataEndTagName');
        } else {
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            this.reconsumeIn('ScriptData');
        }
        break;

    case ('ScriptDataEndTagName') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc.toLowerCase());
            this.advanceTo('ScriptDataEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc);
            this.advanceTo('ScriptDataEndTagName');
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
            this.reconsumeIn('ScriptData');
        }
        break;

    case ('ScriptDataEscapeStart') :
        if (cc === '-') {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataEscapeStartDash');
        } else {
            this.reconsumeIn('ScriptData');
        }
        break;

    case ('ScriptDataEscapeStartDash') :
        if (cc === '-') {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataEscapedDashDash');
        } else {
            this.reconsumeIn('ScriptData');
        }
        break;

    case ('ScriptDataEscaped') :
        if (cc === '-') {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataEscapedDash');
        } else if (cc === '<') {
            this.advanceTo('ScriptDataEscapedLessThanSign');
        } else if (cc === 'EOF') {
            this.parseError();
            this.reconsumeIn('Data');
        } else {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataEscaped');
        }
        break;

    case ('ScriptDataEscapedDash') :
        if (cc === '-') {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataEscapedDashDash');
        } else if (cc === '<') {
            this.advanceTo('ScriptDataEscapedLessThanSign');
        } else if (cc === 'EOF') {
            this.parseError();
            this.reconsumeIn('Data');
        } else {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataEscaped');
        }
        break;

    case ('ScriptDataEscapedDashDash') :
        if (cc === '-') {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataEscapedDashDash');
        } else if (cc === '<') {
            this.advanceTo('ScriptDataEscapedLessThanSign');
        } else if (cc === '>') {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptData');
        } else if (cc === 'EOF') {
            this.parseError();
            this.reconsumeIn('Data');
        } else {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataEscaped');
        }
        break;

    case ('ScriptDataEscapedLessThanSign') :
        if (cc === '/') {
            this.temporaryBuffer = '';
            assert.ok(this.bufferedEndTagName.isEmpty());
            this.advanceTo('ScriptDataEscapedEndTagOpen');
        } else if (isASCIIUpper(cc)) {
            this.bufferCharacter('<');
            this.bufferCharacter(cc);
            this.temporaryBuffer = '';
            this.temporaryBuffer += cc.toLowerCase();
            this.advanceTo('ScriptDataDoubleEscapeStart');
        } else if (isASCIILower(cc)) {
            this.bufferCharacter('<');
            this.bufferCharacter(cc);
            this.temporaryBuffer = '';
            this.temporaryBuffer += cc;
            this.advanceTo('ScriptDataDoubleEscapeStart');
        } else {
            this.bufferCharacter('<');
            this.reconsumeIn('ScriptDataEscaped');
        }
        break;

    case ('ScriptDataEscapedEndTagOpen') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc.toLowerCase());
            this.advanceTo('ScriptDataEscapedEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc);
            this.advanceTo('ScriptDataEscapedEndTagName');
        } else {
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            this.reconsumeIn('ScriptDataEscaped');
        }
        break;

    case ('ScriptDataEscapedEndTagName') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc.toLowerCase());
            this.advanceTo('ScriptDataEscapedEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer += cc;
            this.addToPossibleEndTag(cc);
            this.advanceTo('ScriptDataEscapedEndTagName');
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
            this.reconsumeIn('ScriptDataEscaped');
        }
        break;

    case ('ScriptDataDoubleEscapeStart') :
        if (this.isWhiteSpace(cc) || cc === '/' || cc === '>') {
            this.bufferCharacter(cc);
            if (this.temporaryBufferIs('script')) {
                this.advanceTo('ScriptDataDoubleEscaped');
            } else {
                this.advanceTo('ScriptDataEscaped');
            }
        } else if (isASCIIUpper(cc)) {
            this.bufferCharacter(cc);
            this.temporaryBuffer += cc.toLowerCase();
            this.advanceTo('ScriptDataDoubleEscapeStart');
        } else if (isASCIILower(cc)) {
            this.bufferCharacter(cc);
            this.temporaryBuffer += cc;
            this.advanceTo('ScriptDataDoubleEscapeStart');
        } else {
            this.reconsumeIn('ScriptDataEscaped');
        }
        break;

    case ('ScriptDataDoubleEscaped') :
        if (cc === '-') {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataDoubleEscapedDash');
        } else if (cc === '<') {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataDoubleEscapedLessThanSign');
        } else if (cc === 'EOF') {
            this.parseError();
            this.reconsumeIn('Data');
        } else {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataDoubleEscaped');
        }
        break;

    case ('ScriptDataDoubleEscapedDash') :
        if (cc === '-') {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataDoubleEscapedDashDash');
        } else if (cc === '<') {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataDoubleEscapedLessThanSign');
        } else if (cc === 'EOF') {
            this.parseError();
            this.reconsumeIn('Data');
        } else {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataDoubleEscaped');
        }
        break;

    case ('ScriptDataDoubleEscapedDashDash') :
        if (cc === '-') {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataDoubleEscapedDashDash');
        } else if (cc === '<') {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataDoubleEscapedLessThanSign');
        } else if (cc === '>') {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptData');
        } else if (cc === 'EOF') {
            this.parseError();
            this.reconsumeIn('Data');
        } else {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataDoubleEscaped');
        }
        break;

    case ('ScriptDataDoubleEscapedLessThanSign') :
        if (cc === '/') {
            this.bufferCharacter(cc);
            this.temporaryBuffer = '';
            this.advanceTo('ScriptDataDoubleEscapeEnd');
        } else {
            this.reconsumeIn('ScriptDataDoubleEscaped');
        }
        break;

    case ('ScriptDataDoubleEscapeEnd') :
        if (this.isWhiteSpace(cc) || cc === '/' || cc === '>') {
            this.bufferCharacter(cc);
            if (this.temporaryBufferIs('script')) {
                this.advanceTo('ScriptDataEscaped');
            } else {
                this.advanceTo('ScriptDataDoubleEscaped');
            }
        } else if (isASCIIUpper(cc)) {
            this.bufferCharacter(cc);
            this.temporaryBuffer += cc.toLowerCase();
            this.advanceTo('ScriptDataDoubleEscapeEnd');
        } else if (isASCIILower(cc)) {
            this.bufferCharacter(cc);
            this.temporaryBuffer += cc;
            this.advanceTo('ScriptDataDoubleEscapeEnd');
        } else {
            this.reconsumeIn('ScriptDataDoubleEscaped');
        }
        break;

    case ('BeforeAttributeName') :
        if (this.isWhiteSpace(cc)) {
            this.advanceTo('BeforeAttributeName');
        } else if (cc === '/') {
            this.advanceTo('SelfClosingStartTag');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (this.usePreHTML5ParserQuirks && cc === '<') {
            return this.emitAndReconsumeIn('Data');
        } else if (isASCIIUpper(cc)) {
            this.token.addNewAttribute();
            this.token.beginAttributeName(this.source.numberOfCharactersConsumed());
            this.token.appendToAttributeName(cc.toLowerCase());
            this.advanceTo('AttributeName');
        } else if (cc === 'EOF') {
            this.parseError();
            this.reconsumeIn('Data');
        } else {
            if (cc === '"' || cc === '\'' || cc === '<' || cc === '=') {
                this.parseError();
            }
            this.token.addNewAttribute();
            this.token.beginAttributeName(this.source.numberOfCharactersConsumed());
            this.token.appendToAttributeName(cc);
            this.advanceTo('AttributeName');
        }
        break;

    case ('AttributeName') :
        if (this.isWhiteSpace(cc)) {
            this.token.endAttributeName(this.source.numberOfCharactersConsumed());
            this.advanceTo('AfterAttributeName');
        } else if (cc === '/') {
            this.token.endAttributeName(this.source.numberOfCharactersConsumed());
            this.advanceTo('SelfClosingStartTag');
        } else if (cc === '=') {
            this.token.endAttributeName(this.source.numberOfCharactersConsumed());
            this.advanceTo('BeforeAttributeValue');
        } else if (cc === '>') {
            this.token.endAttributeName(this.source.numberOfCharactersConsumed());
            return this.emitAndResumeIn('Data');
        } else if (this.usePreHTML5ParserQuirks && cc === '<') {
            this.token.endAttributeName(this.source.numberOfCharactersConsumed());
            return this.emitAndReconsumeIn('Data');
        } else if (isASCIIUpper(cc)) {
            this.token.appendToAttributeName(cc.toLowerCase());
            this.advanceTo('AttributeName');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.endAttributeName(this.source.numberOfCharactersConsumed());
            this.reconsumeIn('Data');
        } else {
            if (cc === '"' || cc === '\'' || cc === '<' || cc === '=') {
                this.parseError();
            }
            this.token.appendToAttributeName(cc);
            this.advanceTo('AttributeName');
        }
        break;

    case ('AfterAttributeName') :
        if (this.isWhiteSpace(cc)) {
            this.advanceTo('AfterAttributeName');
        } else if (cc === '/') {
            this.advanceTo('SelfClosingStartTag');
        } else if (cc === '=') {
            this.advanceTo('BeforeAttributeValue');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (this.usePreHTML5ParserQuirks && cc === '<') {
            return this.emitAndReconsumeIn('Data');
        } else if (isASCIIUpper(cc)) {
            this.token.addNewAttribute();
            this.token.beginAttributeName(this.source.numberOfCharactersConsumed());
            this.token.appendToAttributeName(cc.toLowerCase());
            this.advanceTo('AttributeName');
        } else if (cc === 'EOF') {
            this.parseError();
            this.reconsumeIn('Data');
        } else {
            if (cc === '"' || cc === '\'' || cc === '<') {
                this.parseError();
            }
            this.token.addNewAttribute();
            this.token.beginAttributeName(this.source.numberOfCharactersConsumed());
            this.token.appendToAttributeName(cc);
            this.advanceTo('AttributeName');
        }
        break;

    case ('BeforeAttributeValue') :
        if (this.isWhiteSpace(cc)) {
            this.advanceTo('BeforeAttributeValue');
        } else if (cc === '"') {
            this.token.beginAttributeValue(this.source.numberOfCharactersConsumed() + 1);
            this.advanceTo('AttributeValueDoubleQuoted');
        } else if (cc === '&') {
            this.token.beginAttributeValue(this.source.numberOfCharactersConsumed());
            this.reconsumeIn('AttributeValueUnquoted');
        } else if (cc === '\'') {
            this.token.beginAttributeValue(this.source.numberOfCharactersConsumed() + 1);
            this.advanceTo('AttributeValueSingleQuoted');
        } else if (cc === '>') {
            this.parseError();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.reconsumeIn('Data');
        } else {
            if (cc === '<' || cc === '=' || cc === '`') {
                this.parseError();
            }
            this.token.beginAttributeValue(this.source.numberOfCharactersConsumed());
            this.token.appendToAttributeValue(cc);
            this.advanceTo('AttributeValueUnquoted');
        }
        break;

    case ('AttributeValueDoubleQuoted') :
        if (cc === '"') {
            this.token.endAttributeValue(this.source.numberOfCharactersConsumed());
            this.advanceTo('AfterAttributeValueQuoted');
        } else if (cc === '&') {
            this.additionalAllowedCharacter = '"';
            this.advanceTo('CharacterReferenceInAttributeValue');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.endAttributeValue(this.source.numberOfCharactersConsumed());
            this.reconsumeIn('Data');
        } else {
            this.token.appendToAttributeValue(cc);
            this.advanceTo('AttributeValueDoubleQuoted');
        }
        break;

    case ('AttributeValueSingleQuoted') :
        if (cc === '\'') {
            this.token.endAttributeValue(this.source.numberOfCharactersConsumed());
            this.advanceTo('AfterAttributeValueQuoted');
        } else if (cc === '&') {
            this.additionalAllowedCharacter = '\'';
            this.advanceTo('CharacterReferenceInAttributeValue');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.endAttributeValue(this.source.numberOfCharactersConsumed());
            this.reconsumeIn('Data');
        } else {
            this.token.appendToAttributeValue(cc);
            this.advanceTo('AttributeValueSingleQuoted');
        }
        break;

    case ('AttributeValueUnquoted') :
        if (this.isWhiteSpace(cc)) {
            this.token.endAttributeValue(this.source.numberOfCharactersConsumed());
            this.advanceTo('BeforeAttributeName');
        } else if (cc === '&') {
            this.additionalAllowedCharacter = '>';
            this.advanceTo('CharacterReferenceInAttributeValue');
        } else if (cc === '>') {
            this.token.endAttributeValue(this.source.numberOfCharactersConsumed());
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.endAttributeValue(this.source.numberOfCharactersConsumed());
            this.reconsumeIn('Data');
        } else {
            if (cc === '"' || cc === '\'' || cc === '<' || cc === '=' || cc === '`') {
                this.parseError();
            }
            this.token.appendToAttributeValue(cc);
            this.advanceTo('AttributeValueUnquoted');
        }
        break;

    case ('CharacterReferenceInAttributeValue') :
        notEnoughCharacters = false;
        success = this.consumeHTMLEntity(decodedEntity, notEnoughCharacters, this.additionalAllowedCharacter);
        if (notEnoughCharacters) {
            return this.haveBufferedCharacterToken();
        }

        if (!success) {
            assert.ok(decodedEntity.isEmpty());
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
            this.switchTo('AttributeValueDoubleQuoted');
        } else if (this.additionalAllowedCharacter === '\'') {
            this.switchTo('AttributeValueSingleQuoted');
        } else if (this.additionalAllowedCharacter === '>') {
            this.switchTo('AttributeValueUnquoted');
        } else {
            assert.ok(false);
        }
        break;

    case ('AfterAttributeValueQuoted') :
        if (this.isWhiteSpace(cc)) {
            this.advanceTo('BeforeAttributeName');
        } else if (cc === '/') {
            this.advanceTo('SelfClosingStartTag');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (this.usePreHTML5ParserQuirks && cc === '<') {
            return this.emitAndReconsumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.reconsumeIn('Data');
        } else {
            this.parseError();
            this.reconsumeIn('BeforeAttributeName');
        }
        break;

    case ('SelfClosingStartTag') :
        if (cc === '>') {
            this.token.setSelfClosing();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.reconsumeIn('Data');
        } else {
            this.parseError();
            this.reconsumeIn('BeforeAttributeName');
        }
        break;

    case ('BogusComment') :
        this.token.beginComment();
        this.reconsumeIn('ContinueBogusComment');
        break;

    case ('ContinueBogusComment') :
        if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToComment(cc);
            this.advanceTo('ContinueBogusComment');
        }
        break;

    case ('MarkupDeclarationOpen') :
        if (cc === '-') {
            result = this.source.lookAhead('--');
            if (result === SegmentedString.DidMatch) {
                this.source.advanceAndASSERT('-');
                this.source.advanceAndASSERT('-');
                this.token.beginComment();
                this.switchTo('CommentStart');
            } else if (result === SegmentedString.NotEnoughCharacters) {
                return this.haveBufferedCharacterToken();
            }
        } else if (cc === 'D' || cc === 'd') {
            result = this.source.lookAheadIgnoringCase("doctype");
            if (result === SegmentedString.DidMatch) {
                this.advanceStringAndASSERTIgnoringCase("doctype");
                this.switchTo('DOCTYPE');
            } else if (result === SegmentedString.NotEnoughCharacters) {
                return this.haveBufferedCharacterToken();
            }
        } else if (cc === '[' && this.shouldAllowCDATA) {
            result = this.source.lookAhead("[CDATA[");
            if (result === SegmentedString.DidMatch) {
                this.advanceStringAndASSERT("[CDATA[");
                this.switchTo('CDATASection');
            } else if (result === SegmentedString.NotEnoughCharacters) {
                return this.haveBufferedCharacterToken();
            }
        }
        this.parseError();
        this.reconsumeIn('BogusComment');
        break;

    case ('CommentStart') :
        if (cc === '-') {
            this.advanceTo('CommentStartDash');
        } else if (cc === '>') {
            this.parseError();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToComment(cc);
            this.advanceTo('Comment');
        }
        break;

    case ('CommentStartDash') :
        if (cc === '-') {
            this.advanceTo('CommentEnd');
        } else if (cc === '>') {
            this.parseError();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToComment('-');
            this.token.appendToComment(cc);
            this.advanceTo('Comment');
        }
        break;

    case ('Comment') :
        if (cc === '-') {
            this.advanceTo('CommentEndDash');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToComment(cc);
            this.advanceTo('Comment');
        }
        break;

    case ('CommentEndDash') :
        if (cc === '-') {
            this.advanceTo('CommentEnd');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToComment('-');
            this.token.appendToComment(cc);
            this.advanceTo('Comment');
        }
        break;

    case ('CommentEnd') :
        if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (cc === '!') {
            this.parseError();
            this.advanceTo('CommentEndBang');
        } else if (cc === '-') {
            this.parseError();
            this.token.appendToComment('-');
            this.advanceTo('CommentEnd');
        } else if (cc === 'EOF') {
            this.parseError();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.token.appendToComment('-');
            this.token.appendToComment('-');
            this.token.appendToComment(cc);
            this.advanceTo('Comment');
        }
        break;

    case ('CommentEndBang') :
        if (cc === '-') {
            this.token.appendToComment('-');
            this.token.appendToComment('-');
            this.token.appendToComment('!');
            this.advanceTo('CommentEndDash');
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
            this.advanceTo('Comment');
        }
        break;

    case ('DOCTYPE') :
        if (this.isWhiteSpace(cc)) {
            this.advanceTo('BeforeDOCTYPEName');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.beginDOCTYPE();
            this.token.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.reconsumeIn('BeforeDOCTYPEName');
        }
        break;

    case ('BeforeDOCTYPEName') :
        if (this.isWhiteSpace(cc)) {
            this.advanceTo('BeforeDOCTYPEName');
        } else if (isASCIIUpper(cc)) {
            this.token.beginDOCTYPE(cc.toLowerCase());
            this.advanceTo('DOCTYPEName');
        } else if (cc === '>') {
            this.parseError();
            this.token.beginDOCTYPE();
            this.token.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.beginDOCTYPE();
            this.token.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.beginDOCTYPE(cc);
            this.advanceTo('DOCTYPEName');
        }
        break;

    case ('DOCTYPEName') :
        if (this.isWhiteSpace(cc)) {
            this.advanceTo('AfterDOCTYPEName');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (isASCIIUpper(cc)) {
            this.token.appendToName(cc.toLowerCase());
            this.advanceTo('DOCTYPEName');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToName(cc);
            this.advanceTo('DOCTYPEName');
        }
        break;

    case ('AfterDOCTYPEName') :
        if (this.isWhiteSpace(cc)) {
            this.advanceTo('AfterDOCTYPEName');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            if (cc === 'P' || cc === 'p') {
                result = this.source.lookAheadIgnoringCase("public");
                if (result === SegmentedString.DidMatch) {
                    this.advanceStringAndASSERTIgnoringCase("public");
                    this.switchTo('AfterDOCTYPEPublicKeyword');
                } else if (result === SegmentedString.NotEnoughCharacters) {
                    return this.haveBufferedCharacterToken();
                }
            } else if (cc === 'S' || cc === 's') {
                result = this.source.lookAheadIgnoringCase("system");
                if (result === SegmentedString.DidMatch) {
                    this.advanceStringAndASSERTIgnoringCase("system");
                    this.switchTo('AfterDOCTYPESystemKeyword');
                } else if (result === SegmentedString.NotEnoughCharacters) {
                    return this.haveBufferedCharacterToken();
                }
            }
            this.parseError();
            this.token.setForceQuirks();
            this.advanceTo('BogusDOCTYPE');
        }
        break;

    case ('AfterDOCTYPEPublicKeyword') :
        if (this.isWhiteSpace(cc)) {
            this.advanceTo('BeforeDOCTYPEPublicIdentifier');
        } else if (cc === '"') {
            this.parseError();
            this.token.setPublicIdentifierToEmptyString();
            this.advanceTo('DOCTYPEPublicIdentifierDoubleQuoted');
        } else if (cc === '\'') {
            this.parseError();
            this.token.setPublicIdentifierToEmptyString();
            this.advanceTo('DOCTYPEPublicIdentifierSingleQuoted');
        } else if (cc === '>') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.token.setForceQuirks();
            this.advanceTo('BogusDOCTYPE');
        }
        break;

    case ('BeforeDOCTYPEPublicIdentifier') :
        if (this.isWhiteSpace(cc)) {
            this.advanceTo('BeforeDOCTYPEPublicIdentifier');
        } else if (cc === '"') {
            this.token.setPublicIdentifierToEmptyString();
            this.advanceTo('DOCTYPEPublicIdentifierDoubleQuoted');
        } else if (cc === '\'') {
            this.token.setPublicIdentifierToEmptyString();
            this.advanceTo('DOCTYPEPublicIdentifierSingleQuoted');
        } else if (cc === '>') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.token.setForceQuirks();
            this.advanceTo('BogusDOCTYPE');
        }
        break;

    case ('DOCTYPEPublicIdentifierDoubleQuoted') :
        if (cc === '"') {
            this.advanceTo('AfterDOCTYPEPublicIdentifier');
        } else if (cc === '>') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToPublicIdentifier(cc);
            this.advanceTo('DOCTYPEPublicIdentifierDoubleQuoted');
        }
        break;

    case ('DOCTYPEPublicIdentifierSingleQuoted') :
        if (cc === '\'') {
            this.advanceTo('AfterDOCTYPEPublicIdentifier');
        } else if (cc === '>') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToPublicIdentifier(cc);
            this.advanceTo('DOCTYPEPublicIdentifierSingleQuoted');
        }
        break;

    case ('AfterDOCTYPEPublicIdentifier') :
        if (this.isWhiteSpace(cc)) {
            this.advanceTo('BetweenDOCTYPEPublicAndSystemIdentifiers');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (cc === '"') {
            this.parseError();
            this.token.setSystemIdentifierToEmptyString();
            this.advanceTo('DOCTYPESystemIdentifierDoubleQuoted');
        } else if (cc === '\'') {
            this.parseError();
            this.token.setSystemIdentifierToEmptyString();
            this.advanceTo('DOCTYPESystemIdentifierSingleQuoted');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.token.setForceQuirks();
            this.advanceTo('BogusDOCTYPE');
        }
        break;

    case ('BetweenDOCTYPEPublicAndSystemIdentifiers') :
        if (this.isWhiteSpace(cc)) {
            this.advanceTo('BetweenDOCTYPEPublicAndSystemIdentifiers');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (cc === '"') {
            this.token.setSystemIdentifierToEmptyString();
            this.advanceTo('DOCTYPESystemIdentifierDoubleQuoted');
        } else if (cc === '\'') {
            this.token.setSystemIdentifierToEmptyString();
            this.advanceTo('DOCTYPESystemIdentifierSingleQuoted');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.token.setForceQuirks();
            this.advanceTo('BogusDOCTYPE');
        }
        break;

    case ('AfterDOCTYPESystemKeyword') :
        if (this.isWhiteSpace(cc)) {
            this.advanceTo('BeforeDOCTYPESystemIdentifier');
        } else if (cc === '"') {
            this.parseError();
            this.token.setSystemIdentifierToEmptyString();
            this.advanceTo('DOCTYPESystemIdentifierDoubleQuoted');
        } else if (cc === '\'') {
            this.parseError();
            this.token.setSystemIdentifierToEmptyString();
            this.advanceTo('DOCTYPESystemIdentifierSingleQuoted');
        } else if (cc === '>') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.token.setForceQuirks();
            this.advanceTo('BogusDOCTYPE');
        }
        break;

    case ('BeforeDOCTYPESystemIdentifier') :
        if (this.isTokenizerWhitespace(cc)) {
            this.advanceTo('BeforeDOCTYPESystemIdentifier');
        } else if (cc === '"') {
            this.token.setSystemIdentifierToEmptyString();
            this.advanceTo('DOCTYPESystemIdentifierDoubleQuoted');
        } else if (cc === '\'') {
            this.token.setSystemIdentifierToEmptyString();
            this.advanceTo('DOCTYPESystemIdentifierSingleQuoted');
        } else if (cc === '>') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.token.setForceQuirks();
            this.advanceTo('BogusDOCTYPE');
        }
        break;

    case ('DOCTYPESystemIdentifierDoubleQuoted') :
        if (cc === '"') {
            this.advanceTo('AfterDOCTYPESystemIdentifier');
        } else if (cc === '>') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToSystemIdentifier(cc);
            this.advanceTo('DOCTYPESystemIdentifierDoubleQuoted');
        }
        break;

    case ('DOCTYPESystemIdentifierSingleQuoted') :
        if (cc === '\'') {
            this.advanceTo('AfterDOCTYPESystemIdentifier');
        } else if (cc === '>') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.token.appendToSystemIdentifier(cc);
            this.advanceTo('DOCTYPESystemIdentifierSingleQuoted');
        }
        break;

    case ('AfterDOCTYPESystemIdentifier') :
        if (this.isWhiteSpace(cc)) {
            this.advanceTo('AfterDOCTYPESystemIdentifier');
        } else if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.advanceTo('BogusDOCTYPE');
        }
        break;

    case ('BogusDOCTYPE') :
        if (cc === '>') {
            return this.emitAndResumeIn('Data');
        } else if (cc === 'EOF') {
            return this.emitAndReconsumeIn('Data');
        } else {
            this.advanceTo('BogusDOCTYPE');
        }
        break;

    case ('CDATASection') :
        if (cc === ']') {
            this.advanceTo('CDATASectionRightSquareBracket');
        } else if (cc === 'EOF') {
            this.reconsumeIn('Data');
        } else {
            this.bufferCharacter(cc);
            this.advanceTo('CDATASection');
        }
        break;

    case ('CDATASectionRightSquareBracket') :
        if (cc === ']') {
            this.advanceTo('CDATASectionDoubleRightSquareBracket');
        } else {
            this.bufferCharacter(']');
            this.reconsumeIn('CDATASection');
        }
        break;

    case ('CDATASectionDoubleRightSquareBracket') :
        if (cc === '>') {
            this.advanceTo('Data');
        } else {
            this.bufferCharacter(']');
            this.bufferCharacter(']');
            this.reconsumeIn('CDATASection');
        }
        break;
    }
    return true;
};

