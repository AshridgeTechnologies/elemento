Running from local files
========================

Aims
----

- Provide a flexible way of running apps from local disk or file store

Needs
-----

- Run apps from local disk
- Run apps from OPFS
- Move from file-picker to running app in same window on both
- Bookmarkable-link to OPFS apps
- Nice to have: remember recently run disk apps and permissions

Forces
------

- Files need to _appear_ to be served by HTTP for app runners to work
- Editor service worker does too much
- Runner service worker needs file system directory handle to load files
- Only way to get information into a service worker is postMessage
- File handles should be serializable
- Service worker may need to handle multiple apps at the same time
- Possible that two apps may have the same directory name at the end of different paths
- Editor service worker only caters for single app at the moment, needs to do multiple
- Would reduce code if could share the file loading/serving mechanism between both service workers
- Caching files for performance is good
- Caching files only as needed probably also better

Possibilities
-------------

- File chooser posts message with name and handle to service worker
- Cannot run two apps with the same name at once - not worth the effort - second replaces the first
- File chooser replaces itself with AppRunnerFromCodeUrl
- File chooser replaces itself with AppMain
- AppMain gets file handle for OPFS itself (in AppRunnerFromOpfs)
- AppMain gets file handle for disk files itself if it can (from serialized recents), otherwise shows file chooser(in AppRunnerFromDisk)
- Runner posts FileHandle to service worker, not the chooser


Decisions
---------

- Separate RunnerServiceWorker
- Extract shared code later if appropriate
- Two new classes for running from OPFS and disk
- Run chooser component displayed if bare /run/ URL
- Replace location to load page with run/local url
- Runner service worker is scoped to /run
