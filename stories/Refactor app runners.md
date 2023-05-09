Refactor app runners
====================

Aims
----

- Clean up app running
- Allow types to be used in apps

Requirements
------------

- ✅ Generate a code file for each app that exports the app component (as now)
- ✅ Generate HTML runner file for each app that imports the runtime, the app and runs it
- ✅ All DataTypes are included in each app code file, client and server
- ✅ The code file is named after the app
- ✅ The runner file for the first app is index.html, <appname>.html for the others
- ✅ All client code in same top-level directory - review later
- ✅ Multiple server apps generated into same top-level dir with common Firebase files
- ✅ Files in files dir
- ✅ Runs in preview
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

- ✅ First: Refactor Builder, build.ts, previewFiles.ts and usages in Editor and EditorRunner
- ✅ Possible components: 
  - Project loader: Node, browser
  - File loader: Node, browser
  - File directory reader: Node, browser
  - HTTP loader: Node, browser
  - File writer: Service worker, HTTP Put and file system
- ✅ Builder dependency injections:
  - Project file loader
  - Asset file directory reader and file loader
  - Runtime file loader
  - Client file writer
  - Server file writer
- ✅ Builder actions: build, update project, update files
- ✅ Builder accessors: code, errors
- ✅ EditorRunner owns builder, passes code and errors into Editor
- Update imports without hundreds of versions being kept - https://stackoverflow.com/questions/47675549/how-do-i-cache-bust-imported-modules-in-es6


Notes
-----

- Editor uses errors and code from the builder in the EditorRunner

To do
-----

- ✅ Create ProjectBuilder in EditorRunner with dummy outputs
- ✅ Check it builds OK and has code and errors
- ✅ Check it updates OK and has code and errors
- ✅ Replace client preview initial mount and updates with builder
- ✅ Make the imports in the app JS file work
- ✅ Replace server preview initial mount and updates with builder
- ✅ Editor uses code and errors passed in props from EditorRunner
- Remove Builder, build.ts
