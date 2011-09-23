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
        this.token = 0;
        this.lineNumber = 0;
        this.skipLeadingNewLineForListing = false;
        this.forceNullCharacterReplacement = false;
        this.shouldAllowCDATA = false;
        this.additionalAllowedCharacter = '\0';
        this.bufferedEndTagName = null;
        this.inputStreamPreprocessor = null;
        this.usePreHTML5ParserQuirks = null;
        this.temporaryBuffer = null;
        this.appropriateEndTagName = null;
        this.haveBufferedCharacterToken = false;
    },
    HTMLTokenizerState = {},
    vectorEqualsString = function (a, b) {
        return a === b;
    },
    HTMLTokenTypes = {
    },
    isASCIIUpper = function (c) {
        return /^[A-Z]+$/.test(c);
    },
    isASCIILower = function (c) {
        return /^[a-z]+$/.test(c);
    },
    QualifiedName = function () {
    },
    AtomicString = function () {
    },
    assert = require('assert'),
    _ = require('underscore');

AtomicMarkupTokenBase_HTMLToken.nameForAttribute = function (/* const AttributeBase& */ attribute) {
    return QualifiedName(nullAtom, AtomicString(attribute.m_name.data(), attribute.m_name.size()), nullAtom);
};

AtomicMarkupTokenBase_HTMLToken.usesName = function () {
    return (
        this.type == HTMLTokenTypes.StartTag
        || this.type == HTMLTokenTypes.EndTag
        || this.type == HTMLTokenTypes.DOCTYPE
    );
};

AtomicMarkupTokenBase_HTMLToken.usesAttributes = function () {
    return this.type == HTMLTokenTypes.StartTag || this.type == HTMLTokenTypes.EndTag;
};


HTMLTokenizerState.isEndTagBufferingState = function (state) {
    return _.indexOf([
        'RCDATAEndTagOpen',
        'RCDATAEndTagName',
        'RAWTEXTEndTagOpen',
        'RAWTEXTEndTagName',
        'ScriptDataEndTagOpen',
        'ScriptDataEndTagName',
        'ScriptDataEscapedEndTagOpen',
        'ScriptDataEscapedEndTagName'
    ], state) !== -1;
};

// #define HTML_BEGIN_STATE(stateName) BEGIN_STATE(HTMLTokenizerState, stateName)
// #define HTML_RECONSUME_IN(stateName) RECONSUME_IN(HTMLTokenizerState, stateName)
// #define HTML_ADVANCE_TO('stateName) ADVANCE_TO(HTMLTokenizerState, stateName)
// #define HTML_SWITCH_TO(stateName) SWITCH_TO(HTMLTokenizerState, stateName)

HTMLTokenizer.prototype.usePreHTML5ParserQuirks = function (usePreHTML5ParserQuirks) {
    this.reset();
};

HTMLTokenizer.prototype.shouldSkipNullCharacters = function () {
    return (
        !this.forceNullCharacterReplacement
            && (this.state == 'Data'
                || this.state == 'RCDATA'
                || this.state == 'RAWTEXT'
                || this.state == 'PLAINTEXT')
    );
};

HTMLTokenizer.prototype.bufferCharacter = function () {
};

HTMLTokenizer.prototype.flushBufferedEndTag = function () {
};

HTMLTokenizer.prototype.isWhiteSpace = function (string) {
    return /^[ \t\n\r\]+/.test(string);
};

HTMLTokenizer.prototype.reset = HTMLTokenizer;

HTMLTokenizer.prototype.processEntity = function () {
    var notEnoughCharacters = false,
        decodedEntity,
        success = consumeHTMLEntity(decodedEntity, notEnoughCharacters),
        i;

    if (notEnoughCharacters) {
        return false;
    }

    if (!success) {
        assert.ok(decodedEntity.isEmpty());
        this.bufferCharacter('&');
    } else {
        for (i = 0; i < decodedEntity.length(); ++i) {
            this.bufferCharacter(decodedEntity[i]);
        }
    }

    return true;
};

HTMLTokenizer.prototype.flushBufferedEndTag = function () {
    assert.ok(this.token.type() == HTMLTokenTypes.Character || this.token.type() == HTMLTokenTypes.Uninitialized);
    this.source.advance(this.lineNumber);
    if (this.token.type() == HTMLTokenTypes.Character) {
        return true;
    }
    this.token.beginEndTag(this.bufferedEndTagName);
    this.bufferedEndTagName.clear();
    return false;
};

HTMLTokenizer.prototype.FLUSH_AND_ADVANCE_TO = function (stateName) {
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
    if (tagName == textareaTag || tagName == titleTag) {
        this.setState('RCDATA');
    } else if (tagName == plaintextTag) {
        this.setState('PLAINTEXT');
    } else if (tagName == scriptTag) {
        this.setState('ScriptData');
    } else if (
        tagName == styleTag
            || tagName == iframeTag
            || tagName == xmpTag
            || (tagName == noembedTag && HTMLTreeBuilder.pluginsEnabled(frame))
            || tagName == noframesTag
            || (tagName == noscriptTag && HTMLTreeBuilder.scriptEnabled(frame))
    ) {
        this.setState('RAWTEXT');
    }
};

HTMLTokenizer.prototype.temporaryBufferIs = function (/* const String& */ expectedString) {
    return vectorEqualsString(this.temporaryBuffer, expectedString);
};

HTMLTokenizer.prototype.addToPossibleEndTag = function (/* UChar */ cc) {
    assert.ok(HTMLTokenizerState.isEndTagBufferingState(this.state));
    this.bufferedEndTagName.append(cc);
};

HTMLTokenizer.prototype.isAppropriateEndTag = function () {
    return this.bufferedEndTagName == this.appropriateEndTagName;
};

HTMLTokenizer.prototype.parseError = function () {
    notImplemented();
};

