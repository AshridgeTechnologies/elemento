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
- ✅ Can use global functions on server side
- ✅ Can access data stores on server side
- ✅ Actions are sent as post
- ✅ Queries are sent as get
- ✅ Query parameters are parsed as if they were string values (numeric strings to numbers, etc)
- ✅ Deploys server side app as a Firebase cloud function
- ✅ Updates server side app as a Firebase cloud function
- ✅ App connector model object
- ✅ App connector runtime is configured from the server side to expose client functions
- ✅ Async calls in the server side code are handled correctly to return when all settled
- ✅ App connector functions can use object values
- ✅ Calls from client are cached and updated when resolved, like db calls
- ✅ Firebase authorization is transmitted to the server side
- ✅ Current user is available in server functions, via CurrentUser()
- ✅ Errors are reported as for client app
- ✅ Server app connector can (should/must?) have the same name as the server app
- ✅ Server app connector cache can be refreshed in a sensible way
- ✅ All necessary code gen features from client generator are included

Moved to Part 2
---------------
- Preview can use simulated server running in browser
- Documentation includes all prerequisites inc manual steps like enabling API in Cloud Console
- Google approval for Elemento to remove security warnings
- Server functions can run within the client app
- Server app can provide an external API with configurable paths

Implementation notes
--------------------

- Generate functions in same scope so they can call each other
- Combine them in an app object that can be exported in some way
- Use this object in another scope that creates an express app
- Use this express app in the deployed function
- Use the app object for running locally

Setup to enable API
-------------------

Enable Cloud Run Admin API

Cloud Functions uses Artifact Registry to store function docker images. Artifact Registry API is not enabled in your project. To enable the API, 
visit https://console.cloud.google.com/marketplace/product/google/artifactregistry.googleapis.com or use the gcloud command 'gcloud services enable artifactregistry.googleapis.com'.

Could not build the function due to missing permissions. Cloud Build API has not been used in project 266192601073 before or it is disabled. 
Enable it by visiting https://console.developers.google.com/apis/api/cloudbuild.googleapis.com/overview?project=266192601073 then retry. 
If you enabled this API recently, wait a few minutes for the action to propagate to our systems and retry.

Complications with testing
--------------------------

- Client app expects the server app to be on same origin
- Getting firebase-admin authorised if running outside Firebase 
- SO:
  - add URL property to ServerAppConnector - will need similar for API connector anyway
  - use a one-line express runner, with Google service account key in the environment variable

Generator features needed
-------------------------

~~quote escaping~~  Not needed yet as no fixed value properties
✅ dependency order
✅ code generation error
✅ expressions to functions
✅ private user-defined functions
✅ error for syntax error
✅ error for unknown name
✅ error for statement not expression
✅ multiple statements only in action
✅ assignment treated as comparison
✅ error for property shorthand
✅ error for unexpected number in expression

