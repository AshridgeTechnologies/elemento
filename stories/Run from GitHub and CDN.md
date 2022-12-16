Run from GitHub and CDN
=======================

Aims
----

- Can run a client app directly from a project stored in GitHub

Requirements
------------

- Given: a GitHub repo exists with an ElementoProject.json at the top level
- Runner page available at elemento.online/run
- Further path given to runner page is in the form /gh/user/repo
- Finds the latest commit
- Loads the project file
- Generates code and runs the app
- Can access Firestore direct from client

Desirable
---------

- If a tag called CURRENT_LIVE exists, use that commit
- Can specify a tag or commit to run a particular version

Tasks
-----

- GitHub commit reader
- Runner bundle including GitHub access and generator
- Runner page can get latest version of project file via CDN
- Can generate code from project file
- Injects code into page to run app