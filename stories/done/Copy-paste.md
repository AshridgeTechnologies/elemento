Copy-paste
==========

Aims
----

- Users can copy and paste parts of apps as in other tools

Requirements
------------

- ✅ Copy a project or any part of it as JSON with menu command
- ✅ Copy multiple selected parts as an array
- ✅ Paste single or multiple JSON items into the project with menu command
- ✅ Paste after, before or inside an item
- ✅ Validate all items valid in that position
- ✅ Alert if any not valid
- ✅ Paste JSON from other projects
- ✅ Paste JSON not coming directly from Elemento
- ✅ Cut instead of copy
- ✅ On paste, ids are all reassigned throughout the tree, names are left alone even if duplicate
- ✅ Duplicate an item

Desirable but not sure how to implement
---------------------------------------
- Copy with Ctrl/Cmd-C
- Paste after with Ctrl/Cmd-V

Technical implementation
------------------------

- ✅ Standard function for element to JSON
- ✅ insertElement => insertNewElement
- ✅ insert on project handler
- ✅ Project.insert takes insert position, target item id, a single or array of items, 
- ✅ Check all with canContain
- ✅ Refactor doInsert to take the new element as a param
- ✅ Rework createElement somehow to avoid duplicate functions
- ✅ Choose where to assign ids:  probably in doInsert
- ✅ Need to be able to get a copy with a new id from BaseElement
- ✅ Playwright test