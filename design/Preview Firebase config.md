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
