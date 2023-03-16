Project directory in disk files
===============================

Aims
----

- Developer can store project files in a disk filesystem folder
- So can be accessed with any standard tools
- No need for opaque in-browser filesystem and exports etc

Requirements
------------

- ✅ Each project is stored in a filesystem directory
- ✅ Open project shows a directory picker
- ✅ New project shows a directory picker
- ✅ Ask for readwrite mode on directory so user can provide all permissions in one go
- ✅ Save and Update with GitHub use the disk files
- ✅ Error if try to create a project in a directory that is not empty
- ✅ Error if try to open a project in a directory with no ElementoProject.json
- ✅ IDB Local project store is removed
- ✅ Export option removed

Detailed requirements
---------------------

- ✅ New project shows a directory picker and checks it is empty
- ✅ Get from GitHub works
- ✅ Get from GitHub shows picker for directory
- ✅ Update from GitHub works
- ✅ Save to GitHub creating repo works
- ✅ Save to existing repo works
- ✅ Files directory is loaded correctly
- ✅ Upload to file directory works
- ✅ Upload to file directory shows up immediately in preview
- ✅ Rename of uploaded file works
- ✅ Delete uploaded file works
- ✅ All changes and renames saved to GitHub OK
- ✅ New and deleted and renamed files in update from GitHub work OK

Technical
---------

- ✅ New project store implementation
- ✅ Base on Local project store
- ✅ Need fs implementation that does just enough
- ✅ ProjectStore implementation will need the directory handle, not the project name
- ✅ So separate Project store for each project
- ✅ Functions like getProjectNames will not be available
- ✅ onOpen sets up new store
- ✅ onNew sets up new store


To do
-----

- ✅ Handle paths in getFileNames
- ✅ Use the new localProjectStore, not the previous one
- ✅ Check out path in exists() - GitProjectStore should not add local name to path
- ✅ Handle directories
- ✅ Debounce file writes
- ✅ Check out uploads, renames
- ✅ Test with GitHub
- 