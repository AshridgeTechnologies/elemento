Run preview from working copy
=============================

!!! ABANDONED !!!


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

- Refactor AppRunnerFromGitHub to extract AppRunnerFromSource
- Spike: fetch interceptor to handle editorPreview/localName/... requests by retrieving from working copy

Outcome
=======

- Fetch interceptor worked well, but there were many complications:
  - in getting the app to update after change
  - keeping the state across changes
  - still need to generate code in editor to display Code view and errors
SO - story abandoned, kept AppRunnerFromSource refactoring
