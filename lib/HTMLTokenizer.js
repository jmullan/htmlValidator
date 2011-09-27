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

// #include "config.h"
// #include "HTMLTokenizer.h"

// #include "HTMLEntityParser.h"
// #include "HTMLToken.h"
// #include "HTMLTreeBuilder.h"
// #include "HTMLNames.h"
// #include "MarkupTokenizerInlineMethods.h"
// #include "NotImplemented.h"
// #include <wtf/ASCIICType.h>
// #include <wtf/CurrentTime.h>
// #include <wtf/UnusedParam.h>
// #include <wtf/text/AtomicString.h>
// #include <wtf/text/CString.h>
// #include <wtf/unicode/Unicode.h>

// This has to go in a .cpp file, as the linker doesn't like it being included more than once.
// We don't have an HTMLToken.cpp though, so this is the next best place.
/* TODO
 * HTML_SWITCH_TO
 * HTML_ADVANCE_TO
 * emitEndOfFile
 * InputStreamPreprocessor.endOfFileMarker
 * processEntity
 * HTML_RECONSUME_IN
 * emitAndResumeIn
 * emitAndReconsumeIn
 * ASSERT
 * addToPossibleEndTag
 * isAppropriateEndTag
 * SegmentedString.DidMatch
 * SegmentedString.NotEnoughCharacters
 * shouldAllowCDATA
 * advanceStringAndASSERT
 * result
 * advanceStringAndASSERTIgnoringCase
 * consumeHTMLEntity
 */

