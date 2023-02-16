Serve preview from WebContainer
===============================

Aims
----

- Simplify preview serving
- Make preview more like real running
- Prepare the ground for future improvements eg bundling

Requirements
------------

- ✅ Preview works as now
- ✅ Highlight/select still works both ways
- ✅ Can load image files
- ✅ Can use Firebase in preview
- ✅ Studio can sign in to GitHub when needed
- ✅ Preview sign in works
- ✅ Preview refreshes quickly with little flashing
- ✅ Local state is retained across refreshes
- ✅ Remove service worker
- ✅ Changing project clears out all old state and files

Desirable
---------

- ✅ Can open preview in another window or another browser (maybe with standalone server)
- ✅ Other windows in same browser refresh auto
- Other windows in any browser refresh auto (maybe with standalone server)
- ✅ Speed up web container server startup eg bundle to avoid yarn install
- Include fixed server code in bundle

Technical
---------

- ✅ Create WebContainer with useState in EditorRunner
- ✅ Load index.html, generated code and other static files into WC filesystem
- ✅ Load asset files into WC
- ✅ Run simple file server in WC - 
- ✅ Get URL of file server, use in preview iframe

- ✅ When code changes:
    - write into WC file,
    - re-import the app code module, 
    - state is kept as it is outside the app component

- ✅ Remove code injection, service worker


Notes
-----

- Client app server does not need to restart when files change, just serve new ones
- Server app server will need to restart
- If changes can go both ways, and send updates into preview, could edit values in debugger
- Parcel dev server cannot do required headers until this PR is merged: https://github.com/parcel-bundler/parcel/pull/8833
- Broadcast channel cannot work for communication with preview windows as they are on different origins
- Server events would allow use of same mechanism with another browser
- The webcontainer server actually runs with an origin that is a real web address on webcontainer.io
- If request directly as top level doc, the service worker picks it up
- If do a fetch from that page, the service worker handles it
- BUT if do a fetch from another origin, it goes back to the site and is blocked with no cors
- And that includes the studio, because it is on a different origin
- Maybe: the websocket fails for the same reason - the timing of > 500ms indicates it may have gone over network
- SO - need to communicate directly with the process in the webcontainer from the studio

To do
-----

- ✅ Images working in preview
- ✅ Preview shown when project loaded from GitHub
- ✅ Explore whether mount at a dir removes old files
- ✅ Get Update working
- ✅ Get Save working on push
- ✅ Get Save working on create
- ✅ Try nightly of parcel
- Refactor refresh code



