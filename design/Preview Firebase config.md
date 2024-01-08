Preview Firebase config
=======================

20 Dec 23

Aims
----

- Allow Firebase-dependent features to work in preview

Needs
-----

- Firebase authorization works
- Firestore data store works
- Which means that the client can get the Firebase config

Forces
------

- Client expects the config to be downloadable in /firebaseConfig.json
- For deployment, admin server generates this file
- Generating it requires a firebase access token
- Generating it requires a web app 
- Deploy generates the web app if one does not exist
- Preview will normally be used before deploy, so web app will not be there
- Preview does not have an access token - it uses a separate password
- You only need to create the default web app once, and the config once if store it
- If client code asks for config at /, this needs to be redirected by service worker
- Must prevent private settings eg preview password from being downloaded

Possibilities
-------------

- Post-install step to set up default web app
- Post-install step to set up firebase config
- ~~Create app or get config via firebase-admin API~~?  Does not appear to be possible
- Have to deploy before preview available
- Initialize function in admin server
- Firebase tool checks if initialized and prompts if not
- Initialize generates and sets password

Decision
--------

- A setup project feature is not too much of a burden, as it is one off and will be used by advanced users
- Can be combined with setting preview password from Firebase tool, so actually simplifies extension installation
- Editor service worker sends request for /firebaseConfig.json to {previewServerHost}/preview/firebaseConfig.json

After initial work...
---------------------

- The Firebase Tool starts to look really complicated
- The complexity of installing the extension and initialising is too great
  - being in a half-installed state is confusing and difficult to manage
  - the developer doesn't care where their project and preview runs - they just want to use it
  - assuming advanced users for server apps goes against the grain of the Elemento approach
- Extensions are still a bit inconsistent and difficult to use and encumbered with restrictions
- Updating extension versions seems difficult - unless published, maybe
- But... 
  - extension would make Elemento look more acceptable
  - extension in Google directory would raise profile
