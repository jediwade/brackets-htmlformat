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
	"TITLE"		: "HTML Format extension for Brackets",
	"CONTENT"	: "Thank you for trying out HTML Format extension for Brackets. HTML Format makes Brackets a bit friendlier when working in HTML documents by adding the HTML Format menu to the menu bar and providing customizable keyboard shortcuts.<br><br><strong>So what the does the HTML Format extension actually do, and keyboard shortcuts for what?</strong><br><br>The menu added to the menu bar contains a long list of HTML tags that can be inserted where the cursor currently is. Each of those tags that can be inserted have the option of assigning a keyboard shortcut to it. Any keyboard shortcut assigned (or modified) will: 1) require reloading Brackets to make them work and 2) can override keyboard shortcuts built into Brackets.<br><br>If there is text highlighted, it will add the tag around the text. If the tag you are adding is stylable and the cursor is within an inline style attribute, it will convert that tag into a style. If the tag is something that shouldn't double up (like bold or italic tags), it won't allow it to be added. You have the option of adding Bold, Italicize, and Underline to the right-click menu. For bold and italic, you can choose if it will use &lt;strong&gt; vs &lt;b&gt; and &lt;em&gt; vs &lt;i&gt;. Lastly, there is the Shift + Enter keyboard shortcut to add in a break tag where the cursor is. The break tag option can also insert a line break that will try to match your tabs/spaces of the previous line and there is an option to prefer &lt;br&gt; vs &lt;br /&gt;. The preferences for HTML Format can be accessed using the default keyboard shortcut of CTRL+Shift+, or at the bottom of the HTML Format menu in the menu bar.",
	"BTN_CLOSE"	: "Close"
});