Server side apps
================

Aims
----

- Developers can build and deploy server side apps in a project

Requirements
------------

- ✅ Server side app model object
- ✅ Can contain function definitions
- ✅ Functions are marked as get or action
- Generates server side app code in a separate file
- Deploys server side app as a Firebase cloud function
- App connector model object
- App connector runtime is configured from the server side to expose client functions
- Calls from client are cached and updated when resolved, like db calls
- Firebase authorization is transmitted to the server side
- Current user is available in server functions
- Preview can use simulated server running in browser

Desirable
---------
- Server functions can run within the client app
- Server app can provide an external API with configurable paths

Implementation notes
--------------------


