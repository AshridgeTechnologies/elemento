Service worker requests dir handle
==================================

Aims
----

- Fix problems with service worker restarts losing dir handle
- Allow multiple projects to be open in editor at same time
- Allow multiple local apps to run at the same time
- Fix problems with project builds and refresh out of order

Requirements
------------
- See design note Running apps via service workers
- ✅ Service workers request dir handle from their clients whenever needed
- ✅ Requests to service worker include a unique project id so they can be independent
- ✅ Remove service worker ping

Technical
---------

- ✅ Each client using a file system directory creates a unique directory id from the name and timestamp opened
- ✅ Editor runner does this in openOrUpdateProjectFromStore
- ✅ The directory id is part of the path sent to the service worker
- ✅ Service worker has a map of directory id to dir handle
- ✅ When sw gets a request for that directory id, and not in map, sends a request to all clients
- ✅ Editor runner handles request in onmessage handler
- ✅ The client that has that directory id replies with the dir handle, sw caches in map
- ✅ The sw waits until gets dir handle, with timeout, continues with the request
- ✅ Remove update time from 
- ✅ For tools
- ✅ When opening new project in same editor
- ✅ For everywhere studio/preview occurs

For local apps
--------------

- Not useful as client window does not keep the directory handle anyway


Project build/refresh bugs
--------------------------

- ✅ Editor Runner has debounced call to projectBuilder.updateProject
- ✅ updateProject does not do its own debounced write
- ✅ updateProject returns a promise fulfilled when all writes complete
- ✅ in debounced function, send a message to service worker with 'projectUpdated', project id
- ✅ service worker sends out as refresh code, project id
- ✅ clients respond if they are for this project id
