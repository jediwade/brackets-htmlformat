brackets-htmlformat
==================

Brackets extension adding HTML Format commands to menu bar and common keyboard shortcuts.

The main purpose behind this extension was to add common hotkeys to insert Bold and Italic 
tags around highlighted copy in HTML documents. My coworkers started talking about Brackets 
and that I should use it. I gave it a shot, but the lack of common HTML hotkeys caused me to 
look into making an extension for adding in something that I use everyday.

This is my first Brackets extension and first GIT, so please go easy on me if I did it wrong.

==================
Update - June 12, 2015
Added preference menu option to be able to set keyboard shortcuts for any of the HTML tags/styles 
or change the default keyboard shortcuts.

The issues with the add blank tag feature should be fixed. It is still, for me, a bit of a 
complicated thing to have figured out how to do so there may be issues present still or it 
may not be the best possible implementation of such a feature.

==================
Update - June 18, 2015
Currently working on fixes for the preference menu when displayed using different themes other 
than the default light theme. Fixed the Control key being listed twice for Mac OS in preferences.
Fixed checking either Bold/Strong or Italic/Emphasis checkboxes triggering the duplicate 
keyboard shorcut warning.

==================
Update - July 9, 2015
All issues that I have seen in the dev tools window of Brackets should be fixed. Because of 
this, the latest version of Brackets is required to ensure that it will work. Added a feature
that if the cursor is within an inline style and a tag or style is inserted, it will be 
automatically converted/added into the inline style attribute. If it was a tag that 
doesn't have a style equivalent, it is ignored and nothing will be added.

==================
Update - July 26, 2015
Bug fixes and added bold, italic, and underline tags to the right-click menu. This feature must 
be enabled in the preferences and deselects the Brackets default selection of 1 to 2 characters 
at the cursor location when the right-click action occured.

==================
Update - November 22, 2015
Bug fixes and more tags added to the format menu

==================
Update - March 26, 2016
Preferences will trigger a Brackets reload with extensions when saving changes.

==================
Update - April 15, 2016
Add anchor tag to list of elements. Fix bug that only older HTML tag/style items from drop down menu
could have keyboard shortcuts saved.