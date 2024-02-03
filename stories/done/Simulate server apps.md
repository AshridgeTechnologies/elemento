Simulate server apps
====================

Aims
----

- Developers can easily use a simulation of a server app with their client preview

Requirements
------------

- Preview works with a simulated server app
- Changes are applied instantly if no errors
- Errors are shown as with client
- Business logic is identical
- Firebase data store can be connected
- OR (if this is not possible) Firebase data store can be simulated with a disk data store
- Additional installs and updates are simple and foolproof
- Security risks kept to a minimum
- Clients refresh auto after a server update
- Works on Windows and Mac, maybe Linux


Technical
---------

- Dev server app
- Build executable with pkg
- Minimal executable that downloads latest version from website
- Runs express server
- Express server changed to have dynamic routes from path, rather than fixed
- Dynamic import of server app
- PUT route on express server saves server app code to disk and re-imports
- Studio loads server app into dev server after every change
- Browser app preview updates dev server calls after every change

To do
-----

- ✅ Generate metadata with server app functions: update and argNames
- ✅ Fixed express app that takes server app _factory_ as a parameter
- ✅ Express app reads metadata and handles request
- ✅ Express app errors if HTTP method incorrect, function not found
- ✅ Revise deployment to use standard server
- ✅ Dev server uses express app but adds PUT route that saves server app to file
- ✅ Dev server passes an app factory to express app that uses latest version of server app
- ✅ Dev server needs to be able to import server app from a path
- ✅ Server app needs to be able to import serverRuntime from the same path
- ✅ Allows multiple names server apps
- ✅ Dev server imports own code from Elemento server
- ✅ Studio loads server app code into dev server on changes, throttled
- ✅ Client app preview connects to dev server via service worker
- ✅ Line up all js file extensions
- ✅ Dev server only downloads own code if it has changed
- ✅ Dev server downloads server runtime from Elemento server
- ✅ Dev server bundle with pkg
- ✅ Build and zip executable and libs, minified
- ✅ Test on Windows
- ✅ Download page with instructions

Update preview after change
---------------------------

- ✅ runPreview creates app store hook to hold current store
- ✅ Pass hook into StoreProvider
- ✅ Respond to 'callFunction' messages, use component id, function name, args from message to call the function
- ✅ EditorRunner, after updating server app, finds all server app connectors for it
- ✅ Send callFunction for Refresh to each one
- ✅ Service worker broadcasts callFunction to each client
- ✅ Adjust first segment of component id to be 'app'
- ✅ Ensure callFunction of Refresh is _after_ the debounced call to update the server app
- ✅ unit test findElementsBy
