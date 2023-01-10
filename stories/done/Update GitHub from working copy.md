Update GitHub from working copy
===============================

Aims
----

- Can store project in GitHub to share or backup
- Can store project in GitHub to publish it so others can run it

Requirements
------------

- ✅ Can sign in to GitHub
- ✅ Uses previous sign in to GitHub if already signed in
- ✅ Displays Signed In as name, or email if no display name
- ✅ Action on Project to Save to GitHub
- ✅ If not linked to a remote, create the repo
- ✅ Confirm/change the repo name to create in a dialog
- ✅ Commit and push the updated commit
- ✅ Can enter a commit message
- ✅ Always use default branch
- ✅ JSON files are sent pretty-printed
- ✅ Display confirmation message when done
- ✅ Link to run app shown when in GitHub
- ✅ Remove Publish and associated code
- ✅ Handle conflicting changes sensibly
- ✅ Can sign out from GitHub
- ✅ Prevent/change bad characters in repo name

Technical
---------

- Store repo name separately to project? Or do whatever Git does? - Yes remote name stored in Git config
- 