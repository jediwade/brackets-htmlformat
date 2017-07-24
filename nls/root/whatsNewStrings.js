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

/* jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50, eqeq: true, white: true */
/* global define */
/*
This JS file is used for setting the copy that appears in both the HTML Format Preference Window as well as the labels for the items in the HTML Format menu and right-click menu.
*/
define({
	"TITLE"		: "What's New in HTML Format",
	"CONTENT"	: "<h4>July 23, 2017</h4>Lots of behind-the-scenes updates to the code, some bug fixes, and a few new features. Complete list of updates below:<br><ul><li>This pop-up letting you know whats new!</li><li>Improving the detection of already existing tags when trying to insert the same tag (for bold, italic, anchor, headers, etc).</li><li>Properly handle adding/removing the HTML format menu when there are multiple files open at the same time through the split editor view.</li><li>Added insert break tag with Shift + Enter, plus some extra preferences related to this.</li><li>Ability to set which file extensions the HTML Format extension will work for instead of being the three hard-coded ones before (html, php, asp). Set this in the HTML Format preferences.</li><li>Started looking into the ability to add an HTML comment option the same way you add any other tag.</li><li>Added a new Save &amp; Reload button to the HTML Format preferences and made the Save button not force Brackets to reload.</li><li>Added a Clear button to each element tag in the HTML Format preferences to easily clear out an assigned keyboard shortcut.</li><li>Updated the HTML Format preference window to have a tabbed view.</li><li>Updated the styles for the HTML Format preferences window to always match the default theme.</li><li>Code clean-up and some restructuring that would enable this extension to support multiple locales (any volunteers?).</li>",
	"BTN_CLOSE"	: "Close"
});