Refactor app runners
====================

Aims
----

- Update facility to run apps in Firebase from GitHub 

Requirements
------------

- ✅ Runs from Firebase hosting
- ✅ Serve client app from GitHub
- Serves files with correct headers
- Still works with preview
- Can update client app quickly and easily when new version in GitHub
- All calls redirected to the function
- Serve default client app on top level
- Run server apps from GitHub
- Connect to server apps from client in GitHub
- Private repos
- Run server app preview from Studio
- Can access Firebase
- Can access third party APIs with secret credentials
- Can serve and cache default and specified versions concurrently
- Easy way of installing app server extension
- Password protect and test clear cache function - or remove


App Runner rework - client side
-------------------------------

- Review run and runForDev in index.html for prod and preview
- Update imports without hundreds of versions being kept - https://stackoverflow.com/questions/47675549/how-do-i-cache-bust-imported-modules-in-es6

App Runner rework - server side
-------------------------------

- Builder writes preview to app server
- Server app preview works
- App server protects preview PUT and GET with secret key or Firebase login
- Use secret for access token extension param, check all permissions and ordering for using secrets
- Remove old Builder and build.ts, BrowserRuntimeLoader
- Don't load runtimes and other unnecessary files into GitHub - get from elemento hosting 

Further requirements
--------------------
- Upgrade FB function to v2 and Node 20
- Studio Tool to manage app server - or just use FB console?
- Set the Firebase function location and stop it changing on reconfiguration
- App runner gets default from tag
- Preview and specified versions can run from app server on any device without being open in editor

Notes
-----

- Preview service worker can intercept capi calls
- Will need to inject password or ask for it when load page
- 


To do
-----
- index.html needs to get runtime from standard server
- xxxApp.js need to get runtime from standard server
- Clear cache function on app server


Technical (from Part 1)
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
  - Dynamic import the server app module from the file
  - Call the default export function with the current user to get the app instance for the request
  - Get the function and parameters from the request
  - Call the function
  - Send the result


Problems
--------

- CLI install updates nearest firebase.json and extensions dir it finds
- CLI install fails with permissions error, says need to grant the role roles/artifactregistry.reader to Cloud Functions service account, but succeeds second try
- Difficult to work out correct function url eg  https://europe-west2-elemento-app-server-test.cloudfunctions.net/ext-elemento-app-server-appServer
- When call function, get error: The specified bucket does not exist
  - so need to initialise storage 
  - so need instructions on how to do this and which location
- Probably want hosting redirect to send all requests to the function
- Stuck for long time because deploying extension appeared not to update the code - didn't rebuild lib code from TS source
- CORS error getting runtime from elemento server

- 
