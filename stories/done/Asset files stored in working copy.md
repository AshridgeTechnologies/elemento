Asset files stored in working copy
==================================

Aims
----

- Can have additional assets such as images in the project

Requirements
------------

- ✅ Files are seen as under the Project but not tied to one App
- ✅ Files tree under the Project
- ✅ Files are shown in alphabetical order
- ✅ Files cannot be reordered
- ✅ Cannot copy, paste, duplicate a File
- ✅ Can Upload a file under the File tree
- ✅ Can rename a file
- ✅ Can delete a file
- ✅ Allow for folders in the future
- ✅ Files stored in local working copy
- ✅ Files saved to GitHub
- ✅ Files updated from GitHub
- ✅ Renamed files treated sensibly by Git

Technical
---------

- ✅ Project has new element types File and FileFolder
- ✅ Project has fixed _FILES element (a FileFolder) after apps
- ✅ Files are added to Project object after construction
- ✅ Files are excluded from Project when saved - use a withoutFiles function
- ✅ Files has a different Context Menu - just Upload
  - Pass ActionsAvailableFn to AppStructureTree
  - Call this when generating Context menu
  - Editor passes in, gets actions from project.actionsAvailableForItem(itemId)
  - Project gets actions from model object.actionsAvailable()
- ✅ Editor Runner/ProjectHandler upload and manage the file, keep Project updated
- ✅ EditorRunner needs to handle File insert differently
  - Dialog to upload file
  - On completion of upload:
    - Store file data in working copy under name of loaded file
    - Create new File element and populate with name
    - Insert file element via ProjectHandler.insertNewElement with additional props
    - Return promise of new element id from onAction
-  
- ✅ Editor awaits new selected element id returned from onAction and selects it
- ✅ EditorRunner needs to do more work around ProjectHandler when a File renamed
- ✅ Renaming should be delayed until complete
- ✅ EditorRunner needs to do more work around ProjectHandler when a File deleted
- ✅ Exclude .git dir - or all .xxx dirs
- ✅ Ensure files are updated after GitHub update, with or without error
- ✅ Style upload nicely
- ✅ Stop other actions on files

Desirable
---------
- File preview in properties window
