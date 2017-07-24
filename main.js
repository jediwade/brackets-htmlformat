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

/*jslint
	vars:true, plusplus:true, devel:true, nomen:true, regexp:true, indent:4, maxerr:50, eqeq:true, white:true
*/
/*global
	define, $, brackets, navigator, console
*/

define(function (require, exports, module) {
	"use strict";
	console.log("INITIALIZING HTML FORMAT EXTENSION");
	
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	// BRACKETS OBJECTS
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	// Referencing for reloading Brackets after saving preference changes. 
	// Reloading Brackets is required for hotkey changes to register.
	var Commands = brackets.getModule("command/Commands");
	
	// Used for registering all the menubar actions that can be executed.
	var CommandManager = brackets.getModule("command/CommandManager");
	
	// Used for adding and removing menu options to the File/Edit/Find menubar.
	var Menus = brackets.getModule("command/Menus");
	
	// Used for inserting tags at cursor position or inserting tags around highlighted copy.
	var DocumentManager = brackets.getModule("document/DocumentManager");
	
	// Used for updating cursor position after tag has been inserted.
	// Used for keeping highlight around copy after tag has been added around already highlighted text.
	var EditorManager = brackets.getModule("editor/EditorManager");
	
	// used for getting tab units
	var Editor = brackets.getModule("editor/Editor").Editor;
	
	// Used for detecting key presses when adding a blank tag to type into.
	var KeyBindingManager = brackets.getModule("command/KeyBindingManager");
	
	// Used for knowing when the file being viewed has changed.
	var MainViewManager = brackets.getModule("view/MainViewManager");
	
	// Used for getting the file extension of the file currently being viewed to know if the menu bar 
	// should appear and if hotkeys should work.
	var FileUtils = brackets.getModule("file/FileUtils");
	
	// Used for saving and retrieving hotkey preferences and more.
	var PreferencesManager = brackets.getModule("preferences/PreferencesManager");
	
	// Used for generating and showing the preference screen.
	var Dialogs = brackets.getModule("widgets/Dialogs");
	
	// Used for styling the preference screen.
	var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
	
	// Used for rendering the HTML Format Preference window.
	var Mustache = brackets.getModule("thirdparty/mustache/mustache");
	
	// Strings all used for handling the generation of menu bar options, hotkeys, right-click menu, etc.
	var Strings = require("i18n!nls/strings");
	var PreferenceStrings = require("i18n!nls/preferenceStrings");
	var AdditionalPrefStrings = require("i18n!nls/additionalPrefStrings");
	var FirstUseStrings = require("i18n!nls/firstUseStrings");
	var WhatsNewStrings = require("i18n!nls/whatsNewStrings");
	
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	// CONSTANTS
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
	var ANCHOR_TAG_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.ANCHOR_TAG;
	var PARAGRAPH_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.PARAGRAPH_TAG;
	var H1_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.H1_TAG;
	var H2_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.H2_TAG;
	var H3_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.H3_TAG;
	var H4_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.H4_TAG;
	var H5_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.H5_TAG;
	var H6_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.H6_TAG;
	
	//------------------------------------------------------------------------------------------------------------//
	var SPAN_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.SPAN_TAG;
	var DIV_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.DIV_TAG;
	var HEADER_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.HEADER_TAG;
	var NAV_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.NAV_TAG;
	var MAIN_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.MAIN_TAG;
	var SECTION_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.SECTION_TAG;
	var ARTICLE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.ARTICLE_TAG;
	var ASIDE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.ASIDE_TAG;
	var FOOTER_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.FOOTER_TAG;
	
	//------------------------------------------------------------------------------------------------------------//
	/*var TABLE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.TABLE_TAG;
	var TABLE_HEADER_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.TABLE_HEADER_TAG;
	var TABLE_BODY_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.TABLE_BODY_TAG;
	var TABLE_FOOTER_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.TABLE_FOOTER_TAG;
	var ROW_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.ROW_TAG;
	var COLUMN_HEADER_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.COLUMN_HEADER_TAG;
	var COLUMN_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.COLUMN_TAG;
	var CAPTION_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.CAPTION_TAG;
	var COLUMN_GROUP_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.COLUMN_GROUP_TAG;
	var COLUMN_PROP_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.COLUMN_PROP_TAG;*/
	
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
	//var HTML_COMMENT_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.HTML_COMMENT;
	var PREFERENCE_COMMAND_ID = COMMAND_ID + "." + PreferenceStrings.PREFERENCES;
	
	
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	// VARIABLES
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	
	/**
	* HTML for rendering the preference options
	* @type {string}
	* @private
	*/
	var _preferencePanel = require("text!html/preferencePanel.html");
	
	/**
	* The rendered HTML for the HTML Format preference pane. Set after the _preferencePanel markup has been generated.
	* @type {string}
	* @private
	*/
	var _preferenceHTML;
	
	/**
	* Preferences for managing keyboard shortcuts.
	* @private
	*/
	var _preferences = PreferencesManager.getExtensionPrefs(COMMAND_ID + "." + PreferenceStrings.PREFERENCES);
	
	/**
	* Indicates the OS platform. Used for generating keyboard shortcuts.
	* @type {string}
	* @private
	*/
	var _platform = (navigator.appVersion.indexOf("Mac") !== -1) ? "mac" : "win";
	
	/**
	* Determines which key command should be used for the Control key based on the operating system.
	* @type {string}
	* @private
	*/
	var _control = (_platform === "mac") ? "Cmd" : "Ctrl";
	
	/**
	* Used for detecting the file type to know if the file menu should appear and if hotkeys should work
	* @type {string}
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
	* Used for keeping tracking of the current insert empty tag operation so that you can do one "undo" action to remove the entire thing.
	* @type {string}
	* @private
	*/
	var _emptyTagBatch = "*empty";
	
	/**
	* Represents the opening and closing tags of the insert empty tag action.
	* @type {object}
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
	* The currently highlighted copy.
	* @type {object}
	* @private
	*/
	var _selection;
	
	/**
	* The character length of the currently highlighted text.
	* @type {number}
	* @private
	*/
	var _lng = 0;
	
	/**
	* List of the file extensions that this Brackets extension can work with.
	* @type {string}
	* @private
	*/
	var _extensions = "";
	
	/**
	* Determines whether or not the <strong> tag is used in place of <b> when adding a bold tag.
	* @type {boolean}
	* @private
	*/
	var _boldUsesStrong = false;
	
	/**
	* Determines whether or not the <em> tag is used in place of <i> when adding an italic tag.
	* @type {boolean}
	* @private
	*/
	var _italicUsesEm = false;
	
	/**
	* Determining whether or not to include Bold, Italicize, and Underline commands in the right-click menu.
	* @type {boolean}
	* @private
	*/
	var _addRightClick = false;
	
	/**
	* The Menu Item that is the divider added to the right click menu if the users preference is set to include it.
	* @type {object}
	* @private
	*/
	var _rightClickMenuDivider;
	
	/**
	* Determining whether or not to use <br /> or <br> in HTML documents when using SHIFT + ENTER.
	* @type {boolean}
	* @private
	*/
	var _breakType = false;
	
	/**
	* Determining whether or not to insert a break tag and move the cursor to the next line when using SHIFT + ENTER.
	* @type {boolean}
	* @private
	*/
	var _breakTypeNextLine = false;
	
	/**
	* Used for keeping track of duplicate keyboard shortcuts. Prevents Save button from working if true.
	* @type {boolean}
	* @private
	*/
	var _duplicateShortcuts = false;
	
	/**
	* The default HTML tag/style keyboard shortcut array. The order of array items are as follows: Control/Command, Shift, Alt, Mac-Control, Keyboard Character.
	* @type {array}
	* @private
	*/
	var _defaultTagStyleShortcut = [null, null, null, null, ""];
	
	/**
	* Keeps track of the the global keydown hook for detecting the SHIFT + ENTER key being pressed in an HTML document.
	* @type {boolean}
	* @private
	*/
	var _hasLineBreakKeyboardListener = false;
	
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	// PREFERENCES
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	
	ExtensionUtils.loadStyleSheet(module, "html/css/preferencePanel.css");
	ExtensionUtils.loadStyleSheet(module, "html/css/whatsNewFirstUse.css");
	
	
	// Set Defaults for Bold, Italic, Underline, Empty Tag, and HTML Format Preferences
	// Control/Command, Shift, Alt, Mac Control, Character
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
	
	if (!_preferences.get(AdditionalPrefStrings.UPDATE_MESSAGE_1_SHOWN) && _preferences.get(AdditionalPrefStrings.FIRST_USE_MESSAGE_SHOWN)) {
		_preferences.set(AdditionalPrefStrings.UPDATE_MESSAGE_1_SHOWN, true);
		
		Dialogs.showModalDialogUsingTemplate(Mustache.render(require("text!html/whatsNewFirstUse.html"), WhatsNewStrings));
	}
	
	if (_preferences.get(AdditionalPrefStrings.EXTENSIONS) === undefined) {
		_preferences.set(AdditionalPrefStrings.FIRST_USE_MESSAGE_SHOWN, true);
		_preferences.set(AdditionalPrefStrings.EXTENSIONS, Strings.DEFAULT_EXTENSIONS);
		_extensions = _preferences.get(AdditionalPrefStrings.EXTENSIONS);
		
		// show here to make sure no one who has been using this extension sees the first time popup and update popup
		Dialogs.showModalDialogUsingTemplate(Mustache.render(require("text!html/whatsNewFirstUse.html"), FirstUseStrings));
	}
	else {
		_extensions = _preferences.get(AdditionalPrefStrings.EXTENSIONS);
	}
	
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
	
	if (_preferences.get(AdditionalPrefStrings.BREAK_TYPE) === undefined) {
		_preferences.set(AdditionalPrefStrings.BREAK_TYPE, false);
	}
	else {
		_breakType = _preferences.get(AdditionalPrefStrings.BREAK_TYPE);
	}
	
	if (_preferences.get(AdditionalPrefStrings.BREAK_TYPE_NEXT_LINE) === undefined) {
		_preferences.set(AdditionalPrefStrings.BREAK_TYPE_NEXT_LINE, false);
	}
	else {
		_breakTypeNextLine = _preferences.get(AdditionalPrefStrings.BREAK_TYPE_NEXT_LINE);
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
			}
			else {
				prefString +=				"<label><input class='shortcut_modifier_ctrlCmd' type='checkbox' title='{{TITLE_CTRL}}' />{{MODIFIER_CONTROL_CMD}}</label>+";
			}
			prefString +=					"<label><input class='shortcut_modifier_shift' type='checkbox' title='{{TITLE_SHIFT}}' />{{MODIFIER_SHIFT}}</label>+";
			prefString +=					"<label><input class='shortcut_modifier_alt' type='checkbox' title='{{TITLE_ALT}}' />{{MODIFIER_ALT}}</label>+";
			if (_platform === "mac") {
				prefString +=				"<label><input class='shortcut_modifier_ctrl' type='checkbox' title='{{TITLE_CTRL}}' />{{MODIFIER_CONTROL}}</label>+";
			}
			prefString +=					"<input class='shortcut_modifier_char' type='text' maxlength='1' size='1' title='{{TITLE_CHARACTER}}' />";
			prefString +=				"</div>";// close modifiers
			prefString +=			"</div>";// close preference container
            prefString +=			"<button class='btn' data-button-id='clear'>{{BTN_CLEAR}}</button>";// clear button
			prefString +=		"</td>";
			prefString +=	"</tr>";
		}
	}
	
    while (_preferencePanel.indexOf("{{HTML_FORMAT_EXTENSION_PATH}}") !== -1) {
        _preferencePanel = _preferencePanel.replace("{{HTML_FORMAT_EXTENSION_PATH}}", ExtensionUtils.getModuleUrl(module));
    }
    
	_preferencePanel = _preferencePanel.replace("<tr id=\"shortcuts\"></tr>", prefString);
	_preferenceHTML = Mustache.render(_preferencePanel, Strings);
	
	
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	// FUNCTIONS
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Generates the style needed based on the parameter.
	* @param {!string} style - The style to be checked for.
	* @private
	*/
	function _getStyle(style) {
		if (style === "bold" || style === "b" || style === "strong") {
			style = "font-weight:bold;";
		}
		else if (style === "italic" || style === "i" || style === "em") {
			style = "font-style:italic;";
		}
		else if (style === "underline" || style === "u") {
			style = "text-decoration:underline;";
		}
		else if (style === "strikethrough" || style === "s") {
			style = "text-decoration:line-through;";
		}
		else if (style === "monospace" || style === "tt") {
			style = "font-family:'Courier New', Courier, 'Lucida Console', Monaco, monospace;";// cover off on Windows, then Mac
		}
		
		return style;
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Checks if the cursor is within a style attribute. If it is, attempt to convert tag or style into inline style.
	* @param {!string} style - The style that should be added. Can be blank just to check if the cursor is within an inline style attribute.
	* @private
	*/
	function _checkIfWithinInlineStyle(style) {
		var entireLine = _currentDoc.getLine(_editor.getCursorPos().line);
		var styles;
		var styleStart = 0;
		var styleEnd;
		var styleString = "";
		var closingQuote;
		var cursorPos = _editor.getCursorPos().ch;
		
        // loop through all styles on the current line and stop once the one the cursor is within is found
		while (styleStart !== -1) {
            styleStart = entireLine.indexOf("style=", styleStart);
            
			if (styleStart !== -1) {
				closingQuote = entireLine.charAt(entireLine.indexOf("style=") + 6);// get quote type, single or double
				styleStart += 7;// offset to start within the style attribute
				styleEnd = entireLine.indexOf(closingQuote, styleStart);
				styleString = entireLine.substring(styleStart, styleEnd);
				styles = {start:styleStart, end:styleEnd, style:styleString};
                
                if (cursorPos >= styles.start && cursorPos <= styles.end) {
                    break;
                }
			}
		}
		
        // if styles is undefined or the style about to be added is already in the style attribute
        if (styles === undefined || styleString.indexOf(style) !== -1) {
            return true;
        }
        
        if (cursorPos >= styles.start && cursorPos <= styles.end) {
            if (style.length !== 0) {
                var index = (cursorPos === styles.start) ? styles.start - 1 : -1;

                // if not -1, meaning cursor was at beginning of the style, add a space to the string after the ";"
                if (index !== -1) {
                    style = style + " ";
                }

                // else the cursor is not at the beginning of the style attribute
                else {
                    var styleMod = "";
                    // set index to the last character of the styles
                    index = (cursorPos === styles.end) ? styles.end - 1 : -1;

                    // if index is -1, cursor was not at end of styles string. search for the closest ";" appearing before the cursor
                    if (index === -1) {
                        index = entireLine.lastIndexOf(";", cursorPos);
                    }
                    // cursor is at end of styles string and ";" was not detected at the end of the styles
                    else if (entireLine.charAt(index) !== ";") {
                        styleMod = ";";
                    }

                    // if index is -1, cursor was placed in middle of the first/only style
                    if (index === -1 || index < styles.start) {
                        index = entireLine.indexOf(";", cursorPos);
                    }

                    // if index is -1, no ";" was found and you are a bad coder.
                    if (index === -1 || index > styles.end) {
                        index = styles.start-1;
                    }

                    // if index is not at the start, set style equal to styleMod + space + style, else set style equal to style + space
                    if (index !== styles.start-1) {
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
		
		return true;
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Checks to see if the provided tag is on the list of tags that should not surround a tag of the same type.
	* @param {!string} tag - The tag to check to see if it should not be doubled
	* @private
	*/
	function _shouldTagNotDouble(tag) {
		var tags = ["b", "strong", "i", "em", "u", "a", "p", "h1", "h2", "h3", "h4", "h5", "h6", "header", "nav", 
					"main", "section", "article", "aside", "footer", "s", "tt", "code", "var", "samp", "kbd", "cite", "dfn", 
					"del", "ins", "<!-- -->"];
		return (tags.indexOf(tag) !== -1) ? true : false;
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Generates an HTML tag based on the param received.
	* @param {!string} tag - The HTML tag that should be used to check for doubles
	* @param {?number} startIndex - The starting index position to use when getting the tag open index.
	* @returns {!boolean} Whether or not the tag being inserted at the current position would be surrounded by the same tag.
	* @private
	*/
	function _checkForDoubles(tag, startIndex) {
		startIndex = (startIndex) ? startIndex : 0;
		var lineString = _currentDoc.getRange({line:_editor.getCursorPos().line, ch:0}, {line:_editor.getCursorPos().line+1, ch:0});
		var openTag = "<" + tag + ">";
		var closeTag = "</" + tag + ">";
		var tagOpenIndex = lineString.indexOf(openTag, startIndex);
		
		// if the tag about to be inserted was found to already be present in the current line of HTML markup
		if (tagOpenIndex !== -1) {
			var tagCloseIndex = lineString.indexOf(closeTag, (tagOpenIndex + openTag.length));
			
			// if the closing tag was found in the line of markup that the current insert was to be added to
			if (tagCloseIndex !== -1) {
				// closing tag was found right in front of the position of where the new tag was to be added
				if ((tagCloseIndex + closeTag.length) <= ((_selection) ? _selection.start.ch : _editor.getCursorPos().ch)) {
					
					tagOpenIndex = lineString.indexOf(openTag, (tagCloseIndex + closeTag.length));
					
					// more of the same tag were found in the current line of markup, so do search again to be certain that the insert point isn't within an existing tag of the same kind
					if (tagOpenIndex !== -1) {
						return _checkForDoubles(tag, tagOpenIndex);
					}
					else {
						return false;
					}
				}
				else {
					return true;
				}
			}
			// Opening tag matching the tag attempting to insert was found in front of the cursor position and closing tag could not be found on this line. Assume double.
			else if (tagOpenIndex < _editor.getCursorPos().ch) {
				return true;
			}
		}
		else {
			return false;
		}
	}
	
	//------------------------------------------------------------------------------------------------------------//
	function _checkIfInsideTag() {
		var entireLine = _currentDoc.getLine(_editor.getCursorPos().line);
		var cursorPos = _editor.getCursorPos().ch;
		var lessThanIndex = entireLine.lastIndexOf("<", cursorPos-1);
		var greaterThanIndex = entireLine.indexOf(">", lessThanIndex);
		
		if (lessThanIndex !== -1 && lessThanIndex <= cursorPos && greaterThanIndex !== -1 && greaterThanIndex >= cursorPos) {
			return true;
		}
		else {
			return false;
		}
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Generates an HTML tag based on the param received.
	* @param {!string} tag - The HTML tag that should be generated
	* @return {!boolean} Whether or not the tag can be added.
	* @private
	*/
	function _addTag(tag, isSelfClosing) {
		_currentDoc = DocumentManager.getCurrentDocument();
		_editor = EditorManager.getCurrentFullEditor();
		_lng = 0;// reset selected text length
		
		var canAdd = (tag === "<!-- -->" || tag === "") ? true : _checkIfWithinInlineStyle(_getStyle(tag));
		
		if (canAdd === true && _checkIfInsideTag() === false) {
			var shouldNotDouble = _shouldTagNotDouble(tag);
			
			// if copy is highlighted, surround copy in HTML tag.
			if (_editor.hasSelection()) {
				_selection = _editor.getSelection();// get selection object that contains start and end objects that contain line number and character position of selected text
				_lng = _selection.end.ch - _selection.start.ch;
				var selectedText = _editor.getSelectedText();// get the selected text as a string
				
				// if the tag is one that should not double and is a tag that is already present, do nothing, otherwise add tag
				if (shouldNotDouble === false || (shouldNotDouble === true && _checkForDoubles(tag) === false)) {
					if (tag === "") {
						_currentDoc.replaceRange("<" + tag + ">" + selectedText + "</" + tag + ">", _selection.start, _selection.end, _emptyTagBatch);
					}
					else if (!isSelfClosing) {
						_currentDoc.replaceRange("<" + tag + ">" + selectedText + "</" + tag + ">", _selection.start, _selection.end);
					}
					else {
						_currentDoc.replaceRange("<" + tag + ">" + selectedText, _selection.start, _selection.end);
					}
				}
				
				if (tag !== "") {
					_editor.setSelection({line:_selection.start.line, ch:_selection.start.ch}, _editor.getCursorPos());// highlight text plus newly added tag
				}
			}
			
			// otherwise, insert HTML tag at cursor location and position the cursor in between the opening/closing tag
			else {
				if (shouldNotDouble === false || (shouldNotDouble === true && _checkForDoubles(tag) === false)) {
					_currentDoc.replaceRange("<" + tag + ">" + "</" + tag + ">", _editor.getCursorPos());
					_editor.setCursorPos(_editor.getCursorPos().line, _editor.getCursorPos().ch - tag.length - 3);// -3 is to move the cursor within the space of the newly added tag
				}
			}
		}
		else {
			return false;
		}
		
		// clear out variable references if not using the _insertEmptyTag() method.
		if (tag !== "") {
			_currentDoc = null;
			_editor = null;
			_selection = null;
			_lng = 0;
		}
		
		return true;
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Generates an HTML <span> tag with a text style based on the style param received.
	* @param {!string} style - The type of style that should be applied to the <span> tag being generated
	* @private
	*/
	function _addSpanStyle(style) {
		_currentDoc = DocumentManager.getCurrentDocument();
		_editor = EditorManager.getCurrentFullEditor();
		
		var canAdd = _checkIfWithinInlineStyle(_getStyle(style));
		
		if (canAdd === true) {
			var tagStart = "<span style=";
			var styleToAdd = _getStyle(style);
			var tagEnd = "</span>";
			
			if (_editor.hasSelection()) {
				_selection = _editor.getSelection();
				_currentDoc.replaceRange(tagStart + "\"" + styleToAdd + "\"" + ">" + _editor.getSelectedText() + tagEnd, _selection.start, _selection.end);
				_editor.setSelection({line:_selection.start.line, ch:(_selection.start.ch)}, _editor.getCursorPos());
			}
			else {
				_currentDoc.replaceRange(tagStart + "\"" + styleToAdd + "\"" + ">" + tagEnd, _editor.getCursorPos());
				_editor.setCursorPos(_editor.getCursorPos().line, _editor.getCursorPos().ch - tagEnd.length);
			}
		}
		
		_currentDoc = null;
		_editor = null;
		_selection = null;
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Removes the Keyboard event listener for the _insertEmptyTag() method once the "Enter" key has been pressed.
	* @private
	*/
	function _disposeAddTagListeners() {
		KeyBindingManager.removeGlobalKeydownHook(_insertEmptyTagKeyboardListener);
		
		if (_hasLineBreakKeyboardListener === false) {
			_hasLineBreakKeyboardListener = true;
			KeyBindingManager.addGlobalKeydownHook(_lineBreakKeyboardListener);
		}
		
		_editor.off("cursorActivity");
		_lng = 0;
		_currentDoc = null;
		_currentPos = null;
		_editor = null;
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Keyboard event listener function to capture key presses. Used for generating an open and close HTML tag. 
	* Pressing enter releases key press capture.
	* @param {!object} event - The event data from the keyboard event.
	* @private
	*/
	function _insertEmptyTagKeyboardListener(event) {
		// get the current position of the cursor after the empty tag has been created
		_currentPos = _editor.getCursorPos();
		
		// If key pressed is the Enter key (13) or the Escape key (27), empty tag action is complete so dispose of keyboard event.
		if (event.keyCode === 13 || event.keyCode === 27) {
			event.preventDefault();
			event.stopPropagation();
			_disposeAddTagListeners();
		}
		
		// if a key that was pressed is a letter, allow it to go through and duplicate it in the closing tag.
		else if (event.keyCode > 64 && event.keyCode < 91) {
			_currentDoc.replaceRange(String.fromCharCode(event.keyCode).toLowerCase(), {line:_currentPos.line, ch:_currentPos.ch + _lng + 3}, null, _emptyTagBatch);
			_emptyTagPos.open.end = {line:_currentPos.line, ch:_emptyTagPos.open.start.ch + 3 + _lng};
			_emptyTagPos.close.start = {line:_currentPos.line, ch:_emptyTagPos.open.end.ch};
			_emptyTagPos.close.end = {line:_currentPos.line, ch:_emptyTagPos.close.start.ch + 4 + _lng};
			
			_lng += 1;
		}
		
		// If backspace deleting and the tag is just greater/less-than signs before backspace, stop empty tag action. Otherwise, delete character.
		else if (event.keyCode === 8) {
			if (_lng !== -1) {
				_currentDoc.replaceRange("", {line:_currentPos.line, ch:_currentPos.ch + _lng + 2}, {line:_currentPos.line, ch:_currentPos.ch + _lng + 3}, _emptyTagBatch);
				_emptyTagPos.open.end = {line:_currentPos.line, ch:_emptyTagPos.open.start.ch + 1 + _lng};
				_emptyTagPos.close.start = {line:_currentPos.line, ch:_emptyTagPos.open.end.ch};
				_emptyTagPos.close.end = {line:_currentPos.line, ch:_emptyTagPos.close.start.ch + 2 + _lng};
			}
			else {
				_disposeAddTagListeners();
			}
			
			_lng -= 1;
		}
		
		// If forward deleting and the tag is just greater/less-than signs, stop empty tag action. Otherwise, delete character.
		else if (event.keyCode === 46) {
			if (_lng !== -1) {
				_currentDoc.replaceRange("", {line:_currentPos.line, ch:_currentPos.ch + _lng + 3}, {line:_currentPos.line, ch:_currentPos.ch + _lng + 4}, _emptyTagBatch);
				_emptyTagPos.open.end = {line:_currentPos.line, ch:_emptyTagPos.open.start.ch + 2 + _lng};
				_emptyTagPos.close.start = {line:_currentPos.line, ch:_emptyTagPos.open.end.ch};
				_emptyTagPos.close.end = {line:_currentPos.line, ch:_emptyTagPos.close.start.ch + 2 + _lng};
			}
			else {
				_disposeAddTagListeners();
			}
			
			_lng -= 1;
		}
		
		// If the shortcut Control/Command + Z is pressed, end empty tag action.
		else if (event.keyCode === 90 && (event.ctrlKey || event.metaKey)) {
			_disposeAddTagListeners();
		}
		
		// If the key pressed is the up or down arrow key, end empty tag action.
		else if (event.keyCode === 38 || event.keyCode === 40) {
			_disposeAddTagListeners();
		}
		
		// If the key pressed is the left arrow key, check cursor position. if cursor position is outside the open tag, end empty tag action.
		// Because this is a keyDown event, we must check to see what the character behind the cursor currently is
		else if (event.keyCode === 37 && _currentDoc.getRange({line:_currentPos.line, ch:_currentPos.ch - 1}, _currentPos) === "<") {
			_disposeAddTagListeners();
		}
		
		// If the key pressed is the right arrow key, check cursor position. if cursor position is outside the open tag, end empty tag action.
		// Because this is a keyDown event, we must check to see what the character ahead of the cursor currently is
		else if (event.keyCode === 39 && _currentDoc.getRange(_currentPos,{line:_currentPos.line, ch:_currentPos.ch + 1}) === ">") {
			_disposeAddTagListeners();
		}
		
		// If any other key pressed and is not the left or right arrow key, go overboard to prevent normal behavior
		else if (event.keyCode !== 37 && event.keyCode !== 39) {
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
			return false;
		}
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Listener for the cursor changing position while in the empty tag action. If the cursor leaves the open tag, 
	* end the empty tag action.
	* @param {!object} event - The event data for the cursor change event.
	* @private
	*/
	function _onCursorChange(event) {
		_editor = EditorManager.getCurrentFullEditor();
		_currentPos = _editor.getCursorPos();
		
		if (_currentPos.line !== _emptyTagPos.open.start.line || ((_currentPos.ch < _emptyTagPos.open.start.ch || _currentPos.ch > _emptyTagPos.open.end.ch) && _currentPos.line !== _emptyTagPos.open.start.line)) {
			_disposeAddTagListeners();
		}
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Uses _addTag() method to insert empty tag and gets Brackets ready for the user to begin typing to capture input
	* @private
	*/
	function _insertEmptyTag() {
		var canContinue = _addTag("");
		
		if (canContinue === false) {
			_currentDoc = null;
			_editor = null;
			_selection = null;
			_lng = 0;
			
			return false;// return to terminate rest of function
		}
		
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
		// REMOVE? _emptyTagPos.open.start = {line:curPos.line, ch:curPos.ch - 2};
		// REMOVE? _emptyTagPos.open.end = {line:curPos.line, ch:curPos.ch};
		
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
		
		if (_hasLineBreakKeyboardListener === true) {
			_hasLineBreakKeyboardListener = false;
			KeyBindingManager.removeGlobalKeydownHook(_lineBreakKeyboardListener);
		}
		
		KeyBindingManager.addGlobalKeydownHook(_insertEmptyTagKeyboardListener);
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Creates the string representation of the array of keyboard shortcut keys to use for a keyboard shortcut
	* @param {!array} shortcutArray - The array of shortcut codes.
	* @return {!string} The stringified version of the keyboard shortcut.
	* @private
	*/
	function _getShortcutString(shortcutArray) {
		var string = ""; // create string to be used for the keyboard shortcut
		shortcutArray.forEach(function(value, index) {
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
	* Generate keyboard shortcut for the menu items in the HTML Format menu.
	* @param {!array} shortcutArray - The array of shortcut codes.
	* @return {!array} An array containing an object in the format that is required of the menu system to have keyboard shortcuts attached to commands.
	* @private
	*/
	function _generateShortcut(shortcutArray) {
		var string = _getShortcutString(shortcutArray);
		var arr;
		
		if (string !== "") {
			arr = [{"key":string, "platform":_platform}];
		}
		else {
			arr = [];
		}
		
		return arr;
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Modify default right-click menu selection action.
	* @param {!object} event - The event data for the context menu about to open.
	* @private
	*/
	function _onBeforeContextMenuOpen(event) {
		var selection = EditorManager.getCurrentFullEditor().getSelection();
		
		if (selection.end.ch - selection.start.ch <= 2) {
			EditorManager.getCurrentFullEditor().setCursorPos(selection.end.line, selection.end.ch);
		}
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Adds all menu items to menu bar and enabled hotkeys when editing an HTML document.
	* @private
	*/
	function _addMenuItems() {
		// Add HTML Format menu to menu bar
		if (_htmlFormatMenu === null || _htmlFormatMenu === undefined) {
			_htmlFormatMenu = Menus.addMenu(Strings.TITLE_MENU, HTML_FORMAT_MENU_COMMAND_ID, Menus.BEFORE, Menus.AppMenuBar.FIND_MENU);
			
			// add some of the options to the right-click menu
			if (_addRightClick === true) {
				_rightClickMenuDivider = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuDivider();
				Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(BOLD_COMMAND_ID);
				Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(ITALIC_COMMAND_ID);
				Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(UNDERLINE_COMMAND_ID);
				//Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).on("beforeContextMenuOpen", _onBeforeContextMenuOpen);
			}
			
			// BOLD, ITALIC, UNDERLINE
			_htmlFormatMenu.addMenuItem(BOLD_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.BOLD_TAG)), Menus.LAST);
			_htmlFormatMenu.addMenuItem(BOLD_STYLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.BOLD_STYLE)), Menus.AFTER, BOLD_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(ITALIC_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.ITALIC_TAG)), Menus.AFTER, BOLD_STYLE_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(ITALIC_STYLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.ITALIC_STYLE)), Menus.AFTER, ITALIC_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(UNDERLINE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.UNDERLINE_TAG)), Menus.AFTER, ITALIC_STYLE_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(UNDERLINE_STYLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.UNDERLINE_STYLE)), Menus.AFTER, UNDERLINE_COMMAND_ID);
			
			// Recording the divider object that addMenuDivider() returns for use with adding the next menu item to the menu.
			// This fixes the issue Windows 10 seems to have once you add more then 17 items to a menu.
			var menuDivider1 = _htmlFormatMenu.addMenuDivider(Menus.AFTER, UNDERLINE_STYLE_COMMAND_ID);
			
			// ANCHOR, PARAGRAPH, H1-6
			_htmlFormatMenu.addMenuItem(ANCHOR_TAG_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.ANCHOR_TAG)), Menus.AFTER, menuDivider1.dividerId);
			_htmlFormatMenu.addMenuItem(PARAGRAPH_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.PARAGRAPH_TAG)), Menus.AFTER, ANCHOR_TAG_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(H1_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.H1_TAG)), Menus.AFTER, PARAGRAPH_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(H2_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.H2_TAG)), Menus.AFTER, H1_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(H3_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.H3_TAG)), Menus.AFTER, H2_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(H4_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.H4_TAG)), Menus.AFTER, H3_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(H5_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.H5_TAG)), Menus.AFTER, H4_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(H6_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.H6_TAG)), Menus.AFTER, H5_COMMAND_ID);
			
			var menuDivider2 = _htmlFormatMenu.addMenuDivider(Menus.AFTER, H6_COMMAND_ID);
			
			// SPAN, DIV, HTML5 structure tags
			_htmlFormatMenu.addMenuItem(SPAN_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.SPAN_TAG)), Menus.AFTER, menuDivider2.dividerId);
			_htmlFormatMenu.addMenuItem(DIV_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.DIV_TAG)), Menus.AFTER, SPAN_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(HEADER_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.HEADER_TAG)), Menus.AFTER, DIV_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(NAV_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.NAV_TAG)), Menus.AFTER, HEADER_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(MAIN_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.NAV_TAG)), Menus.AFTER, NAV_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(SECTION_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.SECTION_TAG)), Menus.AFTER, MAIN_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(ARTICLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.ARTICLE_TAG)), Menus.AFTER, SECTION_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(ASIDE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.ASIDE_TAG)), Menus.AFTER, ARTICLE_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(FOOTER_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.FOOTER_TAG)), Menus.AFTER, ASIDE_COMMAND_ID);
			
			var menuDivider3 = _htmlFormatMenu.addMenuDivider(Menus.AFTER, FOOTER_COMMAND_ID);
			
			// TABLE tags --- currently makes menu too long for a 1080p screen
			/*_htmlFormatMenu.addMenuItem(TABLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.TABLE_TAG)), Menus.AFTER, menuDivider3.dividerId);
			_htmlFormatMenu.addMenuItem(TABLE_HEADER_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.TABLE_HEADER_TAG)), Menus.AFTER, TABLE_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(TABLE_BODY_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.TABLE_BODY_TAG)), Menus.AFTER, TABLE_HEADER_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(TABLE_FOOTER_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.TABLE_FOOTER_TAG)), Menus.AFTER, TABLE_BODY_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(ROW_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.ROW_TAG)), Menus.AFTER, TABLE_FOOTER_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(COLUMN_HEADER_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.COLUMN_HEADER_TAG)), Menus.AFTER, ROW_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(COLUMN_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.COLUMN_TAG)), Menus.AFTER, COLUMN_HEADER_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(CAPTION_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.CAPTION_TAG)), Menus.AFTER, COLUMN_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(COLUMN_GROUP_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.COLUMN_GROUP_TAG)), Menus.AFTER, CAPTION_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(COLUMN_PROP_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.COLUMN_PROP_TAG)), Menus.AFTER, COLUMN_GROUP_COMMAND_ID);
			
			var menuDivider4 = _htmlFormatMenu.addMenuDivider(Menus.AFTER, COLUMN_PROP_COMMAND_ID);*/
			
			// STRIKE, TELETYPE
			_htmlFormatMenu.addMenuItem(STRIKE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.STRIKE_TAG)), Menus.AFTER, menuDivider3.dividerId);// change to menuDivider4 when adding tables
			_htmlFormatMenu.addMenuItem(STRIKE_STYLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.STRIKE_STYLE)), Menus.AFTER, STRIKE_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(TELETYPE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.TELETYPE_TAG)), Menus.AFTER, STRIKE_STYLE_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(TELETYPE_STYLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.TELETYPE_TAG)), Menus.AFTER, TELETYPE_COMMAND_ID);
			
			var menuDivider5 = _htmlFormatMenu.addMenuDivider(Menus.AFTER, TELETYPE_STYLE_COMMAND_ID);
			
			// CODE, VARIABLE, SAMPLE, KEYBOARD
			_htmlFormatMenu.addMenuItem(CODE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.CODE_TAG)), Menus.AFTER, menuDivider5.dividerId);
			_htmlFormatMenu.addMenuItem(VARIABLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.VARIABLE_TAG)), Menus.AFTER, CODE_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(SAMPLE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.SAMPLE_TAG)), Menus.AFTER, VARIABLE_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(KEYBOARD_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.KEYBOARD_TAG)), Menus.AFTER, SAMPLE_COMMAND_ID);
			
			var menuDivider6 = _htmlFormatMenu.addMenuDivider(Menus.AFTER, KEYBOARD_COMMAND_ID);
			
			// CITATION, DEFINITION, DELETED, INSERTED
			_htmlFormatMenu.addMenuItem(CITATION_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.CITATION_TAG)), Menus.AFTER, menuDivider6.dividerId);
			_htmlFormatMenu.addMenuItem(DEFINITION_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.DEFINITION_TAG)), Menus.AFTER, CITATION_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(DELETED_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.DELETED_TAG)), Menus.AFTER, DEFINITION_COMMAND_ID);
			_htmlFormatMenu.addMenuItem(INSERTED_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.INSERTED_TAG)), Menus.AFTER, DELETED_COMMAND_ID);
			
			var menuDivider7 = _htmlFormatMenu.addMenuDivider(Menus.AFTER, INSERTED_COMMAND_ID);
			
			// INSERT EMPTY TAG
			_htmlFormatMenu.addMenuItem(INSERT_TAG_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.EMPTY_TAG)), Menus.AFTER, menuDivider7.dividerId);
			//_htmlFormatMenu.addMenuItem(HTML_COMMENT_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.HTML_COMMENT)), Menus.AFTER, INSERT_TAG_COMMAND_ID);
			
			//var menuDivider8 = _htmlFormatMenu.addMenuDivider(Menus.AFTER, HTML_COMMENT_COMMAND_ID);
			var menuDivider8 = _htmlFormatMenu.addMenuDivider(Menus.AFTER, INSERT_TAG_COMMAND_ID);
			
			// HTML FORMAT PREFERENCS
			_htmlFormatMenu.addMenuItem(PREFERENCE_COMMAND_ID, _generateShortcut(_preferences.get(PreferenceStrings.PREFERENCES)), Menus.AFTER, menuDivider8.dividerId);
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
			Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).removeMenuDivider(_rightClickMenuDivider.id);
			Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).removeMenuItem(BOLD_COMMAND_ID);
			Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).removeMenuItem(ITALIC_COMMAND_ID);
			Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).removeMenuItem(UNDERLINE_COMMAND_ID);
			Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).off("beforeContextMenuOpen");
			_rightClickMenuDivider = null;
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
	* @param {!string} target - The id of the HTML element to get preference values for.
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
		arr.push($("#" + target + " .shortcut_modifiers .shortcut_modifier_char").prop("value"));
		
		return arr;
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Used for checking changed preferences against saved ones
	* @param {!string} target - The id of the HTML element to check its current preference options against other HTML Format preferences already set.
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
			$("#btn_save_reload").css("background-color", "#cc0000");
			$("#btn_save_reload").css("border-color", "#550000");
			_duplicateShortcuts = true;
		}
		else {
			$("#btn_save").css("background-color", "");
			$("#btn_save").css("border-color", "");
			$("#btn_save_reload").css("background-color", "");
			$("#btn_save_reload").css("border-color", "");
			_duplicateShortcuts = false;
		}
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Update HTML Format Preferences panel content to display the saved preferences
	* @param {!string} target - The id value from the PreferenceStrings matching the HTML in the Preference popup window
	* @param {!array} pref - The array containing all the preference options being used by that command, if any
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
	* @param {!string} target - The id value from the PreferenceStrings matching the HTML in the Preference popup window
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
		
		$("#extensions input").prop("value", _extensions);
		$("#boldStrong input").prop("checked", _boldUsesStrong);
		$("#italicEm input").prop("checked", _italicUsesEm);
		$("#rightClick input").prop("checked", _addRightClick);
		$("#breakType input").prop("checked", _breakType);
		$("#breakTypeNextLine input").prop("checked", _breakTypeNextLine);
		
		// loop through all the preference keys in PreferenceStrings and update the HTML in the Preference popup window to 
		// display their current saved preference values
		var prefStringProp;
		for (prefStringProp in PreferenceStrings) {
			if (PreferenceStrings.hasOwnProperty(prefStringProp)) {
				_updatePreferenceHTML(PreferenceStrings[prefStringProp], _preferences.get(PreferenceStrings[prefStringProp]));
			}
		}
		
		// listen for keypresses and checkboxes on any of the form elements within the preference panel
		$("#preferenceForm").on("change", function(e) {
			if (e.target.type === "checkbox" && $(e.target.parentElement.parentElement).hasClass("bold_italic") === false) {
				_checkCurrentPrefernces(e.target.parentElement.parentElement.parentElement.getAttribute("id"));
			}
		});
		
		$("#preferenceForm").on("keyup", function(e) {
			if (e.target.type === "text" && e.target.parentElement.id !== "extensions") {
				//if (true) {
					// shortcut_modifier_ctrlCmd
					// shortcut_modifier_shift
					// shortcut_modifier_alt
					// shortcut_modifier_ctrl
					// e.target.parentElement.getElementsByTagName("label");
				//}
				
				// If the character is a letter, display it as uppercase since that is what is shown in the menu bar
				if (e.keyCode > 64 && e.keyCode < 91) {
					e.target.value = String.fromCharCode(e.keyCode).toUpperCase();
					_checkCurrentPrefernces(e.target.parentElement.parentElement.getAttribute("id"));
				}
				// else if the character is a number on the numpad or number row
				else if ((e.keyCode > 47 && e.keyCode < 58) || (e.keyCode > 95 && e.keyCode < 106)) {
					_checkCurrentPrefernces(e.target.parentElement.parentElement.getAttribute("id"));
				}
				// else if the character is any of the other characters on the keyboard without the 
				// use of CTRL, SHIFT, ALT, or any combination of the three
				else if ((e.keyCode > 185 && e.keyCode < 193) || (e.keyCode > 218 && e.keyCode < 223)) {
					_checkCurrentPrefernces(e.target.parentElement.parentElement.getAttribute("id"));
				}
				else {
					e.preventDefault();
				}
			}
		});
		
		$("#preferenceForm").on("click", function(e) {
            if (e.target.className === "btn") {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                _updatePreferenceHTML(e.target.previousElementSibling.id, _defaultTagStyleShortcut);
                return false;
            }
            
			if (e.target.type === "text" && e.target.className.indexOf("shortcut_modifier_char") !== -1) {
				e.target.select();
			}
		});
		
		$("#btn_cancel").on("click", function(e) {
			$("#preferenceForm").off("change");
			$("#preferenceForm").off("keyup");
			$("#preferenceForm").off("click");
			$("#btn_cancel").off("click");
			$("#btn_save").off("click");
			$("#btn_save_reload").off("click");
		});
		
		$("#btn_save, #btn_save_reload").on("click", function(e) {
			_preferences.set(AdditionalPrefStrings.EXTENSIONS, $("#extensions input").prop("value"));
			_preferences.set(AdditionalPrefStrings.BOLD_USES_STRONG, $("#boldStrong input").prop("checked"));
			_preferences.set(AdditionalPrefStrings.ITALIC_USES_EM, $("#italicEm input").prop("checked"));
			_preferences.set(AdditionalPrefStrings.ADD_RIGHT_CLICK, $("#rightClick input").prop("checked"));
			_preferences.set(AdditionalPrefStrings.BREAK_TYPE, $("#breakType input").prop("checked"));
			_preferences.set(AdditionalPrefStrings.BREAK_TYPE_NEXT_LINE, $("#breakTypeNextLine input").prop("checked"));
			
			_extensions = _preferences.get(AdditionalPrefStrings.EXTENSIONS);
			_boldUsesStrong = _preferences.get(AdditionalPrefStrings.BOLD_USES_STRONG);
			_italicUsesEm = _preferences.get(AdditionalPrefStrings.ITALIC_USES_EM);
			_addRightClick = _preferences.get(AdditionalPrefStrings.ADD_RIGHT_CLICK);
			_breakType = _preferences.get(AdditionalPrefStrings.BREAK_TYPE);
			_breakTypeNextLine = _preferences.get(AdditionalPrefStrings.BREAK_TYPE_NEXT_LINE);
			
			if (_duplicateShortcuts === false) {
				var prefStringProp;
				for (prefStringProp in PreferenceStrings) {
					if (PreferenceStrings.hasOwnProperty(prefStringProp)) {
						_setPreferenceValues(PreferenceStrings[prefStringProp]);
					}
				}
				
				$("#preferenceForm").off("change");
				$("#preferenceForm").off("keyup");
				$("#preferenceForm").off("click");
				$("#btn_cancel").off("click");
				$("#btn_save").off("click");
				$("#btn_save_reload").off("click");
				
				// save preferences
				PreferencesManager.save();
				
				// tell brackets to reload with extensions so preference changes take place
				if (this.id === "btn_save_reload") {
					CommandManager.execute(Commands.APP_RELOAD);
				}
			}
			else {
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				alert("Duplicate keyboard shortcuts left unresolved.\nSave did not happen.");
			}
		});
	}
	
	//------------------------------------------------------------------------------------------------------------//
	/**
	* Listen to global keyboard input and detect "Shift" + "ENTER" being pressed for adding in a break tag in HTML documents.
	* @param {!object} event - The event data from the keyboard event.
	* @private
	*/
	function _lineBreakKeyboardListener(event) {
		// If key pressed is the Enter key (13) and the shift key is being held down and the file being viewed is an HTML document.
		if (event.keyCode === 13 && event.shiftKey && _extensions.indexOf(_fileExtension) !== -1) {
			_currentDoc = DocumentManager.getCurrentDocument();// get the current document
			_editor = EditorManager.getCurrentFullEditor();// get the editor
			
			//alert(Editor.getUseTabChar());
			//alert(Editor.getTabSize());
			// get number of tabs/spaces on the line and add them to the next line
			
			var tabInsert = "";
			if (_breakTypeNextLine === true) {
				var lineString = _currentDoc.getLine(_editor.getCursorPos().line);
				var numTabs = 0;
				var tabIndex = 0;
				var tabChar = ((Editor.getUseTabChar() === true) ? "\t" : " ");
				var i = 0;

				while (true) {
					if (lineString.charAt(i) === tabChar) {
						numTabs += 1;
					}
					else {
						break;
					}

					i += 1;

					if (i > 1000) {
						break;
					}
				}

				i = 0;
				while (i < numTabs) {
					tabInsert += tabChar;
					i += 1;
				}
			}
			
			var breakType = "<br />";
			
			if (_breakType === true || _currentDoc.getText().toLowerCase().indexOf("<!doctype html>") !== -1) {
				breakType = "<br>";
			}
			if (_breakTypeNextLine === true) {
				breakType += "\n" + tabInsert;
			}
			
			_currentDoc.replaceRange(breakType, _editor.getCursorPos());
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
			
			_currentDoc = null;
			_editor = null;
			return false;
		}
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
		//console.log("_onCurrentFileChange(\n\te = " + e + "\n\tnewFile = " + newFile + "\n\tnewPaneId = " + newPaneId + "\n\toldFile = " + oldFile + "\n\toldPaneId = " + oldPaneId + "\n)");
		if (newFile) {
			_fileExtension = FileUtils.getFileExtension(newFile.toString().toLowerCase()).replace("]","");
			
			if (_extensions.indexOf(_fileExtension) !== -1) {
				if (_htmlFormatMenu === null) {
					_addMenuItems();

					if (_hasLineBreakKeyboardListener === false) {
						_hasLineBreakKeyboardListener = true;
						KeyBindingManager.addGlobalKeydownHook(_lineBreakKeyboardListener);
					}
				}
			}
			else if (_htmlFormatMenu !== null) {
				_removeMenuItems();
				
				if (_hasLineBreakKeyboardListener === true) {
					_hasLineBreakKeyboardListener = false;
					KeyBindingManager.removeGlobalKeydownHook(_lineBreakKeyboardListener);
				}
			}
		}
		// If no file is open and the HTML Format menu is currently visible, remove it
		else if (MainViewManager.getAllOpenFiles().length === 0 && _htmlFormatMenu) {
			_removeMenuItems();
			
			if (_hasLineBreakKeyboardListener === true) {
				_hasLineBreakKeyboardListener = false;
				KeyBindingManager.removeGlobalKeydownHook(_lineBreakKeyboardListener);
			}
		}
	}
	
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	// FINAL SETUP - add commands and event listener for file change
	//--------------------------------------------------------------------------------------------------------------------------------------------//
	
	/**
	* Registers a command with the CommandManager and adds that command to an array for later enabling/disabling depending on the file being viewed.
	* @param {!string} label - The label that should be displayed in the HTML Format menu
	* @param {!string} id - The unique command id that should be assigned to this command.
	* @param {!function} func - The function that should be called when this command is executed through the HTML Format menu.
	* @private
	*/
	function registerCommand(label, id, func) {
		_commands.push(CommandManager.register(label, id, func));
	}
	
	//------------------------------------------------------------------------------------------------------------//
	registerCommand(Strings.LABEL_BOLD_TAG_SHORTCUT, BOLD_COMMAND_ID, function() {_addTag((_boldUsesStrong === true) ? "strong" : "b");});
	registerCommand(Strings.LABEL_BOLD_STYLE_SHORTCUT, BOLD_STYLE_COMMAND_ID, function() {_addSpanStyle("bold");});
	registerCommand(Strings.LABEL_ITALIC_TAG_SHORTCUT, ITALIC_COMMAND_ID, function() {_addTag((_italicUsesEm === true) ? "em" : "i");});
	registerCommand(Strings.LABEL_ITALIC_STYLE_SHORTCUT, ITALIC_STYLE_COMMAND_ID, function() {_addSpanStyle("italic");});
	registerCommand(Strings.LABEL_UNDERLINE_TAG_SHORTCUT, UNDERLINE_COMMAND_ID, function() {_addTag("u");});
	registerCommand(Strings.LABEL_UNDERLINE_STYLE_SHORTCUT, UNDERLINE_STYLE_COMMAND_ID, function() {_addSpanStyle("underline");});
	
	//------------------------------------------------------------------------------------------------------------//
	registerCommand(Strings.LABEL_ANCHOR_TAG_SHORTCUT, ANCHOR_TAG_COMMAND_ID, function() {_addTag("a");});
	registerCommand(Strings.LABEL_PARAGRAPH_TAG_SHORTCUT, PARAGRAPH_COMMAND_ID, function() {_addTag("p");});
	registerCommand(Strings.LABEL_H1_TAG_SHORTCUT, H1_COMMAND_ID, function() {_addTag("h1");});
	registerCommand(Strings.LABEL_H2_TAG_SHORTCUT, H2_COMMAND_ID, function() {_addTag("h2");});
	registerCommand(Strings.LABEL_H3_TAG_SHORTCUT, H3_COMMAND_ID, function() {_addTag("h3");});
	registerCommand(Strings.LABEL_H4_TAG_SHORTCUT, H4_COMMAND_ID, function() {_addTag("h4");});
	registerCommand(Strings.LABEL_H5_TAG_SHORTCUT, H5_COMMAND_ID, function() {_addTag("h5");});
	registerCommand(Strings.LABEL_H6_TAG_SHORTCUT, H6_COMMAND_ID, function() {_addTag("h6");});
	
	//------------------------------------------------------------------------------------------------------------//
	registerCommand(Strings.LABEL_SPAN_TAG_SHORTCUT, SPAN_COMMAND_ID, function() {_addTag("span");});
	registerCommand(Strings.LABEL_DIV_TAG_SHORTCUT, DIV_COMMAND_ID, function() {_addTag("div");});
	registerCommand(Strings.LABEL_HEADER_TAG_SHORTCUT, HEADER_COMMAND_ID, function() {_addTag("header");});
	registerCommand(Strings.LABEL_NAV_TAG_SHORTCUT, NAV_COMMAND_ID, function() {_addTag("nav");});
	registerCommand(Strings.LABEL_MAIN_TAG_SHORTCUT, MAIN_COMMAND_ID, function() {_addTag("main");});
	registerCommand(Strings.LABEL_SECTION_TAG_SHORTCUT, SECTION_COMMAND_ID, function() {_addTag("section");});
	registerCommand(Strings.LABEL_ARTICLE_TAG_SHORTCUT, ARTICLE_COMMAND_ID, function() {_addTag("article");});
	registerCommand(Strings.LABEL_ASIDE_TAG_SHORTCUT, ASIDE_COMMAND_ID, function() {_addTag("aside");});
	registerCommand(Strings.LABEL_FOOTER_TAG_SHORTCUT, FOOTER_COMMAND_ID, function() {_addTag("footer");});
	
	//------------------------------------------------------------------------------------------------------------//
	/*registerCommand(Strings.LABEL_TABLE_TAG_SHORTCUT, TABLE_COMMAND_ID, function() {_addTag("table");});
	registerCommand(Strings.LABEL_TABLE_HEADER_TAG_SHORTCUT, TABLE_HEADER_COMMAND_ID, function() {_addTag("thead");});
	registerCommand(Strings.LABEL_TABLE_BODY_TAG_SHORTCUT, TABLE_BODY_COMMAND_ID, function() {_addTag("tbody");});
	registerCommand(Strings.LABEL_TABLE_FOOTER_TAG_SHORTCUT, TABLE_FOOTER_COMMAND_ID, function() {_addTag("tfoot");});
	registerCommand(Strings.LABEL_ROW_TAG_SHORTCUT, ROW_COMMAND_ID, function() {_addTag("tr");});
	registerCommand(Strings.LABEL_COLUMN_HEADER_TAG_SHORTCUT, COLUMN_HEADER_COMMAND_ID, function() {_addTag("th");});
	registerCommand(Strings.LABEL_COLUMN_TAG_SHORTCUT, COLUMN_COMMAND_ID, function() {_addTag("td");});
	registerCommand(Strings.LABEL_CAPTION_TAG_SHORTCUT, CAPTION_COMMAND_ID, function() {_addTag("caption");});
	registerCommand(Strings.LABEL_COLUMN_GROUP_TAG_SHORTCUT, COLUMN_GROUP_COMMAND_ID, function() {_addTag("colgroup");});
	registerCommand(Strings.LABEL_COLUMN_PROP_TAG_SHORTCUT, COLUMN_PROP_COMMAND_ID, function() {_addTag("col", true);});*/
	
	//------------------------------------------------------------------------------------------------------------//
	registerCommand(Strings.LABEL_STRIKE_TAG_SHORTCUT, STRIKE_COMMAND_ID, function() {_addTag("s");});
	registerCommand(Strings.LABEL_STRIKE_STYLE_SHORTCUT, STRIKE_STYLE_COMMAND_ID, function() {_addSpanStyle("strikethrough");});
	registerCommand(Strings.LABEL_TELETYPE_TAG_SHORTCUT, TELETYPE_COMMAND_ID, function() {_addTag("tt");});
	registerCommand(Strings.LABEL_TELETYPE_STYLE_SHORTCUT, TELETYPE_STYLE_COMMAND_ID, function() {_addSpanStyle("monospace");});
	
	//------------------------------------------------------------------------------------------------------------//
	registerCommand(Strings.LABEL_CODE_TAG_SHORTCUT, CODE_COMMAND_ID, function() {_addTag("code");});
	registerCommand(Strings.LABEL_VARIABLE_TAG_SHORTCUT, VARIABLE_COMMAND_ID, function() {_addTag("var");});
	registerCommand(Strings.LABEL_SAMPLE_TAG_SHORTCUT, SAMPLE_COMMAND_ID, function() {_addTag("samp");});
	registerCommand(Strings.LABEL_KEYBOARD_TAG_SHORTCUT, KEYBOARD_COMMAND_ID, function() {_addTag("kbd");});
	
	//------------------------------------------------------------------------------------------------------------//
	registerCommand(Strings.LABEL_CITATION_TAG_SHORTCUT, CITATION_COMMAND_ID, function() {_addTag("cite");});
	registerCommand(Strings.LABEL_DEFINITION_TAG_SHORTCUT, DEFINITION_COMMAND_ID, function() {_addTag("dfn");});
	registerCommand(Strings.LABEL_DELETED_TAG_SHORTCUT, DELETED_COMMAND_ID, function() {_addTag("del");});
	registerCommand(Strings.LABEL_INSERTED_TAG_SHORTCUT, INSERTED_COMMAND_ID, function() {_addTag("ins");});
	
	//------------------------------------------------------------------------------------------------------------//
	registerCommand(Strings.LABEL_EMPTY_TAG_SHORTCUT, INSERT_TAG_COMMAND_ID, _insertEmptyTag);
	//registerCommand(Strings.LABEL_HTML_COMMENT_SHORTCUT, HTML_COMMENT_COMMAND_ID, function() {_addTag("<!-- -->");});
	
	//------------------------------------------------------------------------------------------------------------//
	registerCommand(Strings.LABEL_PREFERENCES_SHORTCUT, PREFERENCE_COMMAND_ID, _openPreferencesPanel);
	
	//------------------------------------------------------------------------------------------------------------//
	MainViewManager.on("currentFileChange", _onCurrentFileChange);
});