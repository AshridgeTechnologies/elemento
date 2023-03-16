Serve preview from service worker
=================================

Aims
----

- Remove complications and restrictions of using WebContainer
- Keep improvements made
- Prepare for implementing [Project directory in disk files](Project%20directory%20in%20disk%20files.md)

Requirements
------------

- All client preview facilities available with WebContainer are provided by a service worker
- GitHub works within Editor as previously
- Editor opens without any project open

Technical
---------

- ✅ New service worker for editor and preview scope
- ✅ Preview URL is /preview/
- ✅ Copy in interfaces for FileSystem structure from WebContainers
- ✅ SW handles mount message, with FileSystem
- ✅ EditorRunner mounts initial files
- ✅ SW is a unit-testable class with message handler and emitters
- ✅ SW handles requests for top-level files
- ✅ SW handles requests for asset files
- ✅ SW handles write message to update a file
- ✅ Editor writes updated file
- ✅ SW sends update message to all preview clients after write
- ✅ Preview handles update message
- ✅ SW handles editor highlight message, sends to all preview clients
- ✅ Editor sends highlight message
- ✅ SW handles preview highlight message, send to editor
- ✅ Preview sends highlight message
- ✅ Editor receives client highlight message

Open without project
--------------------

- ✅ ProjectHandler can be empty
- ✅ If no current project, display ProjectOpener instead of Editor
- ✅ Project Opener menu has File->New/Open/GetFromGitHub, and Help
- ✅ Main window is instructions on what to do
- ✅ Help Panel shows at bottom


To do
-----

- ✅ Try to get first load working better
- ✅ Do not init WebContainer
- Remove WebContainer stuff
- Check out all the setProject stuff in EditorRunner
- Work out how to set project in PW tests - maybe once have disk projects
- Try to get files transferred as transferables