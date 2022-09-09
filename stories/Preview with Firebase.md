Preview with Firebase
=====================

Aims
----

- Can use Studio Preview with a Firebase project

Requirements
------------

- If Firebase Publish objects exist in the Project, show a select above the Preview
- Show names of the Firebase Publish objects in the select, default is Please connect...
- No Preview shown until select a Publish
- When selected, ask the Publish for its config
- Publish can get its config from Gapi and cache it
- When have the config, show the preview and inject the config
- Config used is injected one in preference to download
- Do not try to download a config in Preview
- Preview works normally
- Can change configs and get different data