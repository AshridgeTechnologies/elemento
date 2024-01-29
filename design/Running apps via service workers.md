Running apps via service workers
================================

29 Jan 2023

Aims
----

- Solve problem of service worker restarts losing information sent to them from editor or app runner
- Simplify service worker code

Needs
-----

- Editor service worker can handle requests sent to preview server url
- Editor service worker can handle requests for client files
- Runner service worker can handle requests for client files
- Service worker restarts are handled without the user noticing
- Editor service worker can handle multiple projects open at the same time
- Runner can handle multiple apps at the same time

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

Possibilities
-------------

- Store file handles in IndexedDB
- Store copies of files in OPFS in known directory
- Use files of apps stored in OPFS directly
- Give each app window a unique id when opened
- Tidy up temp run dir in OPFS when window closed - or at least mark as not needed
