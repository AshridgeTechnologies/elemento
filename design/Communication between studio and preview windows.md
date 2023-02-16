Communication between studio and preview windows
================================================

Aims
----

- Simple, reliable, flexible communication between studio and preview windows
- Allow for current development needs, possibly future needs

Needs
-----

- Must reduce all possible security risks to a minimum
- Reloading preview on changes
- Highlighting elements, both ways
- Debugging
- Possible: driving tests and demos
- Possible: remote debugging on other browsers or other devices

Forces
------

- With WebContainers, postMessage and other inter-window messaging cannot be used
- Communication via a server, especially in-browser, is very quick
- Communication via server allows flexibility for use with other browsers/devices
- Could use same mechanism on a local or cloud dev server
- Bidirectional communication and initiation of communication
- SSEs appear to be limited and less used
- Websockets well supported on Node and Express with libraries like ws

Constraints
-----------
- The webcontainer server actually runs with an origin that is a real web address on webcontainer.io
- If request directly as top level doc, the service worker picks it up
- If do a fetch from that page, the service worker handles it
- BUT if do a fetch from another origin, it goes back to the site and is blocked with no cors
- And that includes the studio, because it is on a different origin
- Maybe: the websocket fails for the same reason - the timing of > 500ms indicates it may have gone over network
- SO - need to communicate directly with the process in the webcontainer from the studio

Possibilities
-------------

- Could push files to server over HTTP, then could work anywhere
- Use a pub-sub mechanism
- Could use the same mechanism for apps to communicate
- Websockets
- SSE
- WebRTC
- Communicate via webcontainer file system with polling
- Communicate viw webcontainer process stdio

Spike 1
----------

- Spike use of a websocket server in the WebContainer
- For reload and highlight, studio broadcasts, others send just to studio
- Result: does not work - see Constraints above

Spike 2
-------

- Try to communicate between studio and webcontainer via its standard input and output
- Result: This does work, although need to separate normal output and messages

