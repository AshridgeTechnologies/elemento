Firebase Deploy Tool
====================

Aims
----

- Make it easy for developers to deploy a Project to Google Firebase

Requirements
------------

- Tool that can be imported from Elemento website
- Initially works with Firebase project id held in the Project
- Can override Firebase project id
- Works out url of deploy server installed by extension
- Button/display for Google signin
- Button/display for GitHub signin
- Deploy button

Further requirements
--------------------

- Enter version - defaults to main
- Can choose version to deploy - commit id or tag
- Can deploy as a preview channel

Technical
---------

- Reuse shared/UserMenu if possible OR look for standalone GH auth