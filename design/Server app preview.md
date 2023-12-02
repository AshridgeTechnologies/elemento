Server app preview
==================

13 Nov 2023

Aims
----

- Find a simple and effective way of running an instant preview of server apps in development
- Plan precise mechanism for reloading the running apps when a new preview is uploaded - see Server app reloading mechanism at end

Needs
-----

- Server apps in a project run together with the client preview in Studio
- Server app previews update immediately as changes made
- Uses latest server runtime
- Memory leaks avoided to reduce serverless function running costs
- Latest version of server app always available even if not changed for some hours

Forces
------

- Server runtime updates rarely
- Server app could update 1/s or more
- Don't want unused instances of serverless functions hanging around for test
- Caching much easier with only one instance
- Still need to scale main app server
- Need to store things persistently for when instance goes away
- May be better to separate preview from main, for security, ease of management, etc
- Imports always leak
- Imports from same path name are always cached so will not update

Possibilities
-------------

- Separate preview server
- Preview server handles the preview upload and serving
- Cache function versions in memory
- Cache latest function version in storage
- Limit scaling on preview server to one instance
- Throttle saves to storage
- Can store etag in metadata of server runtime and use to check whether new version on server

Decisions
---------

- Extension has Preview server function alongside main app server and admin server
- Preview server receives PUTs of updated server apps
- Create server app function using the Function constructor
- Hold map of latest version of each app function
- Write each new server app function to storage, overwriting previous
- On Preview server instance startup, load current version from storage
- Store server runtime in storage
- Create check for updated server runtime and download if needed
- Do check on Preview server instance startup


Server app reloading mechanism
==============================

Needs
-----

- After a new version of a server app is uploaded, subsequent requests use it
- Multiple server apps - only reload the one changed
- Server app has server runtime available to it
- Server runtime is reloaded if a new version is detected
- Server runtime only reloaded if needed
- Server app factory and express app are as close as possible to deployed apps

Forces
------

- Express app and app factory should not (cannot?) be reloaded
- Only one version (preview) needed in the preview app factory
- Imports of a given file name are cached forever
- Imports from a relative filename won't work well in eval using Function constructor

Possibilities
-------------

- Pass server runtime into app factory in both implementations
- Function constructor used to create the server app function
- Import server runtime dynamically to a variable
- Replace the import line in the generated code
- App factory accesses a cache of server app functions
- Cache is invalidated by new preview being uploaded

Decisions
---------

- Use Function constructor to wrap and create the Server app function
- Remove the server runtime import from the code
- get server runtime outside and pass into wrapper function as an argument, so still in closure

Server app reloading throttling
===============================

Needs
-----

- Server app function is not overloaded
- Out of order updates prevented
- Always upload the latest version
- Client flicker is reduced
- Feedback to user about updates
- Throttle updates to maybe one every 1-3 seconds - different to client side writes - https://github.com/sindresorhus/debounce
- Ensure latest is uploaded
- Update client after new version uploaded - clear caches
- Ensure all uploaded when load project
- Only upload if changed

Forces
------

- HTTP calls could complete out of order
- Could get multiple instances of preview serverless function
- Update client only once server update is complete
- Could get a new update before the HTTP call has completed
- Different needs to client updates, which should be immediate
- Longer wait for server updates acceptable if obvious to user
- Server app updates currently done when anything updates
- Only need to update the server app that has changed
- ProjectBuilder already has many responsibilities
- Important to write all files immediately and in parallel if possible when open project
- Writing multiple files in one call would be quicker, easier to manage and avoid creating multiple server function instances

Possibilities
-------------

- Ensure only one HTTP call at a time
- Wait for interval (1s?) after server app update
- Limit preview function to one instance
- Hold last uploaded version of a file to compare
- File writer wrapper to throttle updates and suppress unnecessary writes
- Two separate wrappers for above
- Do one or both in ProjectBuilder
- File writer wrapper has onStatusChange used to set progress message in EditorRunner
- Write multiple files in one call - separators in text, or JSON stringify

Decisions
---------

- Limit preview server to one instance
- Change preview put to handle multiple files
- File writer wrapper to hold latest of each file and pass through only changed files
- Replace existing file writer with one that writes multiple files, throttles to interval, waits for each call to complete and has status
- Have a status message in Studio page (App bar?), updated from file writer onStatusChange