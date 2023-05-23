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

Preparation
-----------

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

App Runner rework - client side
-------------------------------

- ✅ Editor ProjectBuilder writes generated code to disk
- App runner gets built code from GitHub
- App runner can use specified version
- App runner gets default from tag
- App runner does not use service worker

App Runner rework - server side
-------------------------------

- App server running in a Firebase function
- Index.html in FB hosting
- App server can pull code from GitHub
- App server can accept PUTs from editor
- App server serves preview code
- App server can use specific version
- Builder writes to app server
- App server protects preview PUT and GET with secret key
- Builder writes Firebase boilerplate to project directory
- Firebase deploy sets everything up correctly
- Remove preview window
- Remove old Builder and build.ts

Further requirements
--------------------
- App runner finds default main app name from index.html

Notes
-----


To do
-----


