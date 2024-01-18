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
- ✅ Gets project id from environment
- ✅ Deploy server apps from GitHub to server app runner cache
- ~~Connect to server apps from client in GitHub~~
- ✅ All capi calls redirected to the function
- ✅ Gets firebaseConfig and whatever needed for authorization
- ✅ Private repos - fetch and save and deploy
- ✅ Server app runner uploads and runs previews of server apps
- ✅ Server apps in preview update immediately
- ✅ Studio uploads server apps to preview
- ✅ Server apps in preview are secured
- Show clear error messages if hosting problems, eg project not set, extension not there
- ✅ Show clear progress messages while loading to preview server, eg not logged in to Google, allow retry
- ✅ Serve/redirect to default client app on top level
- ✅ Show url when deployed
- ✅ Warn about uncommitted changes
- ✅ Can access Firebase on the _hosting_ project, not Elemento
- ✅ Can get firebase config from preview server
- Can access third party APIs with secret credentials
- ✅ Can use Firebase user on server
- Firestore security rules are set when deploy
- Firestore data store can be used in preview, possibly with simulated security rules
- ✅ Can run server apps in cache default and specified versions concurrently
- ✅ Can update client app quickly and easily when new version in GitHub
- ✅ Tool in Studio to deploy to Firebase
- ✅ Tool works with access tokens from GitHub and Google logins
- ✅ Easy way of installing app server extension and setting up project
- Clear instructions for the manual steps
- ✅ Use hosting where possible for faster response and lower costs
- ✅ Password protect and test clear cache function - or remove
- ✅ Extension and management tool independent of Elemento
- Remove old dev server
- ✅ Tools menu, with Firebase Deploy as a standard Tool
- ✅ Deal with expired access tokens
- ✅ Login to Google auto, or prompt, if possible, when need to update
- Check service worker js file caching
- Elemento Apps is approved
- Ping app server after deploy - and before to load it? 
- Server app express file serves all server apps
- Serving preview app is documented

- Document setting up Preview server

Usability
---------

- Extra dropdown on Help button to show Guides
- Use GitHub signin if there but don't immediately prompt when open Firebase tool

Further requirements
--------------------
- Firebase tool generates a random password if none found
- Firebase tool checks if extension is up to date and warns if not
- If extension present, checks if preview is set up and prompts to do it if not
- Sets default storage location in setup (maybe from client)
- Default GitHub URL to remote origin
- Use secret for access token extension param, check all permissions and ordering for using secrets
- ✅ Remove old Builder and build.ts, BrowserRuntimeLoader
- Don't load runtimes and other unnecessary files into GitHub - get from elemento hosting
- Upgrade FB function to v2 and Node 20
- Studio Tool to manage app server - or just use FB console?
- Set the Firebase function location and stop it changing on reconfiguration
- App runner gets default from tag
- Preview and specified versions can run from app server on any device without being open in editor
- Don't look up server app factory functions again once imported
- Appropriate caching for all files - use cache where possible, close-spaced deploys work
- Use unique filenames with caching and/or ensure cache cleared
- Work out correct caching for runtime files
- Can deploy to preview channel
- All runtime and generated server JS files inc cjs are served with correct content type
- All generated server files are consistent and usable for other deployment environments
- Project reload, or auto when update settings
- Review run and runForDev in index.html for prod and preview
- Update imports without hundreds of versions being kept - https://stackoverflow.com/questions/47675549/how-do-i-cache-bust-imported-modules-in-es6


Sub-stories
===========

Server app features needed
--------------------------

