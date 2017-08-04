brackets-htmlformat
==================

Brackets extension adding HTML Format commands to menu bar and common keyboard shortcuts.

The main purpose behind this extension was to add common hotkeys to insert Bold and Italic 
tags around highlighted copy in HTML documents. My coworkers started talking about Brackets 
and that I should use it. I gave it a shot, but the lack of common HTML hotkeys caused me to 
look into making an extension for adding in something that I use everyday.

## Known Issues

Using the Shift+Enter to insert a break tag can still function inside the \<head\> and inside 
HTML tags.

## Update History

#### Update - June 12, 2015
Added preference menu option to be able to set keyboard shortcuts for any of the HTML tags/styles 
or change the default keyboard shortcuts.

The issues with the add blank tag feature should be fixed. It is still, for me, a bit of a 
complicated thing to have figured out how to do so there may be issues present still or it 
may not be the best possible implementation of such a feature.


#### Update - June 18, 2015
Currently working on fixes for the preference menu when displayed using different themes other 
than the default light theme. Fixed the Control key being listed twice for Mac OS in preferences.
Fixed checking either Bold/Strong or Italic/Emphasis checkboxes triggering the duplicate 
keyboard shorcut warning.


#### Update - July 9, 2015
All issues that I have seen in the dev tools window of Brackets should be fixed. Because of 
this, the latest version of Brackets is required to ensure that it will work. Added a feature
that if the cursor is within an inline style and a tag or style is inserted, it will be 
automatically converted/added into the inline style attribute. If it was a tag that 
doesn't have a style equivalent, it is ignored and nothing will be added.


#### Update - July 26, 2015
Bug fixes and added bold, italic, and underline tags to the right-click menu. This feature must 
be enabled in the preferences and deselects the Brackets default selection of 1 to 2 characters 
at the cursor location when the right-click action occured.


#### Update - November 22, 2015
Bug fixes and more tags added to the format menu


#### Update - March 26, 2016
Preferences will trigger a Brackets reload with extensions when saving changes.


#### Update - April 15, 2016
Add anchor tag to list of elements. Fix bug that only older HTML tag/style items from drop down menu
could have keyboard shortcuts saved.


#### Update - April 17, 2016
More bug fixes related to preferences and going against my disdain for anonymous functions, I have 
changed the CommandManager.register() method to take an anonymous function calling _addTag() and 
_addSpanStyle(), passing the appropriate argument to make it function the same as before, but 
without dozens of functions doing the same thing.


#### Update - September 8, 2016
Requested feature to have H1–H6 and paragraph tags added to the drop-down menu has been granted and added.
Removing $.on() events with $.off() to be proper. When adding a tag around highlighted copy that already 
features that same tag on the outsides of the text selection, remove that outer tag if it is a tag that 
should not surround itself, i.e. two anchor tags.


#### Update - September 11, 2016
Trying to fix bugs with the shortcut/hotkey assignment with numbers.


#### Update - September 12, 2016
Added a quick fix for older versions of Brackets after I made changes to get rid of a deprecation warning.
This will probably be the last version update for older versions of Brackets.


#### Update - September 13, 2016
Bug fixes


#### Update - January 11, 2017
Adding in HTML5 tag "main", per user request. Requiring latest version of Brackets by having proper 
implementation of "Mustache". Removing HTML Format menu from the Menu bar when there are no files open.


#### Update - January 16, 2017
Fixed issue with the menu bar items not being in the correct order on Windows 10 after ~17 items were added. 
After ~17 items, the order would be in reverse from order added and all dividers would be at the bottom.


#### Update - July 23, 2017
Lots of changes in this release. Added the ability for the user to set which file extensions this Brackets 
extension will work in. Added Shift + Enter keyboard shortcut to insert a break tag, plus options related 
to that feature. The detection of same tags being inserted is improved. Code cleaned up a bit in some areas. 
Changed the file/folder structure to allow for different translations. Fix bugs with the HTML Format menu 
being removed when it shouldn't have been if the split editor view was being used. Added a Welcome screen. 
Added a What's New screen. Started adding Table tags but it just makes the HTML Format menu too tall for a 
1080p screen (and probably already too tall for laptop screens). Changed the file/folder structure to allow 
for different locale translations (would need help/volunteers to make new locales happen).

#### Update - August 3, 2017
Just changing my GitHub name/URL back to jediwade because the Brackets Extension Registry keeps track of 
who created what extension by their GitHub username and not their email address. I had changed my username 
to match my email and website, deciding to be a bit more professional, but I was then unable to update this 
Brackets extension. I emailed the Registry people but they still have not replied. Because this makes me 
fear that someone could just change their name to by mine and then delete the extension, I am reverting 
my GitHub username back and needing to change the URL in the package.json file.
