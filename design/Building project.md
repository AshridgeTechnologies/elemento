Building project
================

Aims
----

- Clean up the various ways of generating and updating files
- Have a flexible project builder for preview and deployment
- Build project in the same way for preview and deploy to avoid surprises and reduce maintenance

Needs
-----

- Puts generated code in right places
- Puts asset files in right places
- Puts runtime files in right places
- Same builder with plugin adaptors works for preview and build for deploy
- In preview, can update the built files
- Update only files needed to improve performance and flicker
- Throttle file updates to reduce flicker

Forces
------

- Many ways responsibilities could be divided between builder and associated objects
- Preview and deploy builds use sources and sinks with very different characteristics
- In preview, client and server files written in different ways
- Files are only updated in preview, so only need to worry about reducing updates in preview
- May be easier to just overwrite than work out whether needed
- Project generated files change constantly
- Usually only one app will be changing at a time
- Often have a sequence of many small changes together as user types
- User wants to see effects of update quickly
- Runtimes will rarely change
- Asset files will rarely change content
- Asset files may be renamed, but very rarely
- Throttling only needed for project updates
- Old versions of renamed files will rarely cause trouble
- Bugs that cause files to be not updated when they should be will be very annoying
- Builder needs to hold code anyway for preview - if we keep preview

Possibilities
-------------
- Start by overwriting each file on each change, optimise as needed
- Asset files written individually on upload or rename
- Builder delegates to specific writers for preview and deployment build environments
- Builder regenerates all files that could change after a project or asset file change
- File writers may implement ways to avoid unnecessary writes
- A cache of writes and content in the writers would be fairly easy to do
- Throttling could also be implemented in the writers
- Throttling could be done in builder, only for updateProject
- Could pass a hint to writer about whether file may change

Decisions
---------

- Builder regenerates all files that could change after a project or asset file change
- Builder does throttling on updating project generated files
- Deploy writers have no updated check or throttling
- Preview writers have no caching to start with, could add later