Run preview from working copy
=============================

Aims
----

- Prepare for multiple files and assets
- Simplify app-running code
- Reduce differences between preview and deployed

Requirements
------------

- Preview works as it does before the change

Implementation
--------------

- Refactor AppRunnerFromGitHub to extract AppRunnerFromElementoSource
- Spike: fetch interceptor to handle editorPreview/localName/... requests by retrieving from working copy