Copy-paste
==========

Aims
----

- Users can copy and paste parts of apps as in other tools

Requirements
------------

- Copy a project or any part of it as JSON with menu command
- Copy with Ctrl/Cmd-C
- Copy multiple selected parts as an array
- Paste single or multiple JSON items into the project with menu command
- Paste after, before or inside an item
- Paste after with Ctrl/Cmd-V
- Validate all items valid in that position
- Alert if any not valid
- Paste JSON from other projects
- Paste JSON not coming directly from Elemento
- Cut instead of copy
- On paste, ids are all reassigned, names are left alone even if duplicate
- Duplicate an item

Technical implementation
------------------------

- Standard function for element to JSON
- insertElement => insertNewElement
- insert on project handler
- Project.insert takes insert position, target item id, a single or array of items, 
- Check all with canInsert
- Refactor doInsert to take the new element as a param
- Add doInsertNew to actually create the element
- Rework createElement somehow to avoid duplicate functions
- Choose where to assign ids:  probably in doInsert