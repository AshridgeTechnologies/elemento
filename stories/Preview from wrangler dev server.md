Preview from wrangler dev server
================================

Aims
----

- Client and server preview served from local dev server

Requirements
------------

- ✅ Client apps served
- ✅ Server functions work
- ✅ Client and server preview changes available almost immediately
- ✅ Client changes shown on preview app automatically
- ✅ Server changes shown on preview app automatically
- ✅ Debugging works
- ✅ Highlighting works
- ✅ Highlighting from preview works

- ✅ Service worker removed
- ✅ Express removed

Further requirements
--------------------
- Firebase removed
- Write client runtime to client files - know it matches, wrangler dev caches

Technical
---------

- ✅ Server app has an update time
- ✅ Project has a serverBuild version - latest of server apps
- ✅ Write status function to server app dir with info including the serverBuild version
- ✅ index.js includes the status app
- ✅ Editor polls status until serverBuild version >= the Project's, then refreshes server apps

- ✅ Preview Controller does component selected, has observable
- ✅ EditorRunner observes that

- ✅ Review Selection Provider and selectedComponentId
- ✅ Review appStoreHook


Notes
-----

- Wrangler local server seems to serve static assets almost immediately after change, so updated client app js file served ok
- Reloading the worker takes a second or two, so an immediate request for server functions gets old version
