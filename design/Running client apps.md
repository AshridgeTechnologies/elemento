Running client apps
===================

Aims
----

- Clean up current zoo of ways to run an app
- Allow for more complex situations like types, multiple apps, npm imports, etc
- Fit with standard practice for deploying apps

Needs
-----

- Use types in a client app
- Use external modules eg from npm
- Have multiple client apps - possibly even on one page
- Run from plain JS code
- Run in preview
- Run from GitHub
- Run from Firebase hosting
- Run from any suitable server


Forces
------

- Using imports is widely supported and desirable
- Import maps not widely supported yet
- GitHub can run a build on each commit, or on command from dev
- Generating separate modules for types would be convenient
- The numbers of files in an Elemento app mean bundling not usually needed
- Already have separate asset files
- Continual updating without page refresh needed in preview
- No updating of imported files needed in normal running
- BUT do need to update imported files in preview
- AND imports never update once loaded SO data types cannot be imported in preview
- Simplest to have exactly the same code in preview as in production

Possibilities
-------------

- Generate each DataTypes into a separate module
- Generate each app into a module, with its pages
- Import DataTypes into the app module BUT won't wrk for preview
- Build DataTypes needed into each app and server app code file
- App generator could detect the DataTypes used and import them
- Generate an index.html file for each app

Decisions - 5 May 23
--------------------

- Generate:
  - a code file for each app that exports the app component (as now)
  - An HTML runner file for each app that imports the runtime, the app and runs it
  - ~~A file for each DataTypes~~
  - DataTypes are copied into each code file where they are used
- The code file is named after the app
- The runner file for the first app is index.html, <appname>.html for the others
- The DataTypes files are named after their source DataTypes BUT included in app code files
- All DataTypes files are included in each app, as it is very complex to follow dependencies and find which ones needed
- All code in same top-level directory - review later
- Asset files in files dir