Project directory in disk files
===============================

Aims
----

- Developer can store project files in a disk filesystem folder
- So can be accessed with any standard tools
- No need for opaque in-browser filesystem and exports etc

Requirements
------------

- Each project is stored in a filesystem directory
- Open project shows a directory picker
- New project shows a directory picker
- Ask for readwrite mode on directory so user can provide all permissions in one go
- Save and Update with GitHub use the disk files
- Error if try to create a project in a directory with an existing ElementoProject.json
- Error if try to open a project in a directory with no ElementoProject.json
- IDB Local project store is removed

Technical
---------

- New project store implementation
- Base on Local project store
- Need an fs implementation that does just enough
- ProjectStore implementation will need the directory handle, not the project name
- So separate Project store for each project
- Functions like getProjectNames will not be available