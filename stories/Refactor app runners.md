Refactor app runners
====================

Aims
----

- Clean up app running
- Allow types to be used in apps
- Replace "push" deploy from GitHub with a flexible "pull" approach

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
- ✅ Runs from GitHub
- Runs from Firebase hosting
- ✅ Remove AppRunnerFromStorage, AppRunnerFromUrl

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
- ✅ App runner gets built code from GitHub
- ✅ App runner does not use service worker
- Review run and runForDev in index.html for prod and preview

App Runner rework - server side
-------------------------------

- ✅ App server running in a Firebase function
- ✅ App server can be configured for a GitHub repo
- ✅ server can get code from GitHub
- ✅ server can use private repo with access token 
- ✅ Runner can be installed as a Firebase extension
- ✅ App server can accept PUTs from editor
- ✅ App server serves preview code
- ✅ App runner can use specified version
- Builder writes preview to app server
- Server app preview works
- App server protects preview PUT and GET with secret key or Firebase login
- Use secret for access token extension param, check all permissions and ordering for using secrets
- ✅ Index.html and client JS can be served with correct content type
- Remove preview window
- Remove old Builder and build.ts
- Don't load runtimes and other unnecessary files into GitHub

Further requirements
--------------------
- Set the Firebase function location and stop it changing on reconfiguration
- App runner finds default main app name from index.html
- App runner gets default from tag
- Preview and specified versions can run from app server on any device without being open in editor

Notes
-----

- Preview service worker can intercept capi calls
- Will need to inject password or ask for it when load page
- 


To do
-----


Technical
---------

- Server app runner is a Firebase function running an express app
- Configured in hosting to run on <hostname>/capi
- It is set up to serve apps from one GitHub repo (how? - function config? Hard coded constant?)
- First part of path is version: _ for latest, tag, commit id
- Next part is the app name
- Final part of the path name is the function to call
- Request handling procedure:
  - Get the current user
  - Construct the path of the app module and version on GitHub
  - Check if file exists in disk module store
  - If not:
    - Construct GitHub or jsDelivr path
    - Retrieve text
    - Write to file with the app module path
  - Dynamic import the server app modue from the file
  - Call the default export function with the current user to get the app instance for the request
  - Get the function and parameters from the request
  - Call the function
  - Send the result

