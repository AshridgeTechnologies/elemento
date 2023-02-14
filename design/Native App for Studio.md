Native App for Studio
=====================

Aims
----

- Consider whether to switch to a native app for running the studio

Problems with browser-based IDE
-------------------------------

- Working with services like Firebase using standard dev tools
- Running native tools for packaging
- Storing working codebase in browser-internal filesystem, with import/export
- Saving to local file system is possible but fiddly
- Running and quickly updating server functions for dev and test
- Debugging server functions
- Unusual experience for devs

Forces
------

- Downloading an app is more friction
- Quick slick app on web is important for encouraging new users
- Maintaining web and desktop versions of the IDE is a big overhead
- Learning a new tool like Electron is a big overhead
- Only more advanced uses give problems - specifically debugging and deploying server apps
- Storing working copy on file system would be nice, but less important
- More advanced users would be happy to take extra steps
- Providing a public server could be useful but would be an overhead

Possibilities
-------------

- Studio runs in a native app with Electron
- Studio has a local helper app, connect by HTTP
- Studio has public helper app on internet
- Use pkg to create local helper app

Spikes
------

- Electron: various niggling difficulties, studio still not running at all after several hours, little feel for how long it would take
- 