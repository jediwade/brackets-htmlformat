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
	* Menu bar containing all the format options.
	* @type {Menu}
	* @private
	*/
	var _htmlFormatMenu = null;
	
	/**
	* Array of all the dividers added to the HTML Format menu bar
	* @type {array}
	* @private
	*/
	var _htmlFormatMenuDividers = [];
	
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
	* Used for keeping track of duplicate keyboard shortcuts. Prevents Save button from working if true.
	* @private
	*/
	var _duplicateShortcuts = false;
	
	
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	// PREFERENCES
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	
	ExtensionUtils.loadStyleSheet(module, "preferencePanel.css");
	
	// generate list of keyboard shortcuts for HTML Format Preferences screen
	var prefString = "";
	var prefStringProp;
	for (prefStringProp in PreferenceStrings) {
		if (PreferenceStrings.hasOwnProperty(prefStringProp)) {
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
	var _control = (_platform === "mac") ? "Cmd" : "Ctrl";
	
	if (_preferences.get("boldUsesStrong") === undefined) {
		_preferences.set("boldUsesStrong", false);
		_preferences.set("italicUsesEm", false);
		
		// command, shift, alt, control, character
		_preferences.set(PreferenceStrings.BOLD_TAG, [_control, null, null, null, "B"]);
		_preferences.set(PreferenceStrings.BOLD_STYLE, [_control, "Shift", null, null, "B"]);
		_preferences.set(PreferenceStrings.ITALIC_TAG, [_control, null, null, null, "I"]);
		_preferences.set(PreferenceStrings.ITALIC_STYLE, [_control, "Shift", null, null, "I"]);
		_preferences.set(PreferenceStrings.UNDERLINE_TAG, [_control, null, null, null, "U"]);
		_preferences.set(PreferenceStrings.UNDERLINE_STYLE, [_control, "Shift", null, null, "U"]);
		
		_preferences.set(PreferenceStrings.STRIKE_TAG, [null, null, null, null, ""]);
		_preferences.set(PreferenceStrings.STRIKE_STYLE, [null, null, null, null, ""]);
		_preferences.set(PreferenceStrings.TELETYPE_TAG, [null, null, null, null, ""]);
		_preferences.set(PreferenceStrings.TELETYPE_STYLE, [null, null, null, null, ""]);
		
		_preferences.set(PreferenceStrings.CODE_TAG, [null, null, null, null, ""]);
		_preferences.set(PreferenceStrings.VARIABLE_TAG, [null, null, null, null, ""]);
		_preferences.set(PreferenceStrings.SAMPLE_TAG, [null, null, null, null, ""]);
		_preferences.set(PreferenceStrings.KEYBOARD_TAG, [null, null, null, null, ""]);
		
		_preferences.set(PreferenceStrings.CITATION_TAG, [null, null, null, null, ""]);
		_preferences.set(PreferenceStrings.DEFINITION_TAG, [null, null, null, null, ""]);
		_preferences.set(PreferenceStrings.DELETED_TAG, [null, null, null, null, ""]);
		_preferences.set(PreferenceStrings.INSERTED_TAG, [null, null, null, null, ""]);
		
		_preferences.set(PreferenceStrings.EMPTY_TAG, [_control, null, null, null, "T"]);
		_preferences.set(PreferenceStrings.PREFERENCES, [_control, "Shift", null, null, ","]);
	}
	else {
		_boldUsesStrong = _preferences.get("boldUsesStrong");
		_italicUsesEm = _preferences.get("italicUsesEm");
	}
	
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	// FUNCTIONS
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	
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
		
		var _tagStart = "<span style=";
		var _style = "";
		var _tagEnd = "</span>";
		
		if (style === "bold") {
			_style = "\"font-weight:bold;\"";
		}
		else if (style === "italic") {
			_style = "\"font-style:italic;\"";
		}
		else if (style === "underline") {
			_style = "\"text-decoration:underline;\"";
		}
		else if (style === "strikethrough") {
			_style = "\"text-decoration:line-through;\"";
		}
		else if (style === "monospace") {
			_style = "\"font-family:'Lucida Console', monospace;\"";
		}
		
		if (_editor.hasSelection()) {
			_selection = _editor.getSelection();
			_currentDoc.replaceRange(_tagStart + _style + ">" + _editor.getSelectedText() + _tagEnd, _selection.start, _selection.end);
			_editor.setSelection({line: _selection.start.line, ch: (_selection.start.ch)}, _editor.getCursorPos());
		}
		else {
			_currentDoc.replaceRange(_tagStart + _style + ">" + _tagEnd, _editor.getCursorPos());
			_editor.setCursorPos(_editor.getCursorPos().line, _editor.getCursorPos().ch - _tagEnd.length);
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
		$(_editor).off("cursorActivity");
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
		
		if (_currentPos.line !== _emptyTagPos.open.start.line || 
			( (_currentPos.ch < _emptyTagPos.open.start.ch || _currentPos.ch > _emptyTagPos.open.end.ch) && _currentPos.line === _emptyTagPos.open.start.line) ) {
				_disposeAddTagListeners(_keyboardListener, null);
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
		_emptyTagPos = {open:{start:{line:0, ch:0}, end:{line:0, ch:0}}, close:{start:{line:0, ch:0}, end:{line:0, ch:0}}};
		
		// set open tag positions.
		_emptyTagPos.open.start = {line:curPos.line, ch:curPos.ch - 2};
		_emptyTagPos.open.end = {line:curPos.line, ch:curPos.ch};
		
		// If length is zero, the move the cursor back 1 space to be inside the empty open tag
		if (_lng === 0) {
			_editor.setCursorPos(curPos.line, curPos.ch - 1);
			
			// set open tag position. cursor is set to be to the right of the "/>"
			_emptyTagPos.close.start = {line:curPos.line, ch:curPos.ch};
			_emptyTagPos.close.end = {line:curPos.line, ch:curPos.ch + 3};
		}
		
		// If length is not zero, then move the cursor back 4 spaces (to account for "></>") + the length of 
		// the highlighted word to be inside the empty open tag. Length (_lng) is known because its value is 
		// set when the _addTag() method is called
		else {
			_editor.setCursorPos(curPos.line, curPos.ch - (4 + _lng));
			
			// set close tag positions.
			_emptyTagPos.close.start = {line:curPos.line, ch:curPos.ch};
			_emptyTagPos.close.end = {line:curPos.line, ch:curPos.ch + 3 + _lng};
		}
		
		$(_editor).on("cursorActivity", _onCursorChange);
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
	* Adds all menu items to menu bar and enabled hotkeys
	* @private
	*/
	function _addMenuItems() {
		// Add HTML Format menu to menu bar
		if (_htmlFormatMenu == null || _htmlFormatMenu == undefined) {
		_htmlFormatMenu = Menus.addMenu(Strings.TITLE_MENU, HTML_FORMAT_MENU_COMMAND_ID, Menus.BEFORE, Menus.AppMenuBar.FIND_MENU);
		
		// Add all menu options
		_htmlFormatMenu.addMenuItem(BOLD_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.BOLD_TAG)), Menus.LAST);
		_htmlFormatMenu.addMenuItem(BOLD_STYLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.BOLD_STYLE)), Menus.LAST);
		_htmlFormatMenu.addMenuItem(ITALIC_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.ITALIC_TAG)), Menus.LAST);
		_htmlFormatMenu.addMenuItem(ITALIC_STYLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.ITALIC_STYLE)), Menus.LAST);
		_htmlFormatMenu.addMenuItem(UNDERLINE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.UNDERLINE_TAG)), Menus.LAST);
		_htmlFormatMenu.addMenuItem(UNDERLINE_STYLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.UNDERLINE_STYLE)), Menus.LAST);
		
		_htmlFormatMenuDividers[_htmlFormatMenuDividers.length] = _htmlFormatMenu.addMenuDivider();
		
		_htmlFormatMenu.addMenuItem(STRIKE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.STRIKE_TAG)), Menus.LAST);
		_htmlFormatMenu.addMenuItem(STRIKE_STYLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.STRIKE_STYLE)), Menus.LAST);
		_htmlFormatMenu.addMenuItem(TELETYPE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.TELETYPE_TAG)), Menus.LAST);
		_htmlFormatMenu.addMenuItem(TELETYPE_STYLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.TELETYPE_TAG)), Menus.LAST);
		
		_htmlFormatMenuDividers[_htmlFormatMenuDividers.length] = _htmlFormatMenu.addMenuDivider();
		
		_htmlFormatMenu.addMenuItem(CODE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.CODE_TAG)), Menus.LAST);
		_htmlFormatMenu.addMenuItem(VARIABLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.VARIABLE_TAG)), Menus.LAST);
		_htmlFormatMenu.addMenuItem(SAMPLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.SAMPLE_TAG)), Menus.LAST);
		_htmlFormatMenu.addMenuItem(KEYBOARD_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.KEYBOARD_TAG)), Menus.LAST);
		
		_htmlFormatMenuDividers[_htmlFormatMenuDividers.length] = _htmlFormatMenu.addMenuDivider();
		
		_htmlFormatMenu.addMenuItem(CITATION_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.CITATION_TAG)), Menus.LAST);
		_htmlFormatMenu.addMenuItem(DEFINITION_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.DEFINITION_TAG)), Menus.LAST);
		_htmlFormatMenu.addMenuItem(DELETED_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.DELETED_TAG)), Menus.LAST);
		_htmlFormatMenu.addMenuItem(INSERTED_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.INSERTED_TAG)), Menus.LAST);
		
		_htmlFormatMenuDividers[_htmlFormatMenuDividers.length] = _htmlFormatMenu.addMenuDivider();
		
		_htmlFormatMenu.addMenuItem(INSERT_TAG_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.EMPTY_TAG)), Menus.LAST);
		
		_htmlFormatMenuDividers[_htmlFormatMenuDividers.length] = _htmlFormatMenu.addMenuDivider();
		
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
		
		// remove any previously set key bindings generated by Menu.addMenuItem()
		var str = "";
		for (var props in PreferenceStrings) {
			str = _getShortcutString(_preferences.get(PreferenceStrings[props]));
			if (str !== "") {
				KeyBindingManager.removeBinding(str, _platform);
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
				
				if (target !== PreferenceStrings[prop] && pref.toString() === _getPreferenceValues(PreferenceStrings[prop]).toString()) {
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
		
		$("#boldStrong input").prop("checked", _preferences.get("boldUsesStrong"));
		$("#italicEm input").prop("checked", _preferences.get("italicUsesEm"));
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
			_preferences.set("boldUsesStrong", $("#boldStrong input").prop("checked"));
			_preferences.set("italicUsesEm", $("#italicEm input").prop("checked"));
			_boldUsesStrong = _preferences.get("boldUsesStrong");
			_italicUsesEm = _preferences.get("italicUsesEm");
			
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
				PreferencesManager.save();
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
		if (newFile !== null) {
			var ext = FileUtils.getFileExtension(newFile.toString().toLowerCase());
			var shouldAdd = (ext.indexOf("htm") !== -1 || ext.indexOf("php") !== -1 || ext.indexOf("asp") !== -1);
			
			if ((_htmlFormatMenu === null || _htmlFormatMenu === undefined) && (shouldAdd === true)) {
				_addMenuItems();
			}
			else if ((_htmlFormatMenu !== null && _htmlFormatMenu !== undefined) && (shouldAdd === false)) {
				_removeMenuItems();
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
	$(MainViewManager).on("currentFileChange", _onCurrentFileChange);
});
