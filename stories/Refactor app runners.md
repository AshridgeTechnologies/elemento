Refactor app runners
====================

Aims
----

- Clean up app running
- Allow types to be used in apps

Requirements
------------

- Generate a code file for each app that exports the app component (as now)
- Generate HTML runner file for each app that imports the runtime, the app and runs it
- DataTypes needed are included in each app code file
- The code file is named after the app
- The runner file for the first app is index.html, <appname>.html for the others
- The DataTypes files are named after their source DataTypes
- All code in same top-level directory - review later
- Files in files dir
- Runs in preview
- Runs from GitHub
- Runs from Firebase hosting
- Remove AppRunnerFromStorage, AppRunnerFromUrl

Requirements Part 2
-------------------

- Builder available as separate lib
- GitHub action builds and commits to a build branch on each commit
- App can be run from built code via GitHub pages

Technical
---------

- First: Refactor Builder, build.ts, previewFiles.ts and usages in Editor and EditorRunner
- Possible components: 
  - Project loader: Node, browser
  - File loader: Node, browser
  - File directory reader: Node, browser
  - HTTP loader: Node, browser
  - File writer: Service worker, HTTP Put and file system
- Builder dependency injections:
  - Project file loader
  - Asset file directory reader
  - Asset file loader
  - Runtime file loader
  - Client file writer
  - Server file writer
- Builder actions: build, update project, update asset
- Builder accessors: code, errors
- EditorRunner owns builder, pass code and errors into Editor


Notes
-----

- Editor uses generators to get errors and code