var AtomicMarkupTokenBase_HTMLToken = {},
    MarkupTokenizerBase_HTMLToken_HTMLTokenizerState = {},
    HTMLTokenizer = function () {
        this.source = '';
        this.state = 'Data';
        this.token = {};
        this.lineNumber = 0;
        this.skipLeadingNewLineForListing = false;
        this.forceNullCharacterReplacement = false;
        this.shouldAllowCDATA = false;
        this.additionalAllowedCharacter = '';
        this.bufferedEndTagName = null;
        this.inputStreamPreprocessor = null;
        this.usePreHTML5ParserQuirks = null;
        this.temporaryBuffer = null;
        this.appropriateEndTagName = null;
        this.haveBufferedCharacterToken = false;
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
    _ = require('underscore');
    assert = require('assert'),
    notImplemented = function () {
        assert.ok(false, 'Not implmented');
    },
    notReached = function () {
        assert.ok(false, 'Should not have gotten to this line in the file.');
    },
    InputStreamPreprocessor = {}
;

HTMLTokenizer.prototype.advanceTo = function () {};
HTMLTokenizer.prototype.reconsumeIn = function () {};
HTMLTokenizer.prototype.switchTo = function () {};
HTMLTokenizer.prototype.addToPossibleEndTag = function () {};
HTMLTokenizer.prototype.isAppropriateEndTag = function () {};

HTMLTokenizer.prototype.emitAndResumeIn = function () {};
HTMLTokenizer.prototype.flushEmitAndReconsumeIn = function () {};



HTMLTokenizer.prototype.flushBufferedEndTag = function () {
    assert.ok(this.token.type() === HTMLTokenTypes.Character || this.token.type() === HTMLTokenTypes.Uninitialized);

    this.source.advance(this.lineNumber);
    if (this.token.type() === HTMLTokenTypes.Character) {
        return true;
    }
    this.token.beginEndTag(this.bufferedEndTagName);
    this.bufferedEndTagName.clear();
    return false;
};

HTMLTokenizer.prototype.flushAndAdvanceTo = function (stateName) {
    this.state = stateName;
    if (this.flushBufferedEndTag()) {
        return true;
    }
    if (this.source.isEmpty()
        || !this.inputStreamPreprocessor.peek(this.lineNumber)) {
        return this.haveBufferedCharacterToken();
    }
    var cc = this.inputStreamPreprocessor.nextInputCharacter();
        // TODO: yeah...
        // goto stateName;
    return false;
};

HTMLTokenizer.prototype.flushEmitAndResumeIn = function (/* 'State */ state) {
    this.state = state;
    this.flushBufferedEndTag();
    return true;
};

HTMLTokenizer.prototype.updateStateFor = function (/* const AtomicString& */ tagName, /* Frame* */ frame) {
    if (tagName === textareaTag || tagName === titleTag) {
        this.setState('RCDATA');
    } else if (tagName === plaintextTag) {
        this.setState('PLAINTEXT');
    } else if (tagName === scriptTag) {
        this.setState('ScriptData');
    } else if (
        tagName === styleTag
            || tagName === iframeTag
            || tagName === xmpTag
            || (tagName === noembedTag && HTMLTreeBuilder.pluginsEnabled(frame))
            || tagName === noframesTag
            || (tagName === noscriptTag && HTMLTreeBuilder.scriptEnabled(frame))
    ) {
        this.setState('RAWTEXT');
    }
};

HTMLTokenizer.prototype.temporaryBufferIs = function (/* const String& */ expectedString) {
    return this.temporaryBuffer === expectedString;
};

HTMLTokenizer.prototype.addToPossibleEndTag = function (/* UChar */ cc) {
    assert.ok(HTMLTokenizerState.isEndTagBufferingState(this.state));
    this.bufferedEndTagName.append(cc);
};

HTMLTokenizer.prototype.isAppropriateEndTag = function () {
    return this.bufferedEndTagName === this.appropriateEndTagName;
};

HTMLTokenizer.prototype.parseError = function () {
    notImplemented();
};

HTMLTokenizer.prototype.nextToken = function (/* HTMLToken& */ token) {
    // If we have a token in progress, then we're supposed to be called back
    // with the same token so we can finish it.
    assert.ok(!this.token || this.token === token || token.type() === HTMLTokenTypes.Uninitialized);
    this.token = token;

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

    if (this.source.isEmpty() || !this.inputStreamPreprocessor.peek(this.lineNumber)) {
        return this.haveBufferedCharacterToken();
    }
    var cc = this.inputStreamPreprocessor.nextInputCharacter();

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
                HTML_ADVANCE_TO('Data');
            }
            if (this.state === 'RCDATA') {
                HTML_ADVANCE_TO('RCDATA');
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
        } else if (cc === '<') {
            if (this.token.type() === HTMLTokenTypes.Character) {
                // We have a bunch of character tokens queued up that we
                // are emitting lazily here.
                return true;
            }
            this.advanceTo('TagOpen');
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
            return this.emitEndOfFile();
        } else {
            this.bufferCharacter(cc);
            this.advanceTo('Data');
        }
        break;

    case ('CharacterReferenceInData') :
        if (!processEntity()) {
            return this.haveBufferedCharacterToken();
        }
        this.switchTo('Data');
        break;

    case ('RCDATA') :
        if (cc === '&') {
            this.advanceTo('CharacterReferenceInRCDATA');
        } else if (cc === '<') {
            this.advanceTo('RCDATALessThanSign');
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
            return this.emitEndOfFile();
        } else {
            this.bufferCharacter(cc);
            this.advanceTo('RCDATA');
        }
        break;

    case ('CharacterReferenceInRCDATA') :
        if (!processEntity()) {
            return this.haveBufferedCharacterToken();
        }
        this.switchTo('RCDATA');
        break;

    case ('RAWTEXT') :
        if (cc === '<') {
            this.advanceTo('RAWTEXTLessThanSign');
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
            return this.emitEndOfFile();
        } else {
            this.bufferCharacter(cc);
            this.advanceTo('RAWTEXT');
        }
        break;

    case ('ScriptData') :
        if (cc === '<') {
            this.advanceTo('ScriptDataLessThanSign');
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
            return this.emitEndOfFile();
        } else {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptData');
        }
        break;

    case ('PLAINTEXT') :
        if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.reconsumeIn('Data');
        } else {
            this.token.appendToName(cc);
            this.advanceTo('TagName');
        }
        break;

    case ('RCDATALessThanSign') :
        if (cc === '/') {
            this.temporaryBuffer.clear();
            assert.ok(this.bufferedEndTagName.isEmpty());
            this.advanceTo('RCDATAEndTagOpen');
        } else {
            this.bufferCharacter('<');
            this.reconsumeIn('RCDATA');
        }
        break;

    case ('RCDATAEndTagOpen') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer.append(cc);
            this.addToPossibleEndTag(cc.toLowerCase());
            this.advanceTo('RCDATAEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer.append(cc);
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
            this.temporaryBuffer.append(cc);
            this.addToPossibleEndTag(cc.toLowerCase());
            this.advanceTo('RCDATAEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer.append(cc);
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
            this.temporaryBuffer.clear();
            assert.ok(this.bufferedEndTagName.isEmpty());
            this.advanceTo('RAWTEXTEndTagOpen');
        } else {
            this.bufferCharacter('<');
            this.reconsumeIn('RAWTEXT');
        }
        break;

    case ('RAWTEXTEndTagOpen') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer.append(cc);
            this.addToPossibleEndTag(cc.toLowerCase());
            this.advanceTo('RAWTEXTEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer.append(cc);
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
            this.temporaryBuffer.append(cc);
            this.addToPossibleEndTag(cc.toLowerCase());
            this.advanceTo('RAWTEXTEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer.append(cc);
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
            this.temporaryBuffer.clear();
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
            this.temporaryBuffer.append(cc);
            this.addToPossibleEndTag(cc.toLowerCase());
            this.advanceTo('ScriptDataEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer.append(cc);
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
            this.temporaryBuffer.append(cc);
            this.addToPossibleEndTag(cc.toLowerCase());
            this.advanceTo('ScriptDataEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer.append(cc);
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } if (cc === InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.reconsumeIn('Data');
        } else {
            this.bufferCharacter(cc);
            this.advanceTo('ScriptDataEscaped');
        }
        break;

    case ('ScriptDataEscapedLessThanSign') :
        if (cc === '/') {
            this.temporaryBuffer.clear();
            assert.ok(this.bufferedEndTagName.isEmpty());
            this.advanceTo('ScriptDataEscapedEndTagOpen');
        } else if (isASCIIUpper(cc)) {
            this.bufferCharacter('<');
            this.bufferCharacter(cc);
            this.temporaryBuffer.clear();
            this.temporaryBuffer.append(cc.toLowerCase());
            this.advanceTo('ScriptDataDoubleEscapeStart');
        } else if (isASCIILower(cc)) {
            this.bufferCharacter('<');
            this.bufferCharacter(cc);
            this.temporaryBuffer.clear();
            this.temporaryBuffer.append(cc);
            this.advanceTo('ScriptDataDoubleEscapeStart');
        } else {
            this.bufferCharacter('<');
            this.reconsumeIn('ScriptDataEscaped');
        }
        break;

    case ('ScriptDataEscapedEndTagOpen') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer.append(cc);
            this.addToPossibleEndTag(cc.toLowerCase());
            this.advanceTo('ScriptDataEscapedEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer.append(cc);
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
            this.temporaryBuffer.append(cc);
            this.addToPossibleEndTag(cc.toLowerCase());
            this.advanceTo('ScriptDataEscapedEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer.append(cc);
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
            if (this.temporaryBufferIs(scriptTag.localName())) {
                this.advanceTo('ScriptDataDoubleEscaped');
            } else {
                this.advanceTo('ScriptDataEscaped');
            }
        } else if (isASCIIUpper(cc)) {
            this.bufferCharacter(cc);
            this.temporaryBuffer.append(cc.toLowerCase());
            this.advanceTo('ScriptDataDoubleEscapeStart');
        } else if (isASCIILower(cc)) {
            this.bufferCharacter(cc);
            this.temporaryBuffer.append(cc);
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
            this.temporaryBuffer.clear();
            this.advanceTo('ScriptDataDoubleEscapeEnd');
        } else {
            this.reconsumeIn('ScriptDataDoubleEscaped');
        }
        break;

    case ('ScriptDataDoubleEscapeEnd') :
        if (this.isWhiteSpace(cc) || cc === '/' || cc === '>') {
            this.bufferCharacter(cc);
            if (this.temporaryBufferIs(scriptTag.localName())) {
                this.advanceTo('ScriptDataEscaped');
            } else {
                this.advanceTo('ScriptDataDoubleEscaped');
            }
        } else if (isASCIIUpper(cc)) {
            this.bufferCharacter(cc);
            this.temporaryBuffer.append(cc.toLowerCase());
            this.advanceTo('ScriptDataDoubleEscapeEnd');
        } else if (isASCIILower(cc)) {
            this.bufferCharacter(cc);
            this.temporaryBuffer.append(cc);
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        var notEnoughCharacters = false,
            decodedEntity,
            i,
            success = consumeHTMLEntity(decodedEntity, notEnoughCharacters, this.additionalAllowedCharacter);
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
                advanceStringAndASSERTIgnoringCase("doctype");
                this.switchTo('DOCTYPE');
            } else if (result === SegmentedString.NotEnoughCharacters) {
                return this.haveBufferedCharacterToken();
            }
        } else if (cc === '[' && shouldAllowCDATA()) {
            result = this.source.lookAhead("[CDATA[");
            if (result === SegmentedString.DidMatch) {
                advanceStringAndASSERT("[CDATA[");
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.setForceQuirks();
            return this.emitAndReconsumeIn('Data');
        } else {
            if (cc === 'P' || cc === 'p') {
                result = this.source.lookAheadIgnoringCase("public");
                if (result === SegmentedString.DidMatch) {
                    advanceStringAndASSERTIgnoringCase("public");
                    this.switchTo('AfterDOCTYPEPublicKeyword');
                } else if (result === SegmentedString.NotEnoughCharacters) {
                    return this.haveBufferedCharacterToken();
                }
            } else if (cc === 'S' || cc === 's') {
                result = this.source.lookAheadIgnoringCase("system");
                if (result === SegmentedString.DidMatch) {
                    advanceStringAndASSERTIgnoringCase("system");
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
            return this.emitAndReconsumeIn('Data');
        } else {
            this.advanceTo('BogusDOCTYPE');
        }
        break;

    case ('CDATASection') :
        if (cc === ']') {
            this.advanceTo('CDATASectionRightSquareBracket');
        } else if (cc === InputStreamPreprocessor.endOfFileMarker) {
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
    assert.ok(false);
    return false;
};

