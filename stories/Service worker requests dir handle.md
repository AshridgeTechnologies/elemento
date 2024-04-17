Service worker requests dir handle
==================================

Aims
----

- Fix problems with service worker restarts losing dir handle
- Allow multiple projects to be open in editor at same time
- Allow multiple local apps to run at the same time

Requirements
------------
- See design note Running apps via service workers
- Service workers request dir handle from their clients whenever needed
- Requests to service worker include a unique project id so they can be independent
- Remove service worker ping

Technical
---------

- Each client using a file system directory creates a unique directory id from the name and timestamp opened
- Editor runner does this in openOrUpdateProjectFromStore
- The directory id is part of the path sent to the service worker
- Service worker has a map of directory id to dir handle
- When sw gets a request for that directory id, and not in map, sends a request to all clients
- Editor runner handles request in onmessage handler
- The client that has that directory id replies with the dir handle, sw caches in map
- The sw waits until gets dir handle, with timeout, continues with the request
- 
