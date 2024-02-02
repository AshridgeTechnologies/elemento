Editor Service Worker restarts and project handling
===================================================

02 Feb 2024

Aims
----

- Solve the problem of Editor Service Worker restarts losing the preview server url
- And the problem of previews of multiple projects interfering with each other
- And maybe simplify service worker file handling
- And maybe simplify file handling for the user
- And maybe allow recent files

Needs
-----

- Service worker can get preview server url after restart
- Service worker can get client files to serve after restart

Desirable
---------

- Providing a recent project list
- OPFS and file system projects presented together
- All service worker runners read from file system
- Multiple windows can see the preview


Forces
------

- Undesirable to ping SWs to keep them alive - and may still not work
- Duplicate names for projects may occur
- Multiple browsers on the machine can see the preview - needs a server
- May want multiple devices to see the preview in the future (eg to check appearance) - needs a server

Possibilities
-------------

- Preview window knows the FileSystem handle, or a ref that allows to get it
- Ref could be added to the preview window URL
- Ref could be poked into the window by postMessage
- Preview window sends extra header to service worker with reference
- Service worker can get the handle using the reference
- If need a preview server anyway, it could do the work


