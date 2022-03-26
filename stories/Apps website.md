Apps website
============

Refactor to run from code
-------------------------

- ✅ App code is generated in the editor
- ✅ Runtime can have code inserted by the editor for preview
- ✅ Runtime loads code file
- ✅ Runtime expects a React component that it renders
- runApp.ts is refactored to a sensible module or component, and unit tested
- ✅ Runtime path is just 'run'
- Can save app code from the editor

Editing
-------

- Site on apps.elemento.software
- Home page has create an app and run an app panels with links
- Create an app opens studio on /studio path
- Apps are given a unique id when created

Login
-----

- Can login with Google, Facebook or email/password

Publishing
----------

- Editor can load code to cloud storage
- Publish or update the code
- Must be logged in to create or update
- Can only update apps you have created
- Even if you hack the URL you can only update apps you have created
- You can create an app with the same name as another, but not the same id

Running
-------

- Runtime html page
- The path /run always rewrites to the runtime page
- The next segment can contain an id, optionally preceded by a descriptive name
- The page loads the app whose id occurs in the second path segment
- There can be further path segments

Versioning
----------

- Each new version must be distinguished by a unique serial no
- it must not be possible to publish apps with the same id as one already used, even with a different serial no

Loading the code
----------------

- The code is available through a GET to /code/<id-plus-name>
- It is served with content-type text/javascript

Setup Environment
----------------- 

- All actions to set up an environment with the apps website must be in code
- The environment must be updatable with the same code
- Must be able to run the setup with just one script and the name of the environment

