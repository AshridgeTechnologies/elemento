Design decisions
================

Server function paths
---------------------

- Problem: how should server function paths be formed?
- Decision: /capi/<server-app-name>/<function-name> for internal,  /api/etc for external
- Reasons:
  - api calls will be handled differently in most deployments
  - api calls will be handled differently in the preview service worker
  - internal and external apis will be handled differently

Image src URL adjustments
-------------------------

- Problem: To allow use of simple asset names, need to adjust for path to app root eg when run from GitHub
- Decision: place AppContext in a context provider in AppRunner, reference in Image to get adjusted URL
- Reasons: 
  - avoid generating deployment-specific code
  - avoid prop passing
  - keep knowledge of path prefix in one place

Renaming elements
-----------------
- Make this a deliberate action, only done when changes complete
- UI indicates renaming is in progress, acts when leave name field or press Enter
Reasons:
- User should know they are doing something with more consequences
- If elements, especially files, are renamed there is more work to do
- The work in renaming files will take time and would block if done for every keystroke

Asset files and Project file
----------------------------
- Will be added to Project object when it is loaded
- Will not be stored in JSON of Project object
Reasons:
- Do not want to have two persisted representations of files
- Want to deal with Project as a whole
- Project will be split into multiple files in the future - this is part of that

Icons and Icon buttons - 4 Aug 22
---------------------------------
Have one general Icon component, render as IconButton if it has an Action, plain Icon if not
- reduce the number of components devs need to learn
- avoid the need to either compose Icons within buttons, OR duplicate some props on both

Collection object ids - 14 Jul 22
---------------------
When adding an object without an id to a collection, generate an id and use it in the collection AND add it to the object
- without an id in the object, it is difficult to retrieve it from the collection again
- it is inconvenient to generate Ids in the formula
- the Id can still be overridden if needed
## Update 4 Aug 22
- Use lowercase id, not Id, and also use this in IdbDataStoreImpl as the primary key of the tables

Element paths/ids - 13 Jul 22
-------------
Use list item id in element path
- this allows transient state set on an item to stay with that item when the list changes 
- eg in Vocabulary Trainer: The Show button in the Learning list stays with its item as you set things to learned and the list changes

Tree controls
-------------
Use rc-tree for the editor tree as it is versatile and allows drag-drop
Use MUI TreeView for the help tree as it does not need drag-drop and it is easier to make consistent with the rest of the MUI controls

Selection and highlighting - 31 May 22 - reversed
--------------------------------------
Add source element id as a data attribute to root DOM element of a component, to support selection and highlighting
Forces: 
- element ids are moving too far away from the source tree with Lists and Layouts
- adding another attribute is another overhead
Decision: the overhead is justified by the complexity of making it work using the hierarchical ids
BUT on spiking this solution: 
- the overhead of the attribute runs through all our code and tests, not just the DOM in the page
- there are simple ways of working around ids not exactly matching the source hierarchy
New decision: adjust algorithms to find source element from id on page and vice versa