- ✅ Collection's Collection Name defaults to model object formula name
- ✅ Can use Current User in Server App functions
- ✅ Decode ISO dates in JSON into JS Dates
- ✅ Store JS Dates in Firestore as Timestamps
- ✅ Record manipulation functions - Merge, Pick
- ✅ Better record construction
- ✅ Check function
- ✅ Comparison functions work with dates and strings
- ✅ CurrentUser() is allowed in server app functions
- ✅ CurrentUser has Id property from uid
- Editor Service Worker keeps losing the preview server
- ✅ Server App Caching changes
- Form behaviour changes
- Page authorization and error handling and logout action
- Refresh data when auth changes - either log in or out, don't show errors while waiting
- Sort out id vs Id
- ✅ Components whose value is an object do not expose sub-props on top-level - very confusing
- ✅ Confusing how to access form values, such as data given to form, within the form
- ✅ How to use form values if not in fields - Calculation, Data
- Auto form reset after submit action
- Don't cache error results from Server Apps - or only for a short time
- ✅ Read only Date component is not read only
- Pending value should show loading spinner
- Better argument type checking on runtime functions eg Update
- Server Error management on client - expected/unexpected, link to fields
- User management - creation, approval, permissions
- GetOrCreate, UpdateOrCreate functions - good idea?
- Intermediate values in actions, including from async functions
- Separate validation conditions for Server App functions - can be used in docs, return better error codes, catch all errors together
- DataType validation for function inputs
- Function input validation against other function inputs
- DataType validation for Collections on Add and Update
- Validation using queries eg to check no two holiday bookings overlap
- Document ShowPage and CurrentUrl, check other App functions
- Find Data Store collection names from Project - or document
- Enable Firestore in setup - or document
- Check Server App functions only called from app unless marked as API? How?
- Investigate why and fix: This project is set up to use Cloud Firestore in Datastore mode.
- Find a better way of setting permissions
- Find a way round this: https://cloud.google.com/identity-platform/docs/admin/email-enumeration-protection#disable


Use Firebase on hosting server
------------------------------

- ✅ Extension admin server has a setup feature
- ✅ Setup sets the preview password and ensures default app and config are generated
- ✅ Config and password are saved in a settings folder in storage bucket, file settings
- ✅ Preview server serves firebaseConfig.json from the saved settings
- ✅ Editor service worker requests firebaseConfig.json from the preview server
- ✅ Preview server gets the password from the saved settings
- ✅ Extension param for preview password is removed
- ✅ Firebase tool checks if extension initialised in the project set and warns if not
- ✅ Firebase Tool has extension install link, opens in new tab
  - https://console.firebase.google.com/project/_/extensions/install?ref=elemento/elemento-app-server@0.1.1-alpha.0
- Fix problem with logging in to existing email account
- Document the extension warning
- Fix the Preview password docs in Guide and in extension
- Feedback on saving Preview details
- Get all names right - eg Install complete for {NAME}
- Elemento favicon
- Editor service worker updated when update the Preview settings in Firebase tool
- Editor service worker sometimes does not get preview settings when open project


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
- ✅ File writer wrapper to hold latest of each file and pass through only changed files
- ✅ File writer wrapper that writes multiple files, throttles to interval, waits for each call to complete
- ✅ Status message in Studio page (App bar?), updated from file writer onStatusChange
- ✅ Throttled writer can retry and/or flush immediately
- ✅ Throttled abandons waiting writes if fails
- ✅ Throttled writer retries files in a failed write without overwriting updates that came in during the call
- ✅ Clear caches on client when status changes to done
- ✅ Need to clear out old project
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

Secure preview server and UX
---------------------

- ✅ Need to send access token to update the storage cache, and wait for it
- ✅ When server updates required (including at project load), and no google access token, request one
  - do this in getOrRequestGoogleAccessToken, return promise, reject if cannot get token
- ✅ Store expiry time with token, check before using token
- ✅ Wait for access token before continuing and warn if not present with error details
  - do this by throwing exception in HttpCombinedFileWriter if error getting token, used by ThrottledCombinedFile Writer to update status
- ✅ Show details of errors in updating
- ✅ Button to retry updates
  - do this by passing flushWrites fn to ProjectBuilder
- ✅ No delay when updating server at project load time



Deploy To Do
------------

- ✅ Find bug with serving app page instead of preview - after idle for a while? or service worker update problem?
  - because previewServerUrl in sw is null
  - which indicates it has never been set, as setter in EditorRunner is a template string
- ✅ Bug with not downloading server runtime to preview when needed
  - suspect the timeout preventing check after clear
- ✅ Get GitHub auth status correctly in Firebase deploy
- ✅ Get Google auth status correctly in Firebase deploy
- ✅ version file is cached with max-age 3600 so deploys don't update
- ✅ Show url when deployed
- ~~Warn if uncommitted changes~~
- ~~Default GitHub URL to remote origin~~
- ✅ Serve/redirect to default client app on top level


App Runner rework - server side
-------------------------------

- ✅ Builder writes preview to app server
- ✅ Server app preview works
- ✅ App server protects preview PUT and GET with secret key or Firebase login


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
- ✅ Generator writes metadata file to top level with default app in it



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

