Refactor app runners
====================

Aims
----

- Update facility to run apps in Firebase from GitHub 

Requirements
------------

- ✅ Runs from Firebase hosting
- ✅ Serve client app from GitHub
- ✅ Serves files with correct headers
- ✅ Still works with studio preview
- ✅ All client page requests redirected to the main page and still work
- Serve/redirect to default client app on top level
- ✅ Gets project id from environment
- ✅ Deploy server apps from GitHub to server app runner cache
- ~~Connect to server apps from client in GitHub~~
- ✅ All capi calls redirected to the function
- ✅ Gets firebaseConfig and whatever needed for authorization
- ✅ Private repos - fetch and save and deploy
- ✅ Server app runner uploads and runs previews of server apps
- ✅ Server apps in preview update immediately
- ✅ Studio uploads server apps to preview
- Server apps in preview are secured
- Show clear error messages if hosting project not set
- Show clear progress messages while loading to preview server
- Can access Firebase
- Can access third party APIs with secret credentials
- Can use Firebase authorization
- Can run server apps in cache default and specified versions concurrently
- Can update client app quickly and easily when new version in GitHub
- ✅ Tool in Studio to deploy to Firebase
- ✅ Tool works with access tokens from GitHub and Google logins
- Easy way of installing app server extension and setting up project
- Clear instructions for the manual steps
- ✅ Use hosting where possible for faster response and lower costs
- Appropriate caching for all files - use cache where possible, close-spaced deploys work
- Can deploy to preview channel
- Use unique filenames with caching and/or ensure cache cleared
- Password protect and test clear cache function - or remove
- Extension and management tool independent of Elemento
- All runtime and generated server JS files inc cjs are served with correct content type
- All generated server files are consistent and usable for other deployment environments
- Remove old dev server
- ✅ Tools menu, with Firebase Deploy as a standard Tool
- Project reload, or auto when update settings

Preview server
--------------

- ✅ Extension has Preview server function alongside main app server and admin server
- ✅ Preview server receives PUTs of updated server apps
- ✅ Create server app function using the Function constructor
- ✅ Hold map of latest version of each app function
- ✅ Write each new server app function to storage, overwriting previous
- ✅ When requested, load current version from storage
- ✅ Store server runtime in storage
- ✅ Create a check for updated server runtime and download if needed
- ✅ Do check when new preview version uploaded, throttled to 60 seconds 

Studio uploads to preview server
--------------------------------

- ✅ Have firebase project id
- ✅ Not have this in source files, or generated code
- ✅ So - local settings for project
- ✅ Store settings in settings.json file, exclude from git, available on Project
- ✅ Deploy tool can update settings
- ✅ Need to send Google access token
- ✅ Limit preview server to one instance
- ✅ Change preview put to handle multiple files
- File writer wrapper to hold latest of each file and pass through only changed files
- File writer wrapper that writes multiple files, throttles to interval, waits for each call to complete
- Status message in Studio page (App bar?), updated from file writer onStatusChange
- Clear caches on client when status changes to done
- Need to clear out old project
- Ensure could swap out for another hosting arrangement

Store project settings
----------------------

- ✅ Editor Controller interface has GetSettings/UpdateSettings with a settingsName param
- ✅ This is linked to an interface implemented by ProjectHandler
- ✅ Which is implemented by creating/accessing the settings.json file in the project directory
- ✅ Via a write-through cache initialised before use
- ✅ Write the .gitignore and empty settings.json in EditorManager.newProject

Use preview server from Studio
------------------------------

- ✅ Need to get version as preview
- ✅ Need to direct to capi
- ✅ Need to send to correct server
- ✅ So need to have server url in EditorSW
- ✅ AND need to update it when it changes

Secure preview server
---------------------

- ✅ Need to send access token to update the storage cache, and wait for it

Later to secure calls to the functions:
- Extension has a password hash in its config
- Preview server checks password from a header X-Elemento-Preview-Password
- All calls from preview or editor are accompanied by the password in the header
- Firebase deploy sets preview password in project settings
- Firebase deploy also shows the password hash
- Editor Runner sets the password in EditorServiceWorker
- User must put password hash in extension config 


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
- ✅ Fix all 4 run situations to work with pages and further path elements, from deep link
- ✅ Make everything able to use an alternative runtime.js
- ✅ Run app stored in browser shows no options
- ✅ Cloud storage cache path fn from username, repo, commitId, subdir, filePath
- ✅ Deploy server code to cache in storage with commit id in the path
- ✅ Server app runner loads the requested version
- ✅ All capi requests must go the correct deploy id
- ✅ Client reads version file to get deploy id
- Generator writes metadata file to top level with default app in it
- Deployment sets up redirect to default app at top level
- Don't look up server app factory functions again once imported
- Work out correct caching for runtime files
- Work out how to make preview server functions update


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

- Need to initialise storage in the console
- If don't use the same region as other things, may be problems
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
- 
