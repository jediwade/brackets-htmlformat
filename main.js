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
/*global define, $, brackets */

define(function (require, exports, module) {
	'use strict';
	
	console.log("INITIALIZING HTML FORMAT EXTENSION");
	
    //--------------------------------------------------------------------------------------------------------------------------------------------//
    // BRACKETS CONSTANTS
    //--------------------------------------------------------------------------------------------------------------------------------------------//
	var CommandManager = brackets.getModule("command/CommandManager");
	var Menus = brackets.getModule("command/Menus");
	var DocumentManager = brackets.getModule("document/DocumentManager");
	var EditorManager = brackets.getModule("editor/EditorManager");
    var KeyBindingManager = brackets.getModule("command/KeyBindingManager");
    var MainViewManager = brackets.getModule("view/MainViewManager");
    var FileUtils = brackets.getModule("file/FileUtils");
    
    
    //--------------------------------------------------------------------------------------------------------------------------------------------//
    // CONTSTANTS
    //--------------------------------------------------------------------------------------------------------------------------------------------//
	
    //------------------------------------------------------------------------------------------------------------//
    var BOLD_MENU_NAME = "Bold - tag";
	var BOLD_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.boldText";
    
    var BOLD_STYLE_MENU_NAME = "Bold - style";
	var BOLD_STYLE_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.boldStyle";
    
    var ITALICIZE_MENU_NAME = "Italic - tag";
	var ITALICIZE_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.italicizeText";
    
    var ITALICIZE_STYLE_MENU_NAME = "Italic - style";
	var ITALICIZE_STYLE_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.italicizeStyle";
    
    var UNDERLINE_MENU_NAME = "Underline - tag";
	var UNDERLINE_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.underlineText";
    
    var UNDERLINE_STYLE_MENU_NAME = "Underline - style";
	var UNDERLINE_STYLE_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.underlineStyle";
    
    //------------------------------------------------------------------------------------------------------------//
    var STRIKE_MENU_NAME = "Strikethrough - tag";
	var STRIKE_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.strikeText";
    
    var STRIKE_STYLE_MENU_NAME = "Strikethrough - style";
	var STRIKE_STYLE_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.strikeStyle";
    
    var TELETYPE_MENU_NAME = "Teletype - tag";
	var TELETYPE_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.teletypeText";
    
    var TELETYPE_STYLE_MENU_NAME = "Teletype - style";
	var TELETYPE_STYLE_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.teletypeStyle";
    
    //------------------------------------------------------------------------------------------------------------//
    var CODE_MENU_NAME = "Code";
	var CODE_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.codeText";
    
    var VARIABLE_MENU_NAME = "Variable";
	var VARIABLE_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.variableText";
    
    var SAMPLE_MENU_NAME = "Sample";
	var SAMPLE_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.sampleText";
    
    var KEYBOARD_MENU_NAME = "Keyboard";
	var KEYBOARD_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.keyboardText";
    
    //------------------------------------------------------------------------------------------------------------//
    var CITATION_MENU_NAME = "Citation";
	var CITATION_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.citationText";
    
    var DEFINITION_MENU_NAME = "Definition";
	var DEFINITION_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.definitionText";
    
    var DELETED_MENU_NAME = "Deleted";
	var DELETED_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.deletedText";
    
    var INSERTED_MENU_NAME = "Inserted";
	var INSERTED_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.insertedText";
    
    //------------------------------------------------------------------------------------------------------------//
    var INSERT_TAG_MENU_NAME = "Insert empty tag";
    var INSERT_TAG_COMMAND_ID = "wadedwalker.brackets.extension.htmlFormat.insertTag";
    
    
    //--------------------------------------------------------------------------------------------------------------------------------------------//
    // VARIABLES
    //--------------------------------------------------------------------------------------------------------------------------------------------//
    
    /**
    * Menu bar containing all the format options.
    * @type {Menu}
    * @private
    */
    var _htmlFormatMenu;
    
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
        
        if (_editor.hasSelection()) {
            _selection = _editor.getSelection();
            _lng = _selection.end.ch - _selection.start.ch;
            _currentDoc.replaceRange("<" + tag + ">" + _editor.getSelectedText() + "</" + tag + ">", _selection.start, _selection.end);
            _editor.setSelection({line: _selection.start.line, ch: (_selection.start.ch)}, _editor.getCursorPos());
        } else {
            _currentDoc.replaceRange("<" + tag + ">" + "</" + tag + ">", _editor.getCursorPos());
            _editor.setCursorPos(_editor.getCursorPos().line, _editor.getCursorPos().ch - tag.length - 3);
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
        else if (style === "italicize") {
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
	}
    
    //------------------------------------------------------------------------------------------------------------//
    /**
    * Call _addTag() with a bold tag
    * @private
    */
    function _boldTag() {
        _addTag("strong");
    }
    /**
    * Call _addTag() with an italic tag
    * @private
    */
    function _italicizeTag() {
        _addTag("em");
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
    function _italicizeStyle() {
        _addSpanStyle("italicize");
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
    * Removes the Keyboard event listener for the addTag() method once the "Enter" key has been pressed.
    * @private
    */
    function _disposeKeyboardListener(listener, event) {
        KeyBindingManager.removeGlobalKeydownHook(listener);
        event.preventDefault();
        event.stopPropagation();
    }
    
    //------------------------------------------------------------------------------------------------------------//
    /**
    * Keyboard event listener function to capture key presses. Used for generating an open and close HTML tag. 
    * Pressing enter releases key press capture.
    * @private
    */
    function _keyboardListener(event) {
        // get the current position of the cursor after the blank tag has been created
        _currentPos = _editor.getCursorPos();
        
        // If key pressed is the Enter key, addTag action is complete so dispose of keyboard event.
        if (event.keyCode === 13) {
            _lng = 0;
            _disposeKeyboardListener(_keyboardListener, event);
        }
        
        // if a key that was pressed is a letter, allow it to go through and duplicate it in the closing tag.
        else if (event.keyCode > 64 && event.keyCode < 91) {
            _lng += 1;
            _currentDoc.replaceRange(String.fromCharCode(event.keyCode).toLowerCase(), {line: _currentPos.line, ch: _currentPos.ch + _lng + 2});
        }
        
        // If backspace deleting and the tag is just greater/less-than signs, stop addTag action. Otherwise, delete character.
        else if (event.keyCode === 8) {
            _lng -= 1;
            
            if (_lng !== 0) {
                _currentDoc.replaceRange("", {line: _currentPos.line, ch: _currentPos.ch + _lng + 3}, {line: _currentPos.line, ch: _currentPos.ch + _lng + 4});
            }
            else {
                _disposeKeyboardListener(_keyboardListener, event);
            }
        }
        
        // If forward deleting and the tag is just greater/less-than signs, stop addTag action. Otherwise, delete character.
        else if (event.keyCode === 46) {
            _lng -= 1;
            
            if (_lng !== 0) {
                _currentDoc.replaceRange("", {line: _currentPos.line, ch: _currentPos.ch + _lng + 4}, {line: _currentPos.line, ch: _currentPos.ch + _lng + 5});
            }
            else {
                _disposeKeyboardListener(_keyboardListener, event);
            }
        }
        
        // If any other key pressed is not the left or right arrow key, prevent normal behavior
        else if (event.keyCode !== 37 && event.keyCode !== 39) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
    
    //------------------------------------------------------------------------------------------------------------//
    /**
    * Uses _addTag() method to insert blank tag and gets Brackets ready for the user to begin typing to capture input
    * @private
    */
    function _blankTag() {
        _addTag("");
        
        // If length is zero, the move the cursor back 1 space to be inside the blank open tag
        if (_lng === 0) {
            _editor.setCursorPos(_editor.getCursorPos().line, _editor.getCursorPos().ch - 1);
        }
        
        // If length is not zero, the move the cursor back 4 (></>) spaces + the length of the highlighted word to be inside the blank open tag
        else {
            _editor.setCursorPos(_editor.getCursorPos().line, _editor.getCursorPos().ch - (4 + _lng));
        }
        
        KeyBindingManager.addGlobalKeydownHook(_keyboardListener);
    }
    
    //------------------------------------------------------------------------------------------------------------//
    /**
    * Adds all menu items to menu bar and enabled hotkeys
    * @private
    */
    function _addMenuItems() {
        // Add HTML Format menu to menu bar
        _htmlFormatMenu = Menus.addMenu("HTML Format", "wadedwalker.brackets.extension.htmlFormat.htmlFormatMenu", Menus.BEFORE, Menus.AppMenuBar.FIND_MENU);
        
        // Add all menu options
        _htmlFormatMenu.addMenuItem(BOLD_COMMAND_ID, [{ "key": "Ctrl-B", "platform": "win"}, { "key": "Cmd-B", "platform": "mac"}], Menus.LAST);
        _htmlFormatMenu.addMenuItem(BOLD_STYLE_COMMAND_ID, [{ "key": "Ctrl-Shift-B", "platform": "win"}, { "key": "Cmd-Shift-B", "platform": "mac"}], Menus.LAST);
        _htmlFormatMenu.addMenuItem(ITALICIZE_COMMAND_ID, [{ "key": "Ctrl-I", "platform": "win"}, { "key": "Cmd-I", "platform": "mac"}], Menus.LAST);
        _htmlFormatMenu.addMenuItem(ITALICIZE_STYLE_COMMAND_ID, [{ "key": "Ctrl-Shift-I", "platform": "win"}, { "key": "Cmd-Shift-I", "platform": "mac"}], Menus.LAST);
        _htmlFormatMenu.addMenuItem(UNDERLINE_COMMAND_ID, [{ "key": "Ctrl-U", "platform": "win"}, { "key": "Cmd-U", "platform": "mac"}], Menus.LAST);
        _htmlFormatMenu.addMenuItem(UNDERLINE_STYLE_COMMAND_ID, [{ "key": "Ctrl-Shift-U", "platform": "win"}, { "key": "Cmd-Shift-U", "platform": "mac"}], Menus.LAST);
        
        _htmlFormatMenu.addMenuDivider();
        
        _htmlFormatMenu.addMenuItem(STRIKE_COMMAND_ID, [], Menus.LAST);
        _htmlFormatMenu.addMenuItem(STRIKE_STYLE_COMMAND_ID, [], Menus.LAST);
        _htmlFormatMenu.addMenuItem(TELETYPE_COMMAND_ID, [], Menus.LAST);
        _htmlFormatMenu.addMenuItem(TELETYPE_STYLE_COMMAND_ID, [], Menus.LAST);
        
        _htmlFormatMenu.addMenuDivider();
        
        _htmlFormatMenu.addMenuItem(CODE_COMMAND_ID, [], Menus.LAST);
        _htmlFormatMenu.addMenuItem(VARIABLE_COMMAND_ID, [], Menus.LAST);
        _htmlFormatMenu.addMenuItem(SAMPLE_COMMAND_ID, [], Menus.LAST);
        _htmlFormatMenu.addMenuItem(KEYBOARD_COMMAND_ID, [], Menus.LAST);
        
        _htmlFormatMenu.addMenuDivider();
        
        _htmlFormatMenu.addMenuItem(CITATION_COMMAND_ID, [], Menus.LAST);
        _htmlFormatMenu.addMenuItem(DEFINITION_COMMAND_ID, [], Menus.LAST);
        _htmlFormatMenu.addMenuItem(DELETED_COMMAND_ID, [], Menus.LAST);
        _htmlFormatMenu.addMenuItem(INSERTED_COMMAND_ID, [], Menus.LAST);
        
        _htmlFormatMenu.addMenuDivider();
        
        _htmlFormatMenu.addMenuItem(INSERT_TAG_COMMAND_ID, [{ "key": "Ctrl-T", "platform": "win"}, { "key": "Cmd-T", "platform": "mac"}], Menus.LAST);
        
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
        // Remove HTML Format menu from menu bar and set variable reference to null
        Menus.removeMenu("wadedwalker.brackets.extension.htmlFormat.htmlFormatMenu");
        _htmlFormatMenu = null;
        
        // Disable all hotkey commands
        _commands.forEach(function(command) {
            command.setEnabled(false);
        });
    }
    
    //------------------------------------------------------------------------------------------------------------//
    /**
    * Listen for changes to which file is open for editing. If it is an HTML file, enable menu bar items and 
    * hotkeys, otherwise disable if not already. NOTE: Currently this is broken if using more than 1 Brackets window. 
    * Switching between windows does not bring back HTML Format menu even if the document that was switched to is an HTML document.
    * @private
    */
    function _onCurrentFileChange(e, newFile, newPaneId, oldFile, oldPaneId) {
        if (newFile !== null) {
            var ext = FileUtils.getFileExtension(newFile.toString().toLowerCase());
            
            if (_htmlFormatMenu === null && (ext.indexOf("htm") !== -1 || ext.indexOf("php") !== -1 || ext.indexOf("asp") !== -1)) {
                _addMenuItems();
            }
            else if (_htmlFormatMenu !== null) {
                _removeMenuItems();
            }
        }
    }
    
    
	//--------------------------------------------------------------------------------------------------------------------------------------------//
    // FINAL SETUP - add commands and event listener for file change
    //--------------------------------------------------------------------------------------------------------------------------------------------//
    
    //------------------------------------------------------------------------------------------------------------//
    _commands.push(CommandManager.register(BOLD_MENU_NAME, BOLD_COMMAND_ID, _boldTag));
	_commands.push(CommandManager.register(BOLD_STYLE_MENU_NAME, BOLD_STYLE_COMMAND_ID, _boldStyle));
    _commands.push(CommandManager.register(ITALICIZE_MENU_NAME, ITALICIZE_COMMAND_ID, _italicizeTag));
    _commands.push(CommandManager.register(ITALICIZE_STYLE_MENU_NAME, ITALICIZE_STYLE_COMMAND_ID, _italicizeStyle));
    _commands.push(CommandManager.register(UNDERLINE_MENU_NAME, UNDERLINE_COMMAND_ID, _underlineTag));
    _commands.push(CommandManager.register(UNDERLINE_STYLE_MENU_NAME, UNDERLINE_STYLE_COMMAND_ID, _underlineStyle));
    
    //------------------------------------------------------------------------------------------------------------//
    _commands.push(CommandManager.register(STRIKE_MENU_NAME, STRIKE_COMMAND_ID, _strikeTag));
    _commands.push(CommandManager.register(STRIKE_STYLE_MENU_NAME, STRIKE_STYLE_COMMAND_ID, _strikeStyle));
    _commands.push(CommandManager.register(TELETYPE_MENU_NAME, TELETYPE_COMMAND_ID, _teletypeTag));
    _commands.push(CommandManager.register(TELETYPE_STYLE_MENU_NAME, TELETYPE_STYLE_COMMAND_ID, _teletypeStyle));
    
    //------------------------------------------------------------------------------------------------------------//
    _commands.push(CommandManager.register(CODE_MENU_NAME, CODE_COMMAND_ID, _codeTag));
    _commands.push(CommandManager.register(VARIABLE_MENU_NAME, VARIABLE_COMMAND_ID, _variableTag));
    _commands.push(CommandManager.register(SAMPLE_MENU_NAME, SAMPLE_COMMAND_ID, _sampleTag));
    _commands.push(CommandManager.register(KEYBOARD_MENU_NAME, KEYBOARD_COMMAND_ID, _keyboardTag));
    
    //------------------------------------------------------------------------------------------------------------//
    _commands.push(CommandManager.register(CITATION_MENU_NAME, CITATION_COMMAND_ID, _citationTag));
    _commands.push(CommandManager.register(DEFINITION_MENU_NAME, DEFINITION_COMMAND_ID, _definitionTag));
    _commands.push(CommandManager.register(DELETED_MENU_NAME, DELETED_COMMAND_ID, _deletedTag));
    _commands.push(CommandManager.register(INSERTED_MENU_NAME, INSERTED_COMMAND_ID, _insertedTag));
    
    //------------------------------------------------------------------------------------------------------------//
    _commands.push(CommandManager.register(INSERT_TAG_MENU_NAME, INSERT_TAG_COMMAND_ID, _blankTag));
    
    _onCurrentFileChange(null, DocumentManager.getCurrentDocument.file, null, null, null)
    
    $(MainViewManager).on("currentFileChange", _onCurrentFileChange);
});
