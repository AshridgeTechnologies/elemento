Firebase deploy
===============

Aims
----

- Developer can easily deploy a project to a Firebase project

Requirements
------------

- Firebase project is created manually
- Can deploy to different projects
- Firebase details necessary are held in the Project
- User logon with Google required
- Ask for permissions only when publish to Google
- Publish to Google Firebase option in menu
- Confirm dialog with choice of Firebase project to deploy to
- All necessary files loaded to FB hosting
- Display progress and errors
- Display link to open on success
- Site serves HTML page which loads libraries and generated code
- Use modern techniques like imports and modules where possible

Implementation notes
--------------------

- Change deployment to use a runtime library from CDN
- 