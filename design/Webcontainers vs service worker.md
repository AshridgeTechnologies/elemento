WebContainers vs service worker
===============================

Aims
----

- Decide whether the extra complexity introduced by WebContainers is worthwhile
- Or whether a simple service worker serving preview files would be as good

Needs
-----

- Serve preview in multiple windows within the same browser
- Serve asset files in preview
- Serve server apps in preview
- Work easily with GitHub
- Work with project files on disk
- Immediate refresh
- Highlighting of elements both ways between editor and preview

Forces
------

- WebContainer is very heavyweight
- WebContainer isolation constraints make many things very difficult
- WebContainer is being used as a glorified service worker to serve files
- The websocket server is only there to provide communication between editor and preview windows
- Other methods of inter-window communication would be available if WebContainer was not there
- All files have to be copied into the WebContainer file system
- Sunk cost of the work done to use a WebContainer
- Much of the work done to adapt to WebContainer would still be useful if went back to a simple SW
- WebContainers could be useful for running Node processes in the future  eg for building
- FileSystemHandles cannot yet be serialized and rehydrated, with permissions, so GitHub in a popup would be unusable 

Possibilities
-------------

- Carry on with WebContainer, overcome remaining difficulties
- Create a service worker to store and serve files
- Use post message or broadcast channel or clients API for inter-window communication
- Preview windows run the build themselves
- Write generated code to disk for service worker to pick up
- Use local storage or IDB to share stuff between multiple windows and service workers
- Run a WebContainer in a separate window on a different path to do Node processes
- Use GitHub for running Node processes, download artifacts after
- Use CDNs that bundle modules like esm.sh or Skypack
- Wait for general imports and import maps to become available
- Use postmessage etc between service worker and other windows
- Transfer app files into service worker via post message
- Use the FileSystem structure from WebContainers
- Service worker could help with making Editor usable offline

Questions
---------

- Can a service worker serve JavaScript files for imports? Yes
- Can a service worker handle Put requests? Yes
- Is a service worker installed for one window automatically used by others on same origin? Yes
- Is the same _instance_ shared between the windows? Yes
- Is File System Access granted to one window available to others on same origin?
- Can directory handles be passed between windows?
- Can you pass file data via postMessage? Yes - arrays handled by structured clone algorithm

Technical notes
---------------

- Load code separately and version script: https://www.lucidchart.com/techblog/2019/01/22/what-you-should-know-before-making-a-service-worker/
- May be better to use transferable objects with postMessage for file data sent to service worker
- May need to register service worker for both editor and preview paths to allow communication

Server apps
-----------

- Can run equivalent of express server in service worker
- Can run most code BUT firebase is tricky
  - Maybe could find a way to bundle firebase-admin for browser - try parcel, look for polyfills, mark external
  - Maybe could have a different version of server runtime for use in the browser, different FB implementations, same interface
  - Or try another cloud database
  - Or can only use in-memory databases in the browser - do you want to test on live anyway?
  - Simulating correct auth may be difficult
  - If have ability to deploy and run a new version to test, that might be better
  - Or download data and import into IDB
- Could also have a downloadable local server executable (use Ink for UI)
  - Server side apps are more advanced usage, so downloading a helper is not a big deal really
  - Making the helper runnable is a slightly bigger issue - executable permissions, OS complaints, etc
  - Could use Electron for helper only for more polish
  - Could be useful for other things in the future
- Could provide a shared server on web