/*
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50, eqeq: true, white: true */
/*global define, $, brackets, Mustache */

define(function (require, exports, module) {
	'use strict';
	console.log("INITIALIZING HTML FORMAT EXTENSION");
	
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	// BRACKETS OBJECTS
	//--------------------------------------------------------------------------------------------------------------------------------------------//
    var Commands = brackets.getModule("command/Commands");
	var CommandManager = brackets.getModule("command/CommandManager");
	var Menus = brackets.getModule("command/Menus");
	var DocumentManager = brackets.getModule("document/DocumentManager");
	var EditorManager = brackets.getModule("editor/EditorManager");
	var KeyBindingManager = brackets.getModule("command/KeyBindingManager");
	var MainViewManager = brackets.getModule("view/MainViewManager");
	var FileUtils = brackets.getModule("file/FileUtils");
	var PreferencesManager = brackets.getModule("preferences/PreferencesManager");
	var Dialogs = brackets.getModule("widgets/Dialogs");
	var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
	var Strings = require("strings");
	var PreferenceStrings = require("preferenceStrings");
	var AdditionalPrefStrings = require("additionalPrefStrings");
	
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	// CONTSTANTS
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	
	var COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat";
	
	//------------------------------------------------------------------------------------------------------------//
	var HTML_FORMAT_MENU_COMMAND_ID = COMMAND_ID + "." + "htmlFormatMenu";
	
	//------------------------------------------------------------------------------------------------------------//
	var BOLD_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.BOLD_TAG;
	var BOLD_STYLE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.BOLD_STYLE;
	var ITALIC_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.ITALIC_TAG;
	var ITALIC_STYLE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.ITALIC_STYLE;
	var UNDERLINE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.UNDERLINE_TAG;
	var UNDERLINE_STYLE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.UNDERLINE_STYLE;
	
	//------------------------------------------------------------------------------------------------------------//
	var SPAN_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.SPAN_TAG;
	var DIV_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.DIV_TAG;
	var HEADER_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.HEADER_TAG;
	var NAV_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.NAV_TAG;
	var ARTICLE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.ARTICLE_TAG;
	var SECTION_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.SECTION_TAG;
	var ASIDE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.ASIDE_TAG;
	var FOOTER_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.FOOTER_TAG;
	
	//------------------------------------------------------------------------------------------------------------//
	var STRIKE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.STRIKE_TAG;
	var STRIKE_STYLE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.STRIKE_STYLE;
	var TELETYPE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.TELETYPE_TAG;
	var TELETYPE_STYLE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.TELETYPE_STYLE;
	
	//------------------------------------------------------------------------------------------------------------//
	var CODE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.CODE_TAG;
	var VARIABLE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.VARIABLE_TAG;
	var SAMPLE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.SAMPLE_TAG;
	var KEYBOARD_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.KEYBOARD_TAG;
	
	//------------------------------------------------------------------------------------------------------------//
	var CITATION_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.CITATION_TAG;
	var DEFINITION_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.DEFINITION_TAG;
	var DELETED_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.DELETED_TAG;
	var INSERTED_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.INSERTED_TAG;
	
	//------------------------------------------------------------------------------------------------------------//
	var INSERT_TAG_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.EMPTY_TAG;
	var PREFERENCE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.PREFERENCES;
	
	
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	// VARIABLES
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	
	/**
	* HTML for rendering the preference options
	* @private
	*/
	var _preferencePanel = require("text!preferencePanel.html");
	
	/**
	* Preferences for managing keyboard shortcuts.
	* @private
	*/
	var _preferences = PreferencesManager.getExtensionPrefs(COMMAND_ID + "." + PreferenceStrings.PREFERENCES);
	
	/**
	* Key/value array of all current preference options. Used for checking against when making changes to the current preferences
	* @private
	*/
	var _currentPrefs = {};
	
	/**
	* Indicates the OS platform. Used for generating keyboard shortcuts.
	* @private
	*/
	var _platform = (navigator.appVersion.indexOf("Mac") !== -1) ? "mac" : "win";
	
	/**
	* Used for detecting the file type to know if the file menu should appear and if hotkeys should work
	* @private
	*/
	var _fileExtension = "";
	
	/**
	* Menu bar containing all the format options.
	* @type {Menu}
	* @private
	*/
	var _htmlFormatMenu = null;
	
	/**
	* Array of all the commands added to the menu bar.
	* @type {array}
	* @private
	*/
	var _commands = [];
	
	/**
	* Current document being editted.
	* @type {Document}
	* @private
	*/
	var _currentDoc;
	
	/**
	* Current position of the cursor in the document being editted.
	* @type {object}
	* @private
	*/
	var _currentPos;
	
	/**
	* Represents the opening and closing tags of the insert empty tag action.
	* @property {object} open
	* @property {object} open.start
	* @property {number} open.start.line
	* @property {number} open.start.ch
	* @property {object} open.end
	* @property {number} open.end.line
	* @property {number} open.end.ch
	* @property {object} close
	* @property {object} close.start
	* @property {number} close.start.line
	* @property {number} close.start.ch
	* @property {object} close.end
	* @property {number} close.end.line
	* @property {number} close.end.ch
	* @private
	*/
	var _emptyTagPos = {open:{start:{line:0, ch:0}, end:{line:0, ch:0}}, close:{start:{line:0, ch:0}, end:{line:0, ch:0}}};
	
	/**
	* Current full editor in use.
	* @type {Editor}
	* @private
	*/
	var _editor;
	
	/**
	* Currently highlighted copy
	* @type {object}
	* @private
	*/
	var _selection;
	
	/**
	* The character length of the currently highlighted text
	* @type {number}
	* @private
	*/
	var _lng = 0;
	
	/**
	* Determines whether or not the <strong> tag is used in place of <b> when adding a bold tag
	* @type {boolean}
	* @private
	*/
	var _boldUsesStrong = false;
	
	/**
	* Determines whether or not the <em> tag is used in place of <i> when adding an italic tag
	* @type {boolean}
	* @private
	*/
	var _italicUsesEm = false;
	
	/**
	* 
	* @type {boolean}
	* @private
	*/
	var _addRightClick = false;
	
	/**
	* Used for keeping track of duplicate keyboard shortcuts. Prevents Save button from working if true.
	* @private
	*/
	var _duplicateShortcuts = false;
	
	/**
	* @private
	*/
	var _defaultTagStyleShortcut = [null, null, null, null, ""];
	
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	// PREFERENCES
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	
	ExtensionUtils.loadStyleSheet(module, "preferencePanel.css");
	var _control = (_platform === "mac") ? "Cmd" : "Ctrl";
	
	// command, shift, alt, control, character
	if (_preferences.get(PreferenceStrings.BOLD_TAG) === undefined) {
		_preferences.set(PreferenceStrings.BOLD_TAG, [_control, null, null, null, "B"]);
		_preferences.set(PreferenceStrings.BOLD_STYLE, [_control, "Shift", null, null, "B"]);
		_preferences.set(PreferenceStrings.ITALIC_TAG, [_control, null, null, null, "I"]);
		_preferences.set(PreferenceStrings.ITALIC_STYLE, [_control, "Shift", null, null, "I"]);
		_preferences.set(PreferenceStrings.UNDERLINE_TAG, [_control, null, null, null, "U"]);
		_preferences.set(PreferenceStrings.UNDERLINE_STYLE, [_control, "Shift", null, null, "U"]);
		_preferences.set(PreferenceStrings.EMPTY_TAG, [_control, null, null, null, "T"]);
		_preferences.set(PreferenceStrings.PREFERENCES, [_control, "Shift", null, null, ","]);
	}
	
	// set any tag/style input to have the default shortcut if it is undefined
	// generate list of keyboard shortcuts for HTML Format Preferences screen
	var prefString = "";
	var prefStringProp;
	for (prefStringProp in PreferenceStrings) {
		if (PreferenceStrings.hasOwnProperty(prefStringProp)) {
			if (_preferences.get(PreferenceStrings[prefStringProp]) === undefined) {
				_preferences.set(PreferenceStrings[prefStringProp], _defaultTagStyleShortcut);
			}
			
			prefString +=	"<tr>";
			prefString +=		"<td>";
			prefString +=			"<div id='" + PreferenceStrings[prefStringProp] + "' class='shortcut'>";
			prefString +=				"<div class='shortcut_label'>{{LABEL_" + prefStringProp + "_SHORTCUT}}:</div>";
			prefString +=				"<div class='shortcut_modifiers'>";
			if (_platform === "mac") {
				prefString +=				"<label><input class='shortcut_modifier_ctrlCmd' type='checkbox' title='{{TITLE_CTRL}}' />{{MODIFIER_CMD}}</label>+";
			} else {
				prefString +=				"<label><input class='shortcut_modifier_ctrlCmd' type='checkbox' title='{{TITLE_CTRL}}' />{{MODIFIER_CONTROL_CMD}}</label>+";
			}
			prefString +=					"<label><input class='shortcut_modifier_shift' type='checkbox' title='{{TITLE_SHIFT}}' />{{MODIFIER_SHIFT}}</label>+";
			prefString +=					"<label><input class='shortcut_modifier_alt' type='checkbox' title='{{TITLE_ALT}}' />{{MODIFIER_ALT}}</label>+";
			if (_platform === "mac") {
				prefString +=				"<label><input class='shortcut_modifier_ctrl' type='checkbox' title='{{TITLE_CTRL}}' />{{MODIFIER_CONTROL}}</label>+";
			}
			prefString +=					"<input class='shortcut_modifier_char' type='text' maxlength='1' size='1' title='{{TITLE_CHARACTER}}' />";
			prefString +=				"</div>";
			prefString +=			"</div>";
			prefString +=		"</td>";
			prefString +=	"</tr>";
		}
	}
	
	_preferencePanel = _preferencePanel.replace("<tr id=\"shortcuts\"></tr>", prefString);
	
	var _preferenceHTML = Mustache.render(_preferencePanel, Strings);
	
	if (_preferences.get(AdditionalPrefStrings.BOLD_USES_STRONG) === undefined) {
		_preferences.set(AdditionalPrefStrings.BOLD_USES_STRONG, false);
	}
	else {
		_boldUsesStrong = _preferences.get(AdditionalPrefStrings.BOLD_USES_STRONG);
	}
	if (_preferences.get(AdditionalPrefStrings.ITALIC_USES_EM) === undefined) {
		_preferences.set(AdditionalPrefStrings.ITALIC_USES_EM, false);
	}
	else {
		_italicUsesEm = _preferences.get(AdditionalPrefStrings.ITALIC_USES_EM);
	}
	
	if (_preferences.get(AdditionalPrefStrings.ADD_RIGHT_CLICK) === undefined) {
		_preferences.set(AdditionalPrefStrings.ADD_RIGHT_CLICK, false);
	}
	else {
		_addRightClick = _preferences.get(AdditionalPrefStrings.ADD_RIGHT_CLICK);
	}
	
	
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	// FUNCTIONS
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Generates the style needed based on the parameter
	* @private
	*/
	function _getStyle(style) {
		var _style = "";
		if (style === "bold" || style === "b" || style === "strong") {
			_style = "font-weight:bold;";
		}
		else if (style === "italic" || style === "i" || style === "em") {
			_style = "font-style:italic;";
		}
		else if (style === "underline" || style === "u") {
			_style = "text-decoration:underline;";
		}
		else if (style === "strikethrough" || style === "s") {
			_style = "text-decoration:line-through;";
		}
		else if (style === "monospace" || style === "tt") {
			_style = "font-family:'Lucida Console', monospace;";
		}
		return _style;
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Checks if the cursor is within a style attribute. If it is, attempt to convert tag or style into inline style.
	* @private
	*/
	function _checkIfWithinInlineStyle(style) {
		var entireLine = _currentDoc.getLine(_editor.getCursorPos().line);
		var styles = [];
		var styleStart = 0;
		var styleEnd;
		var styleString = "";
		var closingQuote;
		var cursorPos = _editor.getCursorPos().ch;

		while (styleStart !== -1) {
			styleStart = entireLine.indexOf("style=", styleStart);

			if (styleStart !== -1) {
				closingQuote = entireLine.charAt(entireLine.indexOf("style=") + 6);// get quote type, single or double
				styleStart += 7;// offset to start within the style attribute
				styleEnd = entireLine.indexOf(closingQuote, styleStart);
				styleString = entireLine.substring(styleStart, styleEnd);
				styles.push({start:styleStart, end:styleEnd, style:styleString});
			}
		}

		while (styles.length !== 0) {
			if (cursorPos >= styles[styles.length-1].start && cursorPos <= styles[styles.length-1].end) {
				if (style.length !== 0) {
					var index = (cursorPos == styles[styles.length-1].start) ? styles[styles.length-1].start - 1 : -1;

					// if not -1, meaning cursor was at beginning of the style, add a space to the string after the ";"
					if (index !== -1) {
						style = style + " ";
					}

					// else the cursor is not at the beginning of the style attribute
					else {
						var styleMod = "";
						// set index to the last character of the styles
						index = (cursorPos == styles[styles.length-1].end) ? styles[styles.length-1].end - 1 : -1;

						// if index is -1, cursor was not at end of styles string. search for the closest ";" appearing before the cursor
						if (index === -1) {
							index = entireLine.lastIndexOf(";", cursorPos);
						}
						// cursor is at end of styles string and ";" was not detected at the end of the styles
						else if (entireLine.charAt(index) !== ";") {
							styleMod = ";";
						}

						// if index is -1, cursor was placed in middle of the first/only style
						if (index === -1 || index < styles[styles.length-1].start) {
							index = entireLine.indexOf(";", cursorPos);
						}

						// if index is -1, no ";" was found and you are a bad coder.
						if (index === -1 || index > styles[styles.length-1].end) {
							index = styles[styles.length-1].start-1;
						}

						// if index is not at the start, set style equal to styleMod + space + style, else set style equal to style + space
						if (index !== styles[styles.length-1].start-1) {
							style = styleMod + " " + style;
						}
						else {
							style = style + " ";
						}
					}

					index += 1;
					_currentDoc.replaceRange(style, {line:_editor.getCursorPos().line, ch:index});
				}
				
				return false;
			}
			else {
				styles.pop();
			}
		}
		
		return true;
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Generates an HTML tag based on the param received.
	* @param {string} style The HTML tag that should be generated
	* @private
	*/
	function _addTag(tag) {
		_currentDoc = DocumentManager.getCurrentDocument();
		_editor = EditorManager.getCurrentFullEditor();
		_lng = 0;// reset selected text length
		
		var canAdd = _checkIfWithinInlineStyle(_getStyle(tag));
		if (canAdd === true) {
			// if copy is highlighted, surround copy in HTML tag.
			if (_editor.hasSelection()) {
				_selection = _editor.getSelection();
				_lng = _selection.end.ch - _selection.start.ch;
				_currentDoc.replaceRange("<" + tag + ">" + _editor.getSelectedText() + "</" + tag + ">", _selection.start, _selection.end);
				_editor.setSelection({line: _selection.start.line, ch: (_selection.start.ch)}, _editor.getCursorPos());
			}

			// otherwise, insert HTML tag at cursor location and position the cursor in between the opening/closing tag
			else {
				_currentDoc.replaceRange("<" + tag + ">" + "</" + tag + ">", _editor.getCursorPos());
				_editor.setCursorPos(_editor.getCursorPos().line, _editor.getCursorPos().ch - tag.length - 3);
			}
		}
		
		// clear out variable references if not using the _insertEmptyTag() method.
		if (tag !== "") {
			_currentDoc = null;
			_editor = null;
			_selection = null;
			_lng = 0;
		}
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Generates an HTML <span> tag with a text style based on the param received.
	* @param {string} style The type of style that should be applied to the <span> tag being generated
	* @private
	*/
	function _addSpanStyle(style) {
		_currentDoc = DocumentManager.getCurrentDocument();
		_editor = EditorManager.getCurrentFullEditor();
		
		var canAdd = _checkIfWithinInlineStyle(_getStyle(style));
		
		if (canAdd === true) {
			var _tagStart = "<span style=";
			var _style = _getStyle(style);
			var _tagEnd = "</span>";

			if (_editor.hasSelection()) {
				_selection = _editor.getSelection();
				_currentDoc.replaceRange(_tagStart + "\"" + _style + "\"" + ">" + _editor.getSelectedText() + _tagEnd, _selection.start, _selection.end);
				_editor.setSelection({line: _selection.start.line, ch: (_selection.start.ch)}, _editor.getCursorPos());
			}
			else {
				_currentDoc.replaceRange(_tagStart + "\"" + _style + "\"" + ">" + _tagEnd, _editor.getCursorPos());
				_editor.setCursorPos(_editor.getCursorPos().line, _editor.getCursorPos().ch - _tagEnd.length);
			}
		}
		
		_currentDoc = null;
		_editor = null;
		_selection = null;
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Call _addTag() with a bold tag
	* @private
	*/
	function _boldTag() {
		_addTag((_boldUsesStrong === true) ? "strong" : "b");
	}
	/**
	* Call _addTag() with an italic tag
	* @private
	*/
	function _italicTag() {
		_addTag((_italicUsesEm === true) ? "em" : "i");
	}
	/**
	* Call _addTag() with an underline tag
	* @private
	*/
	function _underlineTag() {
		_addTag("u");
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Call _addTag() with a span tag
	* @private
	*/
	function _spanTag() {
		_addTag("span");
	}
	/**
	* Call _addTag() with a div tag
	* @private
	*/
	function _divTag() {
		_addTag("div");
	}
	/**
	* Call _addTag() with a header tag
	* @private
	*/
	function _headerTag() {
		_addTag("header");
	}
	/**
	* Call _addTag() with a nav tag
	* @private
	*/
	function _navTag() {
		_addTag("nav");
	}
	/**
	* Call _addTag() with a article tag
	* @private
	*/
	function _articleTag() {
		_addTag("article");
	}
	/**
	* Call _addTag() with a section tag
	* @private
	*/
	function _sectionTag() {
		_addTag("section");
	}
	/**
	* Call _addTag() with a aside tag
	* @private
	*/
	function _asideTag() {
		_addTag("aside");
	}
	/**
	* Call _addTag() with a footer tag
	* @private
	*/
	function _footerTag() {
		_addTag("footer");
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Call _addTag() with an strikethrough tag
	* @private
	*/
	function _strikeTag() {
		_addTag("s");
	}
	/**
	* Call _addTag() with an teletype tag
	* @private
	*/
	function _teletypeTag() {
		_addTag("tt");
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Call _addTag() with a code tag
	* @private
	*/
	function _codeTag() {
		_addTag("code");
	}
	/**
	* Call _addTag() with a variable tag
	* @private
	*/
	function _variableTag() {
		_addTag("var");
	}
	/**
	* Call _addTag() with an sample tag
	* @private
	*/
	function _sampleTag() {
		_addTag("samp");
	}
	/**
	* Call _addTag() with a keyboard tag
	* @private
	*/
	function _keyboardTag() {
		_addTag("kbd");
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Call _addTag() with a citation tag
	* @private
	*/
	function _citationTag() {
		_addTag("cite");
	}
	/**
	* Call _addTag() with a definition tag
	* @private
	*/
	function _definitionTag() {
		_addTag("dfn");
	}
	/**
	* Call _addTag() with a deleted tag
	* @private
	*/
	function _deletedTag() {
		_addTag("del");
	}
	/**
	* Call _addTag() with an inserted tag
	* @private
	*/
	function _insertedTag() {
		_addTag("ins");
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Call _addSpanStyle() with a bold style
	* @private
	*/
	function _boldStyle() {
		_addSpanStyle("bold");
	}
	/**
	* Call _addSpanStyle() with an italic style
	* @private
	*/
	function _italicStyle() {
		_addSpanStyle("italic");
	}
	/**
	* Call _addSpanStyle() with an underline style
	* @private
	*/
	function _underlineStyle() {
		_addSpanStyle("underline");
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Call _addSpanStyle() with an strikethrough style
	* @private
	*/
	function _strikeStyle() {
		_addSpanStyle("strikethrough");
	}
	/**
	* Call _addSpanStyle() with an monospace style
	* @private
	*/
	function _teletypeStyle() {
		_addSpanStyle("monospace");
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Removes the Keyboard event listener for the _insertEmptyTag() method once the "Enter" key has been pressed.
	* @private
	*/
	function _disposeAddTagListeners(listener) {
		_editor.off("cursorActivity");
		KeyBindingManager.removeGlobalKeydownHook(listener);
		_lng = 0;
		_currentDoc = null;
		_currentPos = null;
		_editor = null;
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Keyboard event listener function to capture key presses. Used for generating an open and close HTML tag. 
	* Pressing enter releases key press capture.
	* @private
	*/
	function _keyboardListener(event) {
		// get the current position of the cursor after the empty tag has been created
		_currentPos = _editor.getCursorPos();
		
		// If key pressed is the Enter key, empty tag action is complete so dispose of keyboard event.
		if (event.keyCode === 13 || event.keyCode === 27) {
			event.preventDefault();
			event.stopPropagation();
			_disposeAddTagListeners(_keyboardListener);
		}
		
		// if a key that was pressed is a letter, allow it to go through and duplicate it in the closing tag.
		else if (event.keyCode > 64 && event.keyCode < 91) {
			_currentDoc.replaceRange(String.fromCharCode(event.keyCode).toLowerCase(), {line: _currentPos.line, ch: _currentPos.ch + _lng + 3});
			_emptyTagPos.open.end = {line:_currentPos.line, ch:_emptyTagPos.open.start.ch + 3 + _lng};
			_emptyTagPos.close.start = {line:_currentPos.line, ch:_emptyTagPos.open.end.ch};
			_emptyTagPos.close.end = {line:_currentPos.line, ch:_emptyTagPos.close.start.ch + 4 + _lng};
				
			_lng += 1;
		}
		
		// If backspace deleting and the tag is just greater/less-than signs before backspace, stop empty tag action. Otherwise, delete character.
		else if (event.keyCode === 8) {
			if (_lng !== -1) {
				_currentDoc.replaceRange("", {line: _currentPos.line, ch: _currentPos.ch + _lng + 2}, {line: _currentPos.line, ch: _currentPos.ch + _lng + 3});
				_emptyTagPos.open.end = {line:_currentPos.line, ch:_emptyTagPos.open.start.ch + 1 + _lng};
				_emptyTagPos.close.start = {line:_currentPos.line, ch:_emptyTagPos.open.end.ch};
				_emptyTagPos.close.end = {line:_currentPos.line, ch:_emptyTagPos.close.start.ch + 2 + _lng};
			}
			else {
				_disposeAddTagListeners(_keyboardListener);
			}
			
			_lng -= 1;
		}
		
		// If forward deleting and the tag is just greater/less-than signs, stop empty tag action. Otherwise, delete character.
		else if (event.keyCode === 46) {
			if (_lng !== -1) {
				_currentDoc.replaceRange("", {line: _currentPos.line, ch: _currentPos.ch + _lng + 3}, {line: _currentPos.line, ch: _currentPos.ch + _lng + 4});
				_emptyTagPos.open.end = {line:_currentPos.line, ch:_emptyTagPos.open.start.ch + 2 + _lng};
				_emptyTagPos.close.start = {line:_currentPos.line, ch:_emptyTagPos.open.end.ch};
				_emptyTagPos.close.end = {line:_currentPos.line, ch:_emptyTagPos.close.start.ch + 2 + _lng};
			}
			else {
				_disposeAddTagListeners(_keyboardListener);
			}
			
			_lng -= 1;
		}
		
		// If the shortcut Control/Command + Z is pressed, end empty tag action.
		else if (event.keyCode === 90 && (event.ctrlKey || event.metaKey)) {
			_disposeAddTagListeners(_keyboardListener);
		}
		
		// If the key pressed is the up or down arrow key, end empty tag action.
		else if (event.keyCode === 38 || event.keyCode === 40) {
			_disposeAddTagListeners(_keyboardListener);
		}
		
		// If the key pressed is the left arrow key, check cursor position. if cursor position is outside the open tag, end empty tag action.
		// Because this is a keyDown event, we must check to see what the character behind of the cursor currently is
		else if (event.keyCode === 37 && _currentDoc.getRange({line:_currentPos.line, ch:_currentPos.ch - 1}, _currentPos) === "<") {
			_disposeAddTagListeners(_keyboardListener);
		}
		
		// If the key pressed is the right arrow key, check cursor position. if cursor position is outside the open tag, end empty tag action.
		// Because this is a keyDown event, we must check to see what the character ahead of the cursor currently is
		else if (event.keyCode === 39 && _currentDoc.getRange(_currentPos,{line:_currentPos.line, ch:_currentPos.ch + 1}) === ">") {
			_disposeAddTagListeners(_keyboardListener);
		}
		
		// If any other key pressed is not the left or right arrow key, prevent normal behavior
		else if (event.keyCode !== 37 && event.keyCode !== 39) {
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
		}
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Listener for the cursor changing position while in the empty tag action. If the cursor leaves the open tag, 
	* end the empty tag action.
	* @private
	*/
	function _onCursorChange(event) {
		_currentPos = _editor.getCursorPos();
		
		if (_currentPos.line !== _emptyTagPos.open.start.line || ((_currentPos.ch < _emptyTagPos.open.start.ch || _currentPos.ch > _emptyTagPos.open.end.ch) && _currentPos.line !== _emptyTagPos.open.start.line)) {
				_disposeAddTagListeners(_keyboardListener);
		}
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Uses _addTag() method to insert empty tag and gets Brackets ready for the user to begin typing 
	* to capture input
	* @private
	*/
	function _insertEmptyTag() {
		_addTag("");
		
		var curPos = _editor.getCursorPos();
		
		// reset empty tag position variable
		_emptyTagPos = {
			open:{
				start:{
					line:curPos.line, ch:curPos.ch - 2
				}, 
				end:{
					line:curPos.line, ch:curPos.ch
				}
			}, 
			close:{
				start:{
					line:curPos.line, ch:curPos.ch
				}, 
				end:{
					line:curPos.line, ch:curPos.ch + 3 + _lng
				}
			}
		};
		
		// set open tag positions.
		_emptyTagPos.open.start = {line:curPos.line, ch:curPos.ch - 2};
		_emptyTagPos.open.end = {line:curPos.line, ch:curPos.ch};
		
		// If length is zero, the move the cursor back 1 space to be inside the empty open tag
		if (_lng === 0) {
			_editor.setCursorPos(curPos.line, curPos.ch - 1);
		}
		
		// If length is not zero, then move the cursor back 4 spaces (to account for "></>") + the length of 
		// the highlighted word to be inside the empty open tag. Length (_lng) is known because its value is 
		// set when the _addTag() method is called
		else {
			_editor.setCursorPos(curPos.line, curPos.ch - (4 + _lng));
		}
		
		_editor.on("cursorActivity", _onCursorChange);
		KeyBindingManager.addGlobalKeydownHook(_keyboardListener);
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Creates the string representation of the array of keyboard shortcut keys to use for a keyboard shortcut
	* @private
	*/
	function _getShortcutString(shortcutArray) {
		var string = ""; // create string to be used for the keyboard shortcut
		shortcutArray.forEach(function (value, index) {
			if (value !== undefined && value !== null) {
				string += value;
				// if not last entry, add "-" to string
				if (index !== shortcutArray.length - 1) {
					string += "-";
				}
			}
		});
		
		return string;
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Generate keyboard shortcut
	* @private
	*/
	function _generateShortcut(shortcutArray) {
		var string = _getShortcutString(shortcutArray);
		var arr;
		
		if (string !== "") {
			arr = [{ "key": string, "platform": _platform }];
		}
		else {
			arr = [];
		}
		
		return arr;
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* @private
	*/
	function onBeforeContextMenuOpen(e) {
		var selection = EditorManager.getCurrentFullEditor().getSelection();
		
		if (selection.end.ch - selection.start.ch <= 2) {
			EditorManager.getCurrentFullEditor().setCursorPos(selection.end.line, selection.end.ch);
		}
	}
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Adds all menu items to menu bar and enabled hotkeys
	* @private
	*/
	function _addMenuItems() {
		// Add HTML Format menu to menu bar
		if (_htmlFormatMenu === null || _htmlFormatMenu === undefined) {
			_htmlFormatMenu = Menus.addMenu(Strings.TITLE_MENU, HTML_FORMAT_MENU_COMMAND_ID, Menus.BEFORE, Menus.AppMenuBar.FIND_MENU);
			
			// add some of the options to the right-click menu
			if (_addRightClick === true) {
				Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(BOLD_COMMAND_ID);
				Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(ITALIC_COMMAND_ID);
				Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(UNDERLINE_COMMAND_ID);
				Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).on("beforeContextMenuOpen", onBeforeContextMenuOpen);
			}
			
			_htmlFormatMenu.addMenuItem(BOLD_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.BOLD_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(BOLD_STYLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.BOLD_STYLE)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(ITALIC_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.ITALIC_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(ITALIC_STYLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.ITALIC_STYLE)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(UNDERLINE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.UNDERLINE_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(UNDERLINE_STYLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.UNDERLINE_STYLE)), Menus.LAST);

			_htmlFormatMenu.addMenuDivider();
			
			_htmlFormatMenu.addMenuItem(SPAN_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.SPAN_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(DIV_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.DIV_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(HEADER_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.HEADER_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(NAV_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.NAV_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(ARTICLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.ARTICLE_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(SECTION_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.SECTION_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(ASIDE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.ASIDE_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(FOOTER_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.FOOTER_TAG)), Menus.LAST);

			_htmlFormatMenu.addMenuDivider();
			
			_htmlFormatMenu.addMenuItem(STRIKE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.STRIKE_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(STRIKE_STYLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.STRIKE_STYLE)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(TELETYPE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.TELETYPE_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(TELETYPE_STYLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.TELETYPE_TAG)), Menus.LAST);

			_htmlFormatMenu.addMenuDivider();
			
			_htmlFormatMenu.addMenuItem(CODE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.CODE_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(VARIABLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.VARIABLE_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(SAMPLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.SAMPLE_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(KEYBOARD_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.KEYBOARD_TAG)), Menus.LAST);

			_htmlFormatMenu.addMenuDivider();

			_htmlFormatMenu.addMenuItem(CITATION_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.CITATION_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(DEFINITION_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.DEFINITION_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(DELETED_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.DELETED_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(INSERTED_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.INSERTED_TAG)), Menus.LAST);

			_htmlFormatMenu.addMenuDivider();

			_htmlFormatMenu.addMenuItem(INSERT_TAG_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.EMPTY_TAG)), Menus.LAST);

			_htmlFormatMenu.addMenuDivider();
			
			_htmlFormatMenu.addMenuItem(PREFERENCE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.PREFERENCES)), Menus.LAST);
		}
		
		// enable hotkeys
		_commands.forEach(function(command) {
			command.setEnabled(true);
		});
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Removes all menu items to menu bar and disables hotkeys
	* @private
	*/
	function _removeMenuItems() {
		// Disable all commands
		_commands.forEach(function(command) {
			command.setEnabled(false);
		});
			
		// remove right-click menu options
		if (_addRightClick === true) {
			Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).removeMenuItem(BOLD_COMMAND_ID);
			Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).removeMenuItem(ITALIC_COMMAND_ID);
			Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).removeMenuItem(UNDERLINE_COMMAND_ID);
			Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).off("beforeContextMenuOpen");
		}
		
		// remove any previously set key bindings generated by Menu.addMenuItem()
		var str = "";
		var prop;
		for (prop in PreferenceStrings) {
			if (PreferenceStrings.hasOwnProperty(prop)) {
				str = _getShortcutString(_preferences.get(PreferenceStrings[prop]));
				if (str !== "") {
					KeyBindingManager.removeBinding(str, _platform);
				}
			}
		}
		
		// Remove HTML Format menu from menu bar and set variable reference to null
		Menus.removeMenu(HTML_FORMAT_MENU_COMMAND_ID);
		_htmlFormatMenu = null;
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Gets HTML Format Preferences panel content to update preference values
	* @private
	*/
	function _getPreferenceValues(target) {
		var arr = [];
		arr.push( ($("#" + target + " .shortcut_modifiers .shortcut_modifier_ctrlCmd").prop("checked")) ? _control : null );
		arr.push( ($("#" + target + " .shortcut_modifiers .shortcut_modifier_shift").prop("checked")) ? "Shift" : null );
		arr.push( ($("#" + target + " .shortcut_modifiers .shortcut_modifier_alt").prop("checked")) ? "Alt" : null );
		if (_platform === "mac") {
			arr.push( ($("#" + target + " .shortcut_modifiers .shortcut_modifier_ctrl").prop("checked")) ? "Ctrl" : null );
		}
		else {
			arr.push(null);
		}
		arr.push( $("#" + target + " .shortcut_modifiers .shortcut_modifier_char").prop("value") );
		return arr;
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Used for checking changed preferences against saved ones
	* @private
	*/
	function _checkCurrentPrefernces(target) {
		var pref = _getPreferenceValues(target);
		var isInUse = false;
		var prop;
		for (prop in PreferenceStrings) {
			if (PreferenceStrings.hasOwnProperty(prop)) {
				$("#" + PreferenceStrings[prop]).css("background-color", "");// target all elements and reset
				
				if (target !== PreferenceStrings[prop] && pref.toString() === _getPreferenceValues(PreferenceStrings[prop]).toString() && pref.toString() !== _defaultTagStyleShortcut.toString()) {
					$("#" + PreferenceStrings[prop]).css("background-color", "#ff7777");
					isInUse = true;
				}
			}
		}
		
		if (isInUse === true) {
			$("#" + target).css("background-color", "#ff0000");
			$("#btn_save").css("background-color", "#cc0000");
			$("#btn_save").css("border-color", "#550000");
			_duplicateShortcuts = true;
		}
		else {
			$("#btn_save").css("background-color", "");
			$("#btn_save").css("border-color", "");
			_duplicateShortcuts = false;
		}
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Update HTML Format Preferences panel content to match the saved preferences
	* @private
	*/
	function _updatePreferenceHTML(target, pref) {
		$("#" + target + " .shortcut_modifiers .shortcut_modifier_ctrlCmd").prop("checked", (pref[0] !== undefined && pref[0] !== null) ? true : false);
		$("#" + target + " .shortcut_modifiers .shortcut_modifier_shift").prop("checked", (pref[1] !== undefined && pref[1] !== null) ? true : false);
		$("#" + target + " .shortcut_modifiers .shortcut_modifier_alt").prop("checked", (pref[2] !== undefined && pref[2] !== null) ? true : false);
		if (_platform === "mac") {
			$("#" + target + " .shortcut_modifiers .shortcut_modifier_ctrl").prop("checked", (pref[3] !== undefined && pref[3] !== null) ? true : false);
		}
		$("#" + target + " .shortcut_modifiers .shortcut_modifier_char").prop("value", pref[4]);
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Gets HTML Format Preferences panel content to update preference values
	* @private
	*/
	function _setPreferenceValues(target) {
		var okToSave = false;
		var arr = _getPreferenceValues(target);
		
		// check to make sure at least one of the modifier keys has been set
		if (arr[0] !== null || arr[1] !== null || arr[2] !== null || arr[3] !== null) {
			// a modifier has been set, check to see if a character has been set
			if (arr[4] !== "") {
				okToSave = true;
			}
		}
		// no modifier key is set, check to see if there is no letter set. If so, keyboard shortcut removed, allow save
		else if (arr[4] === "") {
			okToSave = true;
		}
		
		if (okToSave === true) {
			_preferences.set(target, arr);
		}
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Opens the preferences screen for user modification.
	* @private
	*/
	function _openPreferencesPanel() {
		Dialogs.showModalDialogUsingTemplate(_preferenceHTML);
		
		$("#boldStrong input").prop("checked", _boldUsesStrong);
		$("#italicEm input").prop("checked", _italicUsesEm);
		$("#rightClick input").prop("checked", _addRightClick);
		_updatePreferenceHTML(PreferenceStrings.BOLD_TAG, _preferences.get(PreferenceStrings.BOLD_TAG));
		_updatePreferenceHTML(PreferenceStrings.BOLD_STYLE, _preferences.get(PreferenceStrings.BOLD_STYLE));
		_updatePreferenceHTML(PreferenceStrings.ITALIC_TAG, _preferences.get(PreferenceStrings.ITALIC_TAG));
		_updatePreferenceHTML(PreferenceStrings.ITALIC_STYLE, _preferences.get(PreferenceStrings.ITALIC_STYLE));
		_updatePreferenceHTML(PreferenceStrings.UNDERLINE_TAG, _preferences.get(PreferenceStrings.UNDERLINE_TAG));
		_updatePreferenceHTML(PreferenceStrings.UNDERLINE_STYLE, _preferences.get(PreferenceStrings.UNDERLINE_STYLE));
		_updatePreferenceHTML(PreferenceStrings.STRIKE_TAG, _preferences.get(PreferenceStrings.STRIKE_TAG));
		_updatePreferenceHTML(PreferenceStrings.STRIKE_STYLE, _preferences.get(PreferenceStrings.STRIKE_STYLE));
		_updatePreferenceHTML(PreferenceStrings.TELETYPE_TAG, _preferences.get(PreferenceStrings.TELETYPE_TAG));
		_updatePreferenceHTML(PreferenceStrings.TELETYPE_STYLE, _preferences.get(PreferenceStrings.TELETYPE_STYLE));
		_updatePreferenceHTML(PreferenceStrings.CODE_TAG, _preferences.get(PreferenceStrings.CODE_TAG));
		_updatePreferenceHTML(PreferenceStrings.VARIABLE_TAG, _preferences.get(PreferenceStrings.VARIABLE_TAG));
		_updatePreferenceHTML(PreferenceStrings.SAMPLE_TAG, _preferences.get(PreferenceStrings.SAMPLE_TAG));
		_updatePreferenceHTML(PreferenceStrings.KEYBOARD_TAG, _preferences.get(PreferenceStrings.KEYBOARD_TAG));
		_updatePreferenceHTML(PreferenceStrings.CITATION_TAG, _preferences.get(PreferenceStrings.CITATION_TAG));
		_updatePreferenceHTML(PreferenceStrings.DEFINITION_TAG, _preferences.get(PreferenceStrings.DEFINITION_TAG));
		_updatePreferenceHTML(PreferenceStrings.DELETED_TAG, _preferences.get(PreferenceStrings.DELETED_TAG));
		_updatePreferenceHTML(PreferenceStrings.INSERTED_TAG, _preferences.get(PreferenceStrings.INSERTED_TAG));
		_updatePreferenceHTML(PreferenceStrings.EMPTY_TAG, _preferences.get(PreferenceStrings.EMPTY_TAG));
		_updatePreferenceHTML(PreferenceStrings.PREFERENCES, _preferences.get(PreferenceStrings.PREFERENCES));
		
		// listen for keypresses and checkboxes on any of the form elements within the preference panel
		$("#preferenceForm").on("change", function (e) {
			if (e.target.type === "checkbox" && $(e.target.parentElement.parentElement).hasClass("bold_italic") == false) {
				_checkCurrentPrefernces(e.target.parentElement.parentElement.parentElement.getAttribute("id"));
			}
		});
		
		$("#preferenceForm").on("keypress", function (e) {
			if (e.target.type === "text") {
				// If the character is a lowercase letter, display it as uppercase
				if ((e.keyCode > 64 && e.keyCode < 91) || ((e.keyCode > 96 && e.keyCode < 123))) {
					e.target.value = String.fromCharCode(e.keyCode).toUpperCase();
					_checkCurrentPrefernces(e.target.parentElement.parentElement.getAttribute("id"));
				}

				// else if the character is not a number, grave accent, back/forward slash, bracket, brace, comma, period, minus, semicolon, single-quote, or equals, prevent it from being used
				else if (e.keyCode < 65 || e.keyCode > 122) {
					e.preventDefault();
				}
			}
		});
		
		$("#btn_save").on("click", function (e) {
			_preferences.set(AdditionalPrefStrings.BOLD_USES_STRONG, $("#boldStrong input").prop("checked"));
			_preferences.set(AdditionalPrefStrings.ITALIC_USES_EM, $("#italicEm input").prop("checked"));
			_preferences.set(AdditionalPrefStrings.ADD_RIGHT_CLICK, $("#rightClick input").prop("checked"));
			_boldUsesStrong = _preferences.get(AdditionalPrefStrings.BOLD_USES_STRONG);
			_italicUsesEm = _preferences.get(AdditionalPrefStrings.ITALIC_USES_EM);
			_addRightClick = _preferences.get(AdditionalPrefStrings.ADD_RIGHT_CLICK);
			
			if (_duplicateShortcuts == false) {
				_setPreferenceValues(PreferenceStrings.BOLD_TAG);
				_setPreferenceValues(PreferenceStrings.BOLD_STYLE);
				_setPreferenceValues(PreferenceStrings.ITALIC_TAG);
				_setPreferenceValues(PreferenceStrings.ITALIC_STYLE);
				_setPreferenceValues(PreferenceStrings.UNDERLINE_TAG);
				_setPreferenceValues(PreferenceStrings.UNDERLINE_STYLE);
				_setPreferenceValues(PreferenceStrings.STRIKE_TAG);
				_setPreferenceValues(PreferenceStrings.STRIKE_STYLE);
				_setPreferenceValues(PreferenceStrings.TELETYPE_TAG);
				_setPreferenceValues(PreferenceStrings.TELETYPE_STYLE);
				_setPreferenceValues(PreferenceStrings.CODE_TAG);
				_setPreferenceValues(PreferenceStrings.VARIABLE_TAG);
				_setPreferenceValues(PreferenceStrings.SAMPLE_TAG);
				_setPreferenceValues(PreferenceStrings.KEYBOARD_TAG);
				_setPreferenceValues(PreferenceStrings.CITATION_TAG);
				_setPreferenceValues(PreferenceStrings.DEFINITION_TAG);
				_setPreferenceValues(PreferenceStrings.DELETED_TAG);
				_setPreferenceValues(PreferenceStrings.INSERTED_TAG);
				_setPreferenceValues(PreferenceStrings.EMPTY_TAG);
				_setPreferenceValues(PreferenceStrings.PREFERENCES);
                
                // save preferences
				PreferencesManager.save();
                
                // tell brackets to reload with extensions so preference changes take place
                CommandManager.execute(Commands.APP_RELOAD);
			}
			else {
				alert("Duplicate keyboard shortcuts left unresolved.\nSave did not happen.");
			}
		});
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Listen for changes to which file is open for editing. If it is an HTML file, enable menu bar items and 
	* hotkeys, otherwise disable if not already. NOTE: Currently this is broken if using more than 1 Brackets 
	* window. Switching between windows does not bring back HTML Format menu even if the document that was 
	* switched to is an HTML document.
	* @private
	*/
	function _onCurrentFileChange(e, newFile, newPaneId, oldFile, oldPaneId) {
		if (newFile !== null && newFile !== undefined) {
			_fileExtension = FileUtils.getFileExtension(newFile.toString().toLowerCase());
			var shouldAdd = (_fileExtension.indexOf("htm") !== -1 || _fileExtension.indexOf("php") !== -1 || _fileExtension.indexOf("asp") !== -1);
			
			if (_htmlFormatMenu !== null && _htmlFormatMenu !== undefined) {
				_removeMenuItems();
			}
			if ((_htmlFormatMenu === null || _htmlFormatMenu === undefined) && (shouldAdd === true)) {
				_addMenuItems();
			}
		}
	}
	
	
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	// FINAL SETUP - add commands and event listener for file change
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	
	//------------------------------------------------------------------------------------------------------------//
	_commands.push(CommandManager.register(Strings.LABEL_BOLD_TAG_SHORTCUT, BOLD_COMMAND_ID, _boldTag));
	_commands.push(CommandManager.register(Strings.LABEL_BOLD_STYLE_SHORTCUT, BOLD_STYLE_COMMAND_ID, _boldStyle));
	_commands.push(CommandManager.register(Strings.LABEL_ITALIC_TAG_SHORTCUT, ITALIC_COMMAND_ID, _italicTag));
	_commands.push(CommandManager.register(Strings.LABEL_ITALIC_STYLE_SHORTCUT, ITALIC_STYLE_COMMAND_ID, _italicStyle));
	_commands.push(CommandManager.register(Strings.LABEL_UNDERLINE_TAG_SHORTCUT, UNDERLINE_COMMAND_ID, _underlineTag));
	_commands.push(CommandManager.register(Strings.LABEL_UNDERLINE_STYLE_SHORTCUT, UNDERLINE_STYLE_COMMAND_ID, _underlineStyle));
	
	//------------------------------------------------------------------------------------------------------------//
	_commands.push(CommandManager.register(Strings.LABEL_SPAN_TAG_SHORTCUT, SPAN_COMMAND_ID, _spanTag));
	_commands.push(CommandManager.register(Strings.LABEL_DIV_TAG_SHORTCUT, DIV_COMMAND_ID, _divTag));
	_commands.push(CommandManager.register(Strings.LABEL_HEADER_TAG_SHORTCUT, HEADER_COMMAND_ID, _headerTag));
	_commands.push(CommandManager.register(Strings.LABEL_NAV_TAG_SHORTCUT, NAV_COMMAND_ID, _navTag));
	_commands.push(CommandManager.register(Strings.LABEL_ARTICLE_TAG_SHORTCUT, ARTICLE_COMMAND_ID, _articleTag));
	_commands.push(CommandManager.register(Strings.LABEL_SECTION_TAG_SHORTCUT, SECTION_COMMAND_ID, _sectionTag));
	_commands.push(CommandManager.register(Strings.LABEL_ASIDE_TAG_SHORTCUT, ASIDE_COMMAND_ID, _asideTag));
	_commands.push(CommandManager.register(Strings.LABEL_FOOTER_TAG_SHORTCUT, FOOTER_COMMAND_ID, _footerTag));
	
	//------------------------------------------------------------------------------------------------------------//
	_commands.push(CommandManager.register(Strings.LABEL_STRIKE_TAG_SHORTCUT, STRIKE_COMMAND_ID, _strikeTag));
	_commands.push(CommandManager.register(Strings.LABEL_STRIKE_STYLE_SHORTCUT, STRIKE_STYLE_COMMAND_ID, _strikeStyle));
	_commands.push(CommandManager.register(Strings.LABEL_TELETYPE_TAG_SHORTCUT, TELETYPE_COMMAND_ID, _teletypeTag));
	_commands.push(CommandManager.register(Strings.LABEL_TELETYPE_STYLE_SHORTCUT, TELETYPE_STYLE_COMMAND_ID, _teletypeStyle));
	
	//------------------------------------------------------------------------------------------------------------//
	_commands.push(CommandManager.register(Strings.LABEL_CODE_TAG_SHORTCUT, CODE_COMMAND_ID, _codeTag));
	_commands.push(CommandManager.register(Strings.LABEL_VARIABLE_TAG_SHORTCUT, VARIABLE_COMMAND_ID, _variableTag));
	_commands.push(CommandManager.register(Strings.LABEL_SAMPLE_TAG_SHORTCUT, SAMPLE_COMMAND_ID, _sampleTag));
	_commands.push(CommandManager.register(Strings.LABEL_KEYBOARD_TAG_SHORTCUT, KEYBOARD_COMMAND_ID, _keyboardTag));
	
	//------------------------------------------------------------------------------------------------------------//
	_commands.push(CommandManager.register(Strings.LABEL_CITATION_TAG_SHORTCUT, CITATION_COMMAND_ID, _citationTag));
	_commands.push(CommandManager.register(Strings.LABEL_DEFINITION_TAG_SHORTCUT, DEFINITION_COMMAND_ID, _definitionTag));
	_commands.push(CommandManager.register(Strings.LABEL_DELETED_TAG_SHORTCUT, DELETED_COMMAND_ID, _deletedTag));
	_commands.push(CommandManager.register(Strings.LABEL_INSERTED_TAG_SHORTCUT, INSERTED_COMMAND_ID, _insertedTag));
	
	//------------------------------------------------------------------------------------------------------------//
	_commands.push(CommandManager.register(Strings.LABEL_EMPTY_TAG_SHORTCUT, INSERT_TAG_COMMAND_ID, _insertEmptyTag));
	
	//------------------------------------------------------------------------------------------------------------//
	_commands.push(CommandManager.register(Strings.LABEL_PREFERENCES_SHORTCUT, PREFERENCE_COMMAND_ID, _openPreferencesPanel));
	
	//------------------------------------------------------------------------------------------------------------//
	MainViewManager.on("currentFileChange", _onCurrentFileChange);
});
