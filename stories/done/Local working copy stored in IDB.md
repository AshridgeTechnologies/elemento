Local working copy stored in IDB
================================

Aims
----

- Project file is persisted in IDB
- Groundwork for other GitHub stories

Requirements
------------

- ✅ Editor has IDB filesystem
- ✅ Separate directory for each project
- ✅ Project file is stored in its directory
- ✅ New menu option creates a new directory and starting project file
- ✅ Name entered for new project and validated - no special characters, not in use, not empty
- ✅ Open allows user to pick from list of directories
- ✅ Save option changed to Export
- ✅ Changes are saved automatically every few seconds

Desirable
---------
- Project name tracks store name, renames store name when changed
- ✅ Display project name in title bar
- Re-open last project when refresh page
- ✅ Cancel option on Open picker
- ✅ No projects available message
- Unobtrusive visual indication when changes saved - in title bar?
- ✅ Can still save project to file
- Can still import project from file as new project

Technical Notes
---------------

- Use isomorphic-git/lightning-fs
- One file system for all projects

Tasks
-----

- ✅ Refactor ProjectHandler to separate project updating, project save/load and publish
- ✅ ProjectWorkingCopy interface?
- ✅ ProjectStore interface?
- ✅ IDB filesystem implementation of ProjectStore
- ✅ New project requires name
- ✅ Open shows menu to pick project to open
- ✅ Project changes update automatically
- ✅ Save option does nothing/removed/becomes export option