HTMLTokenizer.prototype.nextToken = function (/* HTMLToken& */ token) {
    // If we have a token in progress, then we're supposed to be called back
    // with the same token so we can finish it.
    assert.ok(!this.token || this.token == token || token.type() == HTMLTokenTypes.Uninitialized);
    this.token = token;

    if (!this.bufferedEndTagName.isEmpty() && !HTMLTokenizerState.isEndTagBufferingState(this.state)) {
        // FIXME: This should call this.flushBufferedEndTag().
        // We started an end tag during our last iteration.
        this.token.beginEndTag(this.bufferedEndTagName);
        this.bufferedEndTagName.clear();
        if (this.state == 'Data') {
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
        if (cc == '\n') {
            if (this.state == 'Data') {
                HTML_ADVANCE_TO('Data');
            }
            if (this.state == 'RCDATA') {
                HTML_ADVANCE_TO('RCDATA');
            }
            // When parsing text/plain documents, we run the tokenizer in the
            // PLAINTEXTState and ignore this.skipLeadingNewLineForListing.
            assert.ok(this.state == 'PLAINTEXT');
        }
    }

    // Source: http://www.whatwg.org/specs/web-apps/current-work/#tokenization
    switch (this.state) {
    case ('Data') :
        if (cc == '&') {
            HTML_ADVANCE_TO('CharacterReferenceInData');
        } else if (cc == '<') {
            if (this.token.type() == HTMLTokenTypes.Character) {
                // We have a bunch of character tokens queued up that we
                // are emitting lazily here.
                return true;
            }
            HTML_ADVANCE_TO('TagOpen');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            return emitEndOfFile();
        } else {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('Data');
        }
        break;
        /* END_STATE */

    case ('CharacterReferenceInData') :
        if (!processEntity()) {
            return this.haveBufferedCharacterToken();
        }
        HTML_SWITCH_TO('Data');
        break;
        /* END_STATE */

    case ('RCDATA') :
        if (cc == '&') {
            HTML_ADVANCE_TO('CharacterReferenceInRCDATA');
        } else if (cc == '<') {
            HTML_ADVANCE_TO('RCDATALessThanSign');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            return emitEndOfFile();
        } else {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('RCDATA');
        }
        break;
        /* END_STATE */

    case ('CharacterReferenceInRCDATA') :
        if (!processEntity()) {
            return this.haveBufferedCharacterToken();
        }
        HTML_SWITCH_TO('RCDATA');
        break;
        /* END_STATE */

    case ('RAWTEXT') :
        if (cc == '<') {
            HTML_ADVANCE_TO('RAWTEXTLessThanSign');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            return emitEndOfFile();
        } else {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('RAWTEXT');
        }
        break;
        /* END_STATE */

    case ('ScriptData') :
        if (cc == '<') {
            HTML_ADVANCE_TO('ScriptDataLessThanSign');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            return emitEndOfFile();
        } else {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptData');
        }
        break;
        /* END_STATE */

    case ('PLAINTEXT') :
        if (cc == InputStreamPreprocessor.endOfFileMarker) {
            return emitEndOfFile();
        } else {
            this.bufferCharacter(cc);
        }
        HTML_ADVANCE_TO('PLAINTEXT');
        break;
        /* END_STATE */

    case ('TagOpen') :
        if (cc == '!') {
            HTML_ADVANCE_TO('MarkupDeclarationOpen');
        } else if (cc == '/') {
            HTML_ADVANCE_TO('EndTagOpen');
        } else if (isASCIIUpper(cc)) {
            this.token.beginStartTag(cc.toLowerCase());
            HTML_ADVANCE_TO('TagName');
        } else if (isASCIILower(cc)) {
            this.token.beginStartTag(cc);
            HTML_ADVANCE_TO('TagName');
        } else if (cc == '?') {
            this.parseError();
            // The spec consumes the current character before switching
            // to the bogus comment state, but it's easier to implement
            // if we reconsume the current character.
            HTML_RECONSUME_IN('BogusComment');
        } else {
            this.parseError();
            this.bufferCharacter('<');
            HTML_RECONSUME_IN('Data');
        }
        break;
        /* END_STATE */

    case ('EndTagOpen') :
        if (isASCIIUpper(cc)) {
            this.token.beginEndTag(cc.toLowerCase());
            HTML_ADVANCE_TO('TagName');
        } else if (isASCIILower(cc)) {
            this.token.beginEndTag(cc);
            HTML_ADVANCE_TO('TagName');
        } else if (cc == '>') {
            this.parseError();
            HTML_ADVANCE_TO('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            HTML_RECONSUME_IN('Data');
        } else {
            this.parseError();
            HTML_RECONSUME_IN('BogusComment');
        }
        break;
        /* END_STATE */

    case ('TagName') :
        if (this.isWhiteSpace(cc)) {
            HTML_ADVANCE_TO('BeforeAttributeName');
        } else if (cc == '/') {
            HTML_ADVANCE_TO('SelfClosingStartTag');
        } else if (cc == '>') {
            return emitAndResumeIn('Data');
        } else if (this.usePreHTML5ParserQuirks && cc == '<') {
            return emitAndReconsumeIn('Data');
        } else if (isASCIIUpper(cc)) {
            this.token.appendToName(cc.toLowerCase());
            HTML_ADVANCE_TO('TagName');
        } if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            HTML_RECONSUME_IN('Data');
        } else {
            this.token.appendToName(cc);
            HTML_ADVANCE_TO('TagName');
        }
        break;
        /* END_STATE */

    case ('RCDATALessThanSign') :
        if (cc == '/') {
            this.temporaryBuffer.clear();
            assert.ok(this.bufferedEndTagName.isEmpty());
            HTML_ADVANCE_TO('RCDATAEndTagOpen');
        } else {
            this.bufferCharacter('<');
            HTML_RECONSUME_IN('RCDATA');
        }
        break;
        /* END_STATE */

    case ('RCDATAEndTagOpen') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer.append(cc);
            addToPossibleEndTag(cc.toLowerCase());
            HTML_ADVANCE_TO('RCDATAEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer.append(cc);
            addToPossibleEndTag(cc);
            HTML_ADVANCE_TO('RCDATAEndTagName');
        } else {
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            HTML_RECONSUME_IN('RCDATA');
        }
        break;
        /* END_STATE */

    case ('RCDATAEndTagName') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer.append(cc);
            addToPossibleEndTag(cc.toLowerCase());
            HTML_ADVANCE_TO('RCDATAEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer.append(cc);
            addToPossibleEndTag(cc);
            HTML_ADVANCE_TO('RCDATAEndTagName');
        } else {
            if (this.isWhiteSpace(cc)) {
                if (isAppropriateEndTag())
                    this.FLUSH_AND_ADVANCE_TO('BeforeAttributeName');
            } else if (cc == '/') {
                if (isAppropriateEndTag())
                    this.FLUSH_AND_ADVANCE_TO('SelfClosingStartTag');
            } else if (cc == '>') {
                if (isAppropriateEndTag())
                    return flushEmitAndResumeIn('Data');
            }
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            this.token.appendToCharacter(this.temporaryBuffer);
            this.bufferedEndTagName.clear();
            HTML_RECONSUME_IN('RCDATA');
        }
        break;
        /* END_STATE */

    case ('RAWTEXTLessThanSign') :
        if (cc == '/') {
            this.temporaryBuffer.clear();
            assert.ok(this.bufferedEndTagName.isEmpty());
            HTML_ADVANCE_TO('RAWTEXTEndTagOpen');
        } else {
            this.bufferCharacter('<');
            HTML_RECONSUME_IN('RAWTEXT');
        }
        break;
        /* END_STATE */

    case ('RAWTEXTEndTagOpen') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer.append(cc);
            addToPossibleEndTag(cc.toLowerCase());
            HTML_ADVANCE_TO('RAWTEXTEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer.append(cc);
            addToPossibleEndTag(cc);
            HTML_ADVANCE_TO('RAWTEXTEndTagName');
        } else {
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            HTML_RECONSUME_IN('RAWTEXT');
        }
        break;
        /* END_STATE */

    case ('RAWTEXTEndTagName') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer.append(cc);
            addToPossibleEndTag(cc.toLowerCase());
            HTML_ADVANCE_TO('RAWTEXTEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer.append(cc);
            addToPossibleEndTag(cc);
            HTML_ADVANCE_TO('RAWTEXTEndTagName');
        } else {
            if (this.isWhiteSpace(cc)) {
                if (isAppropriateEndTag())
                    this.FLUSH_AND_ADVANCE_TO('BeforeAttributeName');
            } else if (cc == '/') {
                if (isAppropriateEndTag())
                    this.FLUSH_AND_ADVANCE_TO('SelfClosingStartTag');
            } else if (cc == '>') {
                if (isAppropriateEndTag())
                    return flushEmitAndResumeIn('Data');
            }
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            this.token.appendToCharacter(this.temporaryBuffer);
            this.bufferedEndTagName.clear();
            HTML_RECONSUME_IN('RAWTEXT');
        }
        break;
        /* END_STATE */

    case ('ScriptDataLessThanSign') :
        if (cc == '/') {
            this.temporaryBuffer.clear();
            assert.ok(this.bufferedEndTagName.isEmpty());
            HTML_ADVANCE_TO('ScriptDataEndTagOpen');
        } else if (cc == '!') {
            this.bufferCharacter('<');
            this.bufferCharacter('!');
            HTML_ADVANCE_TO('ScriptDataEscapeStart');
        } else {
            this.bufferCharacter('<');
            HTML_RECONSUME_IN('ScriptData');
        }
        break;
        /* END_STATE */

    case ('ScriptDataEndTagOpen') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer.append(cc);
            addToPossibleEndTag(cc.toLowerCase());
            HTML_ADVANCE_TO('ScriptDataEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer.append(cc);
            addToPossibleEndTag(cc);
            HTML_ADVANCE_TO('ScriptDataEndTagName');
        } else {
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            HTML_RECONSUME_IN('ScriptData');
        }
        break;
        /* END_STATE */

    case ('ScriptDataEndTagName') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer.append(cc);
            addToPossibleEndTag(cc.toLowerCase());
            HTML_ADVANCE_TO('ScriptDataEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer.append(cc);
            addToPossibleEndTag(cc);
            HTML_ADVANCE_TO('ScriptDataEndTagName');
        } else {
            if (this.isWhiteSpace(cc)) {
                if (isAppropriateEndTag())
                    this.FLUSH_AND_ADVANCE_TO('BeforeAttributeName');
            } else if (cc == '/') {
                if (isAppropriateEndTag())
                    this.FLUSH_AND_ADVANCE_TO('SelfClosingStartTag');
            } else if (cc == '>') {
                if (isAppropriateEndTag())
                    return flushEmitAndResumeIn('Data');
            }
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            this.token.appendToCharacter(this.temporaryBuffer);
            this.bufferedEndTagName.clear();
            HTML_RECONSUME_IN('ScriptData');
        }
        break;
        /* END_STATE */

    case ('ScriptDataEscapeStart') :
        if (cc == '-') {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptDataEscapeStartDash');
        } else {
            HTML_RECONSUME_IN('ScriptData');
        }
        break;
        /* END_STATE */

    case ('ScriptDataEscapeStartDash') :
        if (cc == '-') {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptDataEscapedDashDash');
        } else
        HTML_RECONSUME_IN('ScriptData');
        break;
        /* END_STATE */

    case ('ScriptDataEscaped') :
        if (cc == '-') {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptDataEscapedDash');
        } else if (cc == '<') {
            HTML_ADVANCE_TO('ScriptDataEscapedLessThanSign');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            HTML_RECONSUME_IN('Data');
        } else {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptDataEscaped');
        }
        break;
        /* END_STATE */

    case ('ScriptDataEscapedDash') :
        if (cc == '-') {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptDataEscapedDashDash');
        } else if (cc == '<')
        HTML_ADVANCE_TO('ScriptDataEscapedLessThanSign');
        else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            HTML_RECONSUME_IN('Data');
        } else {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptDataEscaped');
        }
        break;
        /* END_STATE */

    case ('ScriptDataEscapedDashDash') :
        if (cc == '-') {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptDataEscapedDashDash');
        } else if (cc == '<')
        HTML_ADVANCE_TO('ScriptDataEscapedLessThanSign');
        else if (cc == '>') {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptData');
        } if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            HTML_RECONSUME_IN('Data');
        } else {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptDataEscaped');
        }
        break;
        /* END_STATE */

    case ('ScriptDataEscapedLessThanSign') :
        if (cc == '/') {
            this.temporaryBuffer.clear();
            assert.ok(this.bufferedEndTagName.isEmpty());
            HTML_ADVANCE_TO('ScriptDataEscapedEndTagOpen');
        } else if (isASCIIUpper(cc)) {
            this.bufferCharacter('<');
            this.bufferCharacter(cc);
            this.temporaryBuffer.clear();
            this.temporaryBuffer.append(cc.toLowerCase());
            HTML_ADVANCE_TO('ScriptDataDoubleEscapeStart');
        } else if (isASCIILower(cc)) {
            this.bufferCharacter('<');
            this.bufferCharacter(cc);
            this.temporaryBuffer.clear();
            this.temporaryBuffer.append(cc);
            HTML_ADVANCE_TO('ScriptDataDoubleEscapeStart');
        } else {
            this.bufferCharacter('<');
            HTML_RECONSUME_IN('ScriptDataEscaped');
        }
        break;
        /* END_STATE */

    case ('ScriptDataEscapedEndTagOpen') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer.append(cc);
            addToPossibleEndTag(cc.toLowerCase());
            HTML_ADVANCE_TO('ScriptDataEscapedEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer.append(cc);
            addToPossibleEndTag(cc);
            HTML_ADVANCE_TO('ScriptDataEscapedEndTagName');
        } else {
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            HTML_RECONSUME_IN('ScriptDataEscaped');
        }
        break;
        /* END_STATE */

    case ('ScriptDataEscapedEndTagName') :
        if (isASCIIUpper(cc)) {
            this.temporaryBuffer.append(cc);
            addToPossibleEndTag(cc.toLowerCase());
            HTML_ADVANCE_TO('ScriptDataEscapedEndTagName');
        } else if (isASCIILower(cc)) {
            this.temporaryBuffer.append(cc);
            addToPossibleEndTag(cc);
            HTML_ADVANCE_TO('ScriptDataEscapedEndTagName');
        } else {
            if (this.isWhiteSpace(cc)) {
                if (isAppropriateEndTag())
                    this.FLUSH_AND_ADVANCE_TO('BeforeAttributeName');
            } else if (cc == '/') {
                if (isAppropriateEndTag())
                    this.FLUSH_AND_ADVANCE_TO('SelfClosingStartTag');
            } else if (cc == '>') {
                if (isAppropriateEndTag())
                    return flushEmitAndResumeIn('Data');
            }
            this.bufferCharacter('<');
            this.bufferCharacter('/');
            this.token.appendToCharacter(this.temporaryBuffer);
            this.bufferedEndTagName.clear();
            HTML_RECONSUME_IN('ScriptDataEscaped');
        }
        break;
        /* END_STATE */

    case ('ScriptDataDoubleEscapeStart') :
        if (this.isWhiteSpace(cc) || cc == '/' || cc == '>') {
            this.bufferCharacter(cc);
            if (temporaryBufferIs(scriptTag.localName())) {
                HTML_ADVANCE_TO('ScriptDataDoubleEscaped');
            } else {
                HTML_ADVANCE_TO('ScriptDataEscaped');
            }
        } else if (isASCIIUpper(cc)) {
            this.bufferCharacter(cc);
            this.temporaryBuffer.append(cc.toLowerCase());
            HTML_ADVANCE_TO('ScriptDataDoubleEscapeStart');
        } else if (isASCIILower(cc)) {
            this.bufferCharacter(cc);
            this.temporaryBuffer.append(cc);
            HTML_ADVANCE_TO('ScriptDataDoubleEscapeStart');
        } else {
            HTML_RECONSUME_IN('ScriptDataEscaped');
        }
        break;
        /* END_STATE */

    case ('ScriptDataDoubleEscaped') :
        if (cc == '-') {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptDataDoubleEscapedDash');
        } else if (cc == '<') {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptDataDoubleEscapedLessThanSign');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            HTML_RECONSUME_IN('Data');
        } else {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptDataDoubleEscaped');
        }
        break;
        /* END_STATE */

    case ('ScriptDataDoubleEscapedDash') :
        if (cc == '-') {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptDataDoubleEscapedDashDash');
        } else if (cc == '<') {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptDataDoubleEscapedLessThanSign');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            HTML_RECONSUME_IN('Data');
        } else {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptDataDoubleEscaped');
        }
        break;
        /* END_STATE */

    case ('ScriptDataDoubleEscapedDashDash') :
        if (cc == '-') {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptDataDoubleEscapedDashDash');
        } else if (cc == '<') {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptDataDoubleEscapedLessThanSign');
        } else if (cc == '>') {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptData');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            HTML_RECONSUME_IN('Data');
        } else {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('ScriptDataDoubleEscaped');
        }
        break;
        /* END_STATE */

    case ('ScriptDataDoubleEscapedLessThanSign') :
        if (cc == '/') {
            this.bufferCharacter(cc);
            this.temporaryBuffer.clear();
            HTML_ADVANCE_TO('ScriptDataDoubleEscapeEnd');
        } else {
            HTML_RECONSUME_IN('ScriptDataDoubleEscaped');
        }
        break;
        /* END_STATE */

    case ('ScriptDataDoubleEscapeEnd') :
        if (this.isWhiteSpace(cc) || cc == '/' || cc == '>') {
            this.bufferCharacter(cc);
            if (temporaryBufferIs(scriptTag.localName())) {
                HTML_ADVANCE_TO('ScriptDataEscaped');
            } else {
                HTML_ADVANCE_TO('ScriptDataDoubleEscaped');
            }
        } else if (isASCIIUpper(cc)) {
            this.bufferCharacter(cc);
            this.temporaryBuffer.append(cc.toLowerCase());
            HTML_ADVANCE_TO('ScriptDataDoubleEscapeEnd');
        } else if (isASCIILower(cc)) {
            this.bufferCharacter(cc);
            this.temporaryBuffer.append(cc);
            HTML_ADVANCE_TO('ScriptDataDoubleEscapeEnd');
        } else {
            HTML_RECONSUME_IN('ScriptDataDoubleEscaped');
        }
        break;
        /* END_STATE */

    case ('BeforeAttributeName') :
        if (this.isWhiteSpace(cc)) {
            HTML_ADVANCE_TO('BeforeAttributeName');
        } else if (cc == '/') {
            HTML_ADVANCE_TO('SelfClosingStartTag');
        } else if (cc == '>') {
            return emitAndResumeIn('Data');
        } else if (this.usePreHTML5ParserQuirks && cc == '<') {
            return emitAndReconsumeIn('Data');
        } else if (isASCIIUpper(cc)) {
            this.token.addNewAttribute();
            this.token.beginAttributeName(this.source.numberOfCharactersConsumed());
            this.token.appendToAttributeName(cc.toLowerCase());
            HTML_ADVANCE_TO('AttributeName');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            HTML_RECONSUME_IN('Data');
        } else {
            if (cc == '"' || cc == '\'' || cc == '<' || cc == '=')
                this.parseError();
            this.token.addNewAttribute();
            this.token.beginAttributeName(this.source.numberOfCharactersConsumed());
            this.token.appendToAttributeName(cc);
            HTML_ADVANCE_TO('AttributeName');
        }
        break;
        /* END_STATE */

    case ('AttributeName') :
        if (this.isWhiteSpace(cc)) {
            this.token.endAttributeName(this.source.numberOfCharactersConsumed());
            HTML_ADVANCE_TO('AfterAttributeName');
        } else if (cc == '/') {
            this.token.endAttributeName(this.source.numberOfCharactersConsumed());
            HTML_ADVANCE_TO('SelfClosingStartTag');
        } else if (cc == '=') {
            this.token.endAttributeName(this.source.numberOfCharactersConsumed());
            HTML_ADVANCE_TO('BeforeAttributeValue');
        } else if (cc == '>') {
            this.token.endAttributeName(this.source.numberOfCharactersConsumed());
            return emitAndResumeIn('Data');
        } else if (this.usePreHTML5ParserQuirks && cc == '<') {
            this.token.endAttributeName(this.source.numberOfCharactersConsumed());
            return emitAndReconsumeIn('Data');
        } else if (isASCIIUpper(cc)) {
            this.token.appendToAttributeName(cc.toLowerCase());
            HTML_ADVANCE_TO('AttributeName');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.endAttributeName(this.source.numberOfCharactersConsumed());
            HTML_RECONSUME_IN('Data');
        } else {
            if (cc == '"' || cc == '\'' || cc == '<' || cc == '=')
                this.parseError();
            this.token.appendToAttributeName(cc);
            HTML_ADVANCE_TO('AttributeName');
        }
        break;
        /* END_STATE */

    case ('AfterAttributeName') :
        if (this.isWhiteSpace(cc)) {
            HTML_ADVANCE_TO('AfterAttributeName');
        } else if (cc == '/') {
            HTML_ADVANCE_TO('SelfClosingStartTag');
        } else if (cc == '=') {
            HTML_ADVANCE_TO('BeforeAttributeValue');
        } else if (cc == '>') {
            return emitAndResumeIn('Data');
        } else if (this.usePreHTML5ParserQuirks && cc == '<') {
            return emitAndReconsumeIn('Data');
        } else if (isASCIIUpper(cc)) {
            this.token.addNewAttribute();
            this.token.beginAttributeName(this.source.numberOfCharactersConsumed());
            this.token.appendToAttributeName(cc.toLowerCase());
            HTML_ADVANCE_TO('AttributeName');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            HTML_RECONSUME_IN('Data');
        } else {
            if (cc == '"' || cc == '\'' || cc == '<')
                this.parseError();
            this.token.addNewAttribute();
            this.token.beginAttributeName(this.source.numberOfCharactersConsumed());
            this.token.appendToAttributeName(cc);
            HTML_ADVANCE_TO('AttributeName');
        }
        break;
        /* END_STATE */

    case ('BeforeAttributeValue') :
        if (this.isWhiteSpace(cc)) {
            HTML_ADVANCE_TO('BeforeAttributeValue');
        } else if (cc == '"') {
            this.token.beginAttributeValue(this.source.numberOfCharactersConsumed() + 1);
            HTML_ADVANCE_TO('AttributeValueDoubleQuoted');
        } else if (cc == '&') {
            this.token.beginAttributeValue(this.source.numberOfCharactersConsumed());
            HTML_RECONSUME_IN('AttributeValueUnquoted');
        } else if (cc == '\'') {
            this.token.beginAttributeValue(this.source.numberOfCharactersConsumed() + 1);
            HTML_ADVANCE_TO('AttributeValueSingleQuoted');
        } else if (cc == '>') {
            this.parseError();
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            HTML_RECONSUME_IN('Data');
        } else {
            if (cc == '<' || cc == '=' || cc == '`')
                this.parseError();
            this.token.beginAttributeValue(this.source.numberOfCharactersConsumed());
            this.token.appendToAttributeValue(cc);
            HTML_ADVANCE_TO('AttributeValueUnquoted');
        }
        break;
        /* END_STATE */

    case ('AttributeValueDoubleQuoted') :
        if (cc == '"') {
            this.token.endAttributeValue(this.source.numberOfCharactersConsumed());
            HTML_ADVANCE_TO('AfterAttributeValueQuoted');
        } else if (cc == '&') {
            this.additionalAllowedCharacter = '"';
            HTML_ADVANCE_TO('CharacterReferenceInAttributeValue');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.endAttributeValue(this.source.numberOfCharactersConsumed());
            HTML_RECONSUME_IN('Data');
        } else {
            this.token.appendToAttributeValue(cc);
            HTML_ADVANCE_TO('AttributeValueDoubleQuoted');
        }
        break;
        /* END_STATE */

    case ('AttributeValueSingleQuoted') :
        if (cc == '\'') {
            this.token.endAttributeValue(this.source.numberOfCharactersConsumed());
            HTML_ADVANCE_TO('AfterAttributeValueQuoted');
        } else if (cc == '&') {
            this.additionalAllowedCharacter = '\'';
            HTML_ADVANCE_TO('CharacterReferenceInAttributeValue');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.endAttributeValue(this.source.numberOfCharactersConsumed());
            HTML_RECONSUME_IN('Data');
        } else {
            this.token.appendToAttributeValue(cc);
            HTML_ADVANCE_TO('AttributeValueSingleQuoted');
        }
        break;
        /* END_STATE */

    case ('AttributeValueUnquoted') :
        if (this.isWhiteSpace(cc)) {
            this.token.endAttributeValue(this.source.numberOfCharactersConsumed());
            HTML_ADVANCE_TO('BeforeAttributeName');
        } else if (cc == '&') {
            this.additionalAllowedCharacter = '>';
            HTML_ADVANCE_TO('CharacterReferenceInAttributeValue');
        } else if (cc == '>') {
            this.token.endAttributeValue(this.source.numberOfCharactersConsumed());
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.endAttributeValue(this.source.numberOfCharactersConsumed());
            HTML_RECONSUME_IN('Data');
        } else {
            if (cc == '"' || cc == '\'' || cc == '<' || cc == '=' || cc == '`')
                this.parseError();
            this.token.appendToAttributeValue(cc);
            HTML_ADVANCE_TO('AttributeValueUnquoted');
        }
        break;
        /* END_STATE */

    case ('CharacterReferenceInAttributeValue') :
        var notEnoughCharacters = false,
            decodedEntity,
            i;
        success = consumeHTMLEntity(decodedEntity, notEnoughCharacters, this.additionalAllowedCharacter);
        if (notEnoughCharacters) {
            return this.haveBufferedCharacterToken();
        }

        if (!success) {
            assert.ok(decodedEntity.isEmpty());
            this.token.appendToAttributeValue('&');
        } else {
            for (i = 0; i < decodedEntity.length(); ++i) {
                this.token.appendToAttributeValue(decodedEntity[i]);
            }
        }
        // We're supposed to switch back to the attribute value state that
        // we were in when we were switched into this state. Rather than
        // keeping track of this explictly, we observe that the previous
        // state can be determined by this.additionalAllowedCharacter.
        if (this.additionalAllowedCharacter == '"') {
            HTML_SWITCH_TO('AttributeValueDoubleQuoted');
        } else if (this.additionalAllowedCharacter == '\'') {
            HTML_SWITCH_TO('AttributeValueSingleQuoted');
        } else if (this.additionalAllowedCharacter == '>') {
            HTML_SWITCH_TO('AttributeValueUnquoted');
        } else {
            assert.ok(false);_NOT_REACHED();
        }
        break;
        /* END_STATE */

    case ('AfterAttributeValueQuoted') :
        if (this.isWhiteSpace(cc)) {
            HTML_ADVANCE_TO('BeforeAttributeName');
        } else if (cc == '/') {
            HTML_ADVANCE_TO('SelfClosingStartTag');
        } else if (cc == '>') {
            return emitAndResumeIn('Data');
        } else if (this.usePreHTML5ParserQuirks && cc == '<') {
            return emitAndReconsumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            HTML_RECONSUME_IN('Data');
        } else {
            this.parseError();
            HTML_RECONSUME_IN('BeforeAttributeName');
        }
        break;
        /* END_STATE */

    case ('SelfClosingStartTag') :
        if (cc == '>') {
            this.token.setSelfClosing();
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            HTML_RECONSUME_IN('Data');
        } else {
            this.parseError();
            HTML_RECONSUME_IN('BeforeAttributeName');
        }
        break;
        /* END_STATE */

    case ('BogusComment') :
        this.token.beginComment();
        HTML_RECONSUME_IN('ContinueBogusComment');
        break;
        /* END_STATE */

    case ('ContinueBogusComment') :
        if (cc == '>') {
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            return emitAndReconsumeIn('Data');
        } else {
            this.token.appendToComment(cc);
            HTML_ADVANCE_TO('ContinueBogusComment');
        }
        break;
        /* END_STATE */

    case ('MarkupDeclarationOpen') :
        if (cc == '-') {
            result = this.source.lookAhead('--');
            if (result == SegmentedString.DidMatch) {
                this.source.advanceAndASSERT('-');
                this.source.advanceAndASSERT('-');
                this.token.beginComment();
                HTML_SWITCH_TO('CommentStart');
            } else if (result == SegmentedString.NotEnoughCharacters)
            return this.haveBufferedCharacterToken();
        } else if (cc == 'D' || cc == 'd') {
            result = this.source.lookAheadIgnoringCase("doctype");
            if (result == SegmentedString.DidMatch) {
                advanceStringAndASSERTIgnoringCase("doctype");
                HTML_SWITCH_TO('DOCTYPE');
            } else if (result == SegmentedString.NotEnoughCharacters) {
                return this.haveBufferedCharacterToken();
            }
        } else if (cc == '[' && shouldAllowCDATA()) {
            result = this.source.lookAhead("[CDATA[");
            if (result == SegmentedString.DidMatch) {
                advanceStringAndASSERT("[CDATA[");
                HTML_SWITCH_TO('CDATASection');
            } else if (result == SegmentedString.NotEnoughCharacters) {
                return this.haveBufferedCharacterToken();
            }
        }
        this.parseError();
        HTML_RECONSUME_IN('BogusComment');
        break;
        /* END_STATE */

    case ('CommentStart') :
        if (cc == '-') {
            HTML_ADVANCE_TO('CommentStartDash');
        } else if (cc == '>') {
            this.parseError();
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            return emitAndReconsumeIn('Data');
        } else {
            this.token.appendToComment(cc);
            HTML_ADVANCE_TO('Comment');
        }
        break;
        /* END_STATE */

    case ('CommentStartDash') :
        if (cc == '-') {
            HTML_ADVANCE_TO('CommentEnd');
        } else if (cc == '>') {
            this.parseError();
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            return emitAndReconsumeIn('Data');
        } else {
            this.token.appendToComment('-');
            this.token.appendToComment(cc);
            HTML_ADVANCE_TO('Comment');
        }
        break;
        /* END_STATE */

    case ('Comment') :
        if (cc == '-') {
            HTML_ADVANCE_TO('CommentEndDash');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            return emitAndReconsumeIn('Data');
        } else {
            this.token.appendToComment(cc);
            HTML_ADVANCE_TO('Comment');
        }
        break;
        /* END_STATE */

    case ('CommentEndDash') :
        if (cc == '-') {
            HTML_ADVANCE_TO('CommentEnd');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            return emitAndReconsumeIn('Data');
        } else {
            this.token.appendToComment('-');
            this.token.appendToComment(cc);
            HTML_ADVANCE_TO('Comment');
        }
        break;
        /* END_STATE */

    case ('CommentEnd') :
        if (cc == '>') {
            return emitAndResumeIn('Data');
        } else if (cc == '!') {
            this.parseError();
            HTML_ADVANCE_TO('CommentEndBang');
        } else if (cc == '-') {
            this.parseError();
            this.token.appendToComment('-');
            HTML_ADVANCE_TO('CommentEnd');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            return emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.token.appendToComment('-');
            this.token.appendToComment('-');
            this.token.appendToComment(cc);
            HTML_ADVANCE_TO('Comment');
        }
        break;
        /* END_STATE */

    case ('CommentEndBang') :
        if (cc == '-') {
            this.token.appendToComment('-');
            this.token.appendToComment('-');
            this.token.appendToComment('!');
            HTML_ADVANCE_TO('CommentEndDash');
        } else if (cc == '>') {
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            return emitAndReconsumeIn('Data');
        } else {
            this.token.appendToComment('-');
            this.token.appendToComment('-');
            this.token.appendToComment('!');
            this.token.appendToComment(cc);
            HTML_ADVANCE_TO('Comment');
        }
        break;
        /* END_STATE */

    case ('DOCTYPE') :
        if (this.isWhiteSpace(cc)) {
            HTML_ADVANCE_TO('BeforeDOCTYPEName');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.beginDOCTYPE();
            this.token.setForceQuirks();
            return emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            HTML_RECONSUME_IN('BeforeDOCTYPEName');
        }
        break;
        /* END_STATE */

    case ('BeforeDOCTYPEName') :
        if (this.isWhiteSpace(cc)) {
            HTML_ADVANCE_TO('BeforeDOCTYPEName');
        } else if (isASCIIUpper(cc)) {
            this.token.beginDOCTYPE(cc.toLowerCase());
            HTML_ADVANCE_TO('DOCTYPEName');
        } else if (cc == '>') {
            this.parseError();
            this.token.beginDOCTYPE();
            this.token.setForceQuirks();
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.beginDOCTYPE();
            this.token.setForceQuirks();
            return emitAndReconsumeIn('Data');
        } else {
            this.token.beginDOCTYPE(cc);
            HTML_ADVANCE_TO('DOCTYPEName');
        }
        break;
        /* END_STATE */

    case ('DOCTYPEName') :
        if (this.isWhiteSpace(cc)) {
            HTML_ADVANCE_TO('AfterDOCTYPEName');
        } else if (cc == '>') {
            return emitAndResumeIn('Data');
        } else if (isASCIIUpper(cc)) {
            this.token.appendToName(cc.toLowerCase());
            HTML_ADVANCE_TO('DOCTYPEName');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndReconsumeIn('Data');
        } else {
            this.token.appendToName(cc);
            HTML_ADVANCE_TO('DOCTYPEName');
        }
        break;
        /* END_STATE */

    case ('AfterDOCTYPEName') :
        if (this.isWhiteSpace(cc)) {
            HTML_ADVANCE_TO('AfterDOCTYPEName');
        } else if (cc == '>') {
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndReconsumeIn('Data');
        } else {
            if (cc == 'P' || cc == 'p') {
                result = this.source.lookAheadIgnoringCase("public");
                if (result == SegmentedString.DidMatch) {
                    advanceStringAndASSERTIgnoringCase("public");
                    HTML_SWITCH_TO('AfterDOCTYPEPublicKeyword');
                } else if (result == SegmentedString.NotEnoughCharacters) {
                    return this.haveBufferedCharacterToken();
                }
            } else if (cc == 'S' || cc == 's') {
                result = this.source.lookAheadIgnoringCase("system");
                if (result == SegmentedString.DidMatch) {
                    advanceStringAndASSERTIgnoringCase("system");
                    HTML_SWITCH_TO('AfterDOCTYPESystemKeyword');
                } else if (result == SegmentedString.NotEnoughCharacters) {
                    return this.haveBufferedCharacterToken();
                }
            }
            this.parseError();
            this.token.setForceQuirks();
            HTML_ADVANCE_TO('BogusDOCTYPE');
        }
        break;
        /* END_STATE */

    case ('AfterDOCTYPEPublicKeyword') :
        if (this.isWhiteSpace(cc)) {
            HTML_ADVANCE_TO('BeforeDOCTYPEPublicIdentifier');
        } else if (cc == '"') {
            this.parseError();
            this.token.setPublicIdentifierToEmptyString();
            HTML_ADVANCE_TO('DOCTYPEPublicIdentifierDoubleQuoted');
        } else if (cc == '\'') {
            this.parseError();
            this.token.setPublicIdentifierToEmptyString();
            HTML_ADVANCE_TO('DOCTYPEPublicIdentifierSingleQuoted');
        } else if (cc == '>') {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.token.setForceQuirks();
            HTML_ADVANCE_TO('BogusDOCTYPE');
        }
        break;
        /* END_STATE */

    case ('BeforeDOCTYPEPublicIdentifier') :
        if (this.isWhiteSpace(cc)) {
            HTML_ADVANCE_TO('BeforeDOCTYPEPublicIdentifier');
        } else if (cc == '"') {
            this.token.setPublicIdentifierToEmptyString();
            HTML_ADVANCE_TO('DOCTYPEPublicIdentifierDoubleQuoted');
        } else if (cc == '\'') {
            this.token.setPublicIdentifierToEmptyString();
            HTML_ADVANCE_TO('DOCTYPEPublicIdentifierSingleQuoted');
        } else if (cc == '>') {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.token.setForceQuirks();
            HTML_ADVANCE_TO('BogusDOCTYPE');
        }
        break;
        /* END_STATE */

    case ('DOCTYPEPublicIdentifierDoubleQuoted') :
        if (cc == '"') {
            HTML_ADVANCE_TO('AfterDOCTYPEPublicIdentifier');
        } else if (cc == '>') {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndReconsumeIn('Data');
        } else {
            this.token.appendToPublicIdentifier(cc);
            HTML_ADVANCE_TO('DOCTYPEPublicIdentifierDoubleQuoted');
        }
        break;
        /* END_STATE */

    case ('DOCTYPEPublicIdentifierSingleQuoted') :
        if (cc == '\'') {
            HTML_ADVANCE_TO('AfterDOCTYPEPublicIdentifier');
        } else if (cc == '>') {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndReconsumeIn('Data');
        } else {
            this.token.appendToPublicIdentifier(cc);
            HTML_ADVANCE_TO('DOCTYPEPublicIdentifierSingleQuoted');
        }
        break;
        /* END_STATE */

    case ('AfterDOCTYPEPublicIdentifier') :
        if (this.isWhiteSpace(cc)) {
            HTML_ADVANCE_TO('BetweenDOCTYPEPublicAndSystemIdentifiers');
        } else if (cc == '>') {
            return emitAndResumeIn('Data');
        } else if (cc == '"') {
            this.parseError();
            this.token.setSystemIdentifierToEmptyString();
            HTML_ADVANCE_TO('DOCTYPESystemIdentifierDoubleQuoted');
        } else if (cc == '\'') {
            this.parseError();
            this.token.setSystemIdentifierToEmptyString();
            HTML_ADVANCE_TO('DOCTYPESystemIdentifierSingleQuoted');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.token.setForceQuirks();
            HTML_ADVANCE_TO('BogusDOCTYPE');
        }
        break;
        /* END_STATE */

    case ('BetweenDOCTYPEPublicAndSystemIdentifiers') :
        if (this.isWhiteSpace(cc)) {
            HTML_ADVANCE_TO('BetweenDOCTYPEPublicAndSystemIdentifiers');
        } else if (cc == '>') {
            return emitAndResumeIn('Data');
        } else if (cc == '"') {
            this.token.setSystemIdentifierToEmptyString();
            HTML_ADVANCE_TO('DOCTYPESystemIdentifierDoubleQuoted');
        } else if (cc == '\'') {
            this.token.setSystemIdentifierToEmptyString();
            HTML_ADVANCE_TO('DOCTYPESystemIdentifierSingleQuoted');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.token.setForceQuirks();
            HTML_ADVANCE_TO('BogusDOCTYPE');
        }
        break;
        /* END_STATE */

    case ('AfterDOCTYPESystemKeyword') :
        if (this.isWhiteSpace(cc)) {
            HTML_ADVANCE_TO('BeforeDOCTYPESystemIdentifier');
        } else if (cc == '"') {
            this.parseError();
            this.token.setSystemIdentifierToEmptyString();
            HTML_ADVANCE_TO('DOCTYPESystemIdentifierDoubleQuoted');
        } else if (cc == '\'') {
            this.parseError();
            this.token.setSystemIdentifierToEmptyString();
            HTML_ADVANCE_TO('DOCTYPESystemIdentifierSingleQuoted');
        } else if (cc == '>') {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.token.setForceQuirks();
            HTML_ADVANCE_TO('BogusDOCTYPE');
        }
        break;
        /* END_STATE */

    case ('BeforeDOCTYPESystemIdentifier') :
        if (this.isWhiteSpace(cc)) {
            HTML_ADVANCE_TO('BeforeDOCTYPESystemIdentifier');
        } else if (cc == '"') {
            this.token.setSystemIdentifierToEmptyString();
            HTML_ADVANCE_TO('DOCTYPESystemIdentifierDoubleQuoted');
        } else if (cc == '\'') {
            this.token.setSystemIdentifierToEmptyString();
            HTML_ADVANCE_TO('DOCTYPESystemIdentifierSingleQuoted');
        } else if (cc == '>') {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            this.token.setForceQuirks();
            HTML_ADVANCE_TO('BogusDOCTYPE');
        }
        break;
        /* END_STATE */

    case ('DOCTYPESystemIdentifierDoubleQuoted') :
        if (cc == '"') {
            HTML_ADVANCE_TO('AfterDOCTYPESystemIdentifier');
        } else if (cc == '>') {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndReconsumeIn('Data');
        } else {
            this.token.appendToSystemIdentifier(cc);
            HTML_ADVANCE_TO('DOCTYPESystemIdentifierDoubleQuoted');
        }
        break;
        /* END_STATE */

    case ('DOCTYPESystemIdentifierSingleQuoted') :
        if (cc == '\'') {
            HTML_ADVANCE_TO('AfterDOCTYPESystemIdentifier');
        } else if (cc == '>') {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndReconsumeIn('Data');
        } else {
            this.token.appendToSystemIdentifier(cc);
            HTML_ADVANCE_TO('DOCTYPESystemIdentifierSingleQuoted');
        }
        break;
        /* END_STATE */

    case ('AfterDOCTYPESystemIdentifier') :
        if (this.isWhiteSpace(cc)) {
            HTML_ADVANCE_TO('AfterDOCTYPESystemIdentifier');
        } else if (cc == '>') {
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            this.parseError();
            this.token.setForceQuirks();
            return emitAndReconsumeIn('Data');
        } else {
            this.parseError();
            HTML_ADVANCE_TO('BogusDOCTYPE');
        }
        break;
        /* END_STATE */

    case ('BogusDOCTYPE') :
        if (cc == '>') {
            return emitAndResumeIn('Data');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            return emitAndReconsumeIn('Data');
        } else {
            HTML_ADVANCE_TO('BogusDOCTYPE');
        }
        break;
        /* END_STATE */

    case ('CDATASection') :
        if (cc == ']') {
            HTML_ADVANCE_TO('CDATASectionRightSquareBracket');
        } else if (cc == InputStreamPreprocessor.endOfFileMarker) {
            HTML_RECONSUME_IN('Data');
        } else {
            this.bufferCharacter(cc);
            HTML_ADVANCE_TO('CDATASection');
        }
        break;
        /* END_STATE */

    case ('CDATASectionRightSquareBracket') :
        if (cc == ']') {
            HTML_ADVANCE_TO('CDATASectionDoubleRightSquareBracket');
        } else {
            this.bufferCharacter(']');
            HTML_RECONSUME_IN('CDATASection');
        }
        break;

    case ('CDATASectionDoubleRightSquareBracket') :
        if (cc == '>') {
            HTML_ADVANCE_TO('Data');
        } else {
            this.bufferCharacter(']');
            this.bufferCharacter(']');
            HTML_RECONSUME_IN('CDATASection');
        }
        break;
        /* END_STATE */
    }
    assert.ok(false);_NOT_REACHED();
    return false;
};

