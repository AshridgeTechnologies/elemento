Automatic open from GitHub
==========================

Aims
----

- Developer can instantly and easily open any tutorial, example or other project from GitHub in Studio
- Can open tutorials from a link and see instructions immediately

Requirements
------------

- ✅ Open from GitHub menu option
- ✅ In dialog, paste in GitHub URL and confirm
- ✅ Project is loaded and shown instantly
- ✅ Changes are persisted in a private store within the browser
- ✅ Can Save to computer disk
- ✅ If studio opened with ?openFromGitHub=<github-url> the project is opened immediately
- ✅ Can display Tools on open
- ✅ Rename Get from GitHub to be Download from GitHub
- ✅ Can see and reopen projects in the private store
- ✅ Hide Download from GitHub - always clone to private store

Technical
---------

- ~~Implement OpfsProjectStore on DiskProjectStore interface~~ 
- Rework GetFromGitHub to be OpenFromGitHub, replace file picker with OPFS
- Rework NewProject to be SaveToDisk

Next
----
