Preview controller
==================

11 Apr 2025

Aims
----

- Preview window can be controlled even if on different origin to studio

Needs
-----

- Window can only be controlled if it is a preview window
- Preview can be different origin to controlling window
- Editor can control preview
- Tools can control preview

Forces
------

- Cannot access anything in window on a different origin
- Can send postMessage to it, and receive postMessage back
- Preview controller client currently assumes it is communicating with the parent window
- Editor currently constructs Preview Controller, using window of the preview frame
- Preview is currently a global to make easier for generated code to access
- Preview controller client functions need to be bound to object

Technical approach
------------------

- ✅ postMsgRpc helpers take the window as a parameter
- ✅ postMsg helpers can use functions returning promises
- ✅ PreviewControllerClient is a standard class with a prototype
- ✅ PreviewControllerClient is in shared
- ✅ PreviewControllerClient takes the target window as a parameter - default to parent
- ✅ PCC has same interface as PC
- ✅ App window creates preview controller if it is a preview
- ✅ App window exposes functions via postMsgRpc
- ✅ EditorRunner creates a PCC on the preview frame window and exposes it for tools
- ✅ Preview variable for tools is the static one using parent window default
- Ensure subscription to Url is made after PC initialised in app window
- Avoid having all of testing-library in runtime for every app
- Use navigation api for url, back, forward etc
