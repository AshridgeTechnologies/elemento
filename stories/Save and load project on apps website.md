Save and load project on apps website
-------------------------------------

Aims
----
- The user can save and access projects on the apps website
- Retain the ability to use disk files for storage


Requirements
------------
- New File menu item: Save As...
- Save As... has sub-menu to choose Elemento Online or File
- Save As->Elemento Online is disabled if not logged in 
- Save As->Elemento Online shows dialog to confirm name, default to Project name, with Save and Cancel
- Save on dialog writes to projects/{userId}/{project name}
- File->Save is disabled if not saved yet
- File->Save always saves to existing cloud file immediately
- File->Save always saves to existing disk file immediately
- File->Open becomes Open file
- Projects are read and write only by user

Not included
------------

- Open from Elemento Online - use List files page instead
