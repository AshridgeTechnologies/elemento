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
- ✅ Generates server side app code in a separate file
- Can use global and appropriate app functions in server side code
- Deploys server side app as a Firebase cloud function
- App connector model object
- App connector runtime is configured from the server side to expose client functions
- ✅ Async calls in the server side code are handled correctly to return when all settled
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

- Generate functions in same scope so they can call each other
- Combine them in an app object that can be exported in some way
- Use this object in another scope that creates an express app
- Use this express app in the deployed function
- Use the app object for running locally


