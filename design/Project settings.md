Project settings
================

23 Nov 23

Aims
----
- Store local settings associated with each Project for use by the Studio and other tools

Needs
-----

- Settings are persistent
- Settings are local and not committed to Git
- Settings can/should be copied with the directory eg if transferred OPFS to user disk
- Each tool can store its own settings for each project
- Tools can access via the injected Editor interface
- Editor Runner can access

Forces
------

- More flexible if accessible by other tools outside browser
- More flexible if tools can use each other's settings
- Less safe if tools can use each other's settings
- May want settings treated as private to each tool
- Future uses difficult to foresee
- Better to only have one reader/write for each file

Possibilities
-------------

- Disk file with project, ignored for Git
- Local storage or IDB

Decisions
---------

- This is an object with an arbitrary structure
- Tools can access all settings
- Each Tool should put its own settings in a sub-object with a unique key
- Editor Controller interface has GetSettings/UpdateSettings with a settingsName param
- This is linked to an interface implemented by ProjectHandler
- Which is implemented by creating/accessing the settings.json file in the project directory
- ProjectHandler will provide a synchronous interface to the settings interface, by initialising a write-through cache before first use
- Write the .gitignore and empty settings.json in EditorManager.newProject
