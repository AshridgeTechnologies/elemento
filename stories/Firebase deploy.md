Firebase deploy
===============

Aims
----

- Developer can easily deploy a project to a Firebase project

Requirements
------------

- ✅ Firebase project is created manually
- ✅ FirebasePublish model component
- ✅ Firebase details necessary are held in the model component (just project name to start)
- ✅ Can deploy to different projects with multiple instances
- ✅ User logon with Google required
- ✅ Ask for permissions only when publish to Google
- ✅ Publish to Google Firebase action on the model component
- ✅ All necessary files loaded to FB hosting
- Display progress and errors
- Display link to open on success
- ✅ Site serves HTML page which loads libraries and generated code
- ✅ Use modern techniques like imports and modules where possible
- Use hashes on file names and caching headers to improve performance

Implementation notes
--------------------

- Build generates a runtime module with react and other deps built in
- Runtime module is loaded to Elemento hosting with a version no
- ...and served from there
- Generate a module for app code, imports runtime, exports appRunner function
- Generate an index.html that imports and runs the app module