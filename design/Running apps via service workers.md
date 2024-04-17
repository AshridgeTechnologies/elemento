Running apps via service workers
================================

29 Jan 2024

Aims
----

- Solve problem of service worker restarts losing information sent to them from editor or app runner
- Simplify service worker code

Bugs to fix
-----------
- Service worker no longer serves files after being woken up (dirHandle lost)
- Writes and preview updates get out of order - latest change sometimes does not show in Preview
- Preview cannot reload named pages - service worker gives 404
- Previews are mixed up if open two projects in different tabs
- Does not show preview on new project - sw gives 404 - until reload frame


Needs
-----

- Editor service worker can handle requests sent to preview server url
- Editor service worker can handle requests for client files
- Runner service worker can handle requests for client files
- Service worker restarts are handled without the user noticing
- Editor service worker can handle multiple projects open at the same time
- Runner can handle multiple apps at the same time
- Editor updates are quickly and reliably seen in the Preview

Forces
------

- Nowhere to store state in memory related to a service worker
- Service workers can access IndexedDB
- Service workers can access OPFS, if they can get a file handle
- Runner service worker already uses File System Access API - OPFS or user disk
- Service workers are shared between all instances of an app - runner or editor
- Need to distinguish code for different apps
- Some possibility that will have multiple apps with the same name esp if copy to different dir
- When running app do not expect it to change
- In preview expect the app files to change all the time
- OPFS is fast and no limit on space
- Already have code to run from OPFS and write updates to multiple places
- Editor Runner app updating code is complex and prematurely optimised

Possibilities
-------------

- Store file handles in IndexedDB
- Store copies of files in OPFS in known directory
- Use files of apps stored in OPFS directly
- Give each app window a unique id when opened
- Service worker requests file handle from clients if it doesn't have it
- Tidy up temp run dir in OPFS when window closed - or at least mark as not needed
- Service worker always uses file system access (now done)
- Refactor project updating code out of Editor runner


Decision after spike - Ask the client
-------------------------------------

- Each client using a file system directory creates a unique directory id from the name and timestamp opened
- The directory id is part of the path sent to the service worker
- Service worker has a map of directory id to dir handle
- When sw gets a request for that directory id, and not in map, sends a request to all clients
- The client that has that directory id replies with the dir handle, sw caches in map
- The sw waits until gets dir handle, with timeout, continues with the request
