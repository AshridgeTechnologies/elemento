Firebase config management
==========================

Aims
----

- Make use of Firebase easy for developers
- Allow multiple environments

Needs
-----

- Developers do not need to deal with Firebase configs in most cases
- An app deployed to Firebase hosting picks up its config automatically
- An app can be deployed elsewhere and use Firebase if the config is also uploaded
- If there is no Firebase data or storage, no config file is required
- A config for at least one environment is available in preview
- 


Forces
------
- Config can be downloaded via the management API (check)
- Things executed when module loaded make it hard to manage different configs
- Downloading config at runtime means accessing the app must be async
- Downloading config only when required means no config needed if Firebase not used
- Multiple Firebase apps can be initialised, with different names
- Elemento environment must be kept separate from execution envs
- Preview environment must be chosen from available envs
- Elemento login is separate to the auth for Firebase management
- Projects should not store configs or apps 


Possibilities
-------------
- Config could be downloaded when Firebase first needed so long as everything is async
- Config could be a module picked up by the import mechanism
- Test with a different kind of database in preview