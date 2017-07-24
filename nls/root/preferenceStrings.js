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
This JS file is for setting up the preferences for any option that appears in the HTML Format menu bar list. A for...in loop 
will be executed on this file to both generate the HTML for the Preference Window as well as setting the default preference 
values for each item so it wont be null when setting it later on.
*/
define({
	// Bold, Italic, Underline group
	"BOLD_TAG"					: "boldTag",
	"BOLD_STYLE"				: "boldStyle",
	"ITALIC_TAG"				: "italicTag",
	"ITALIC_STYLE"				: "italicStyle",
	"UNDERLINE_TAG"				: "underlineTag",
	"UNDERLINE_STYLE"			: "underlineStyle",
	
	// Anchor, Paragraph, Header group
	"ANCHOR_TAG"				: "anchorTag",
	"PARAGRAPH_TAG"				: "paragraphTag",
	"H1_TAG"					: "h1Tag",
	"H2_TAG"					: "h2Tag",
	"H3_TAG"					: "h3Tag",
	"H4_TAG"					: "h4Tag",
	"H5_TAG"					: "h5Tag",
	"H6_TAG"					: "h6Tag",
	
	// Span, Div, Structure group
	"SPAN_TAG"					: "spanTag",
	"DIV_TAG"					: "divTag",
	"HEADER_TAG"				: "headerTag",
	"NAV_TAG"					: "navTag",
	"MAIN_TAG"					: "mainTag",
	"SECTION_TAG"				: "sectionTag",
	"ARTICLE_TAG"				: "articleTag",
	"ASIDE_TAG"					: "asideTag",
	"FOOTER_TAG"				: "footerTag",
	
	// Table group --- currently makes menu too long for a 1080p screen
	/*"TABLE_TAG"					: "tableTag",
	"TABLE_HEADER_TAG"			: "tableHeaderTag",
	"TABLE_BODY_TAG"			: "tableBodyTag",
	"TABLE_FOOTER_TAG"			: "tableFooterTag",
	"ROW_TAG"					: "rowTag",
	"COLUMN_HEADER_TAG"			: "columnHeaderTag",
	"COLUMN_TAG"				: "columnTag",
	"CAPTION_TAG"				: "captionTag",
	"COLUMN_GROUP_TAG"			: "columnGroupTag",
	"COLUMN_PROP_TAG"			: "columnPropTag",*/
	
	// Additional formatting group
	"STRIKE_TAG"				: "strikeTag",
	"STRIKE_STYLE"				: "strikeStyle",
	"TELETYPE_TAG"				: "teletypeTag",
	"TELETYPE_STYLE"			: "teletypeStyle",
	
	// Phrase tags
	"CODE_TAG"					: "codeTag",
	"VARIABLE_TAG"				: "variableTag",
	"SAMPLE_TAG"				: "sampleTag",
	"KEYBOARD_TAG"				: "keyboardTag",
	
	// Markup, Modification group
	"CITATION_TAG"				: "citationTag",
	"DELETED_TAG"				: "deletedTag",
	"DEFINITION_TAG"			: "definitionTag",
	"INSERTED_TAG"				: "insertedTag",
	
	// Empty tag, Preference group
	"EMPTY_TAG"					: "emptyTag",
	//"HTML_COMMENT"				: "htmlComment",
	"PREFERENCES"				: "preferences"
});
