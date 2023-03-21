Simulate server apps
====================

Aims
----

- Developers can easily use a simulation of a server app with their client preview

Requirements
------------

- Preview works with a simulated server app
- Changes are applied instantly if no errors
- Errors are shown as with client
- Business logic is identical
- Firebase data store can be connected
- OR (if this is not possible) Firebase data store can be simulated with a disk data store
- Additional installs and updates are simple and foolproof

Technical
---------

- Dev server app
- Build executable with pkg
- Try to have minimal executable that downloads latest version from website
- Runs express server
- Express server changed to have dynamic routes from path, rather than fixed
- Dynamic import of server app
- PUT route on express server saves server app code to disk and re-imports
- Studio loads server app into dev server after every change