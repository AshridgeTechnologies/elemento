Local working copy stored in IDB
================================

Aims
----

- Project file is persisted in IDB
- Groundwork for other GitHub stories

Requirements
------------

- Editor has IDB filesystem
- Separate directory for each project
- Project file is stored in its directory
- New menu option creates a new directory and starting project file
- Open allows user to pick from list of directories
- Save option removed
- Changes are saved automatically every few seconds

Desirable
---------
- Unobtrusive visual indication when changes saved

Technical Notes
---------------

- Use isomorphic-git/lightning-fs
- One file system for all projects