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


Design - 17 Oct 22
==================

firebaseApp module
------------------

- Caches initialized app
- Has getApp to get current app value
- Has onAppChange to subscribe to changes
- Has setConfig to set config externally
- When app is requested by getApp or onAppChange, and it is null, tries to initialize app from server config
- Server config is requested once and error logged if it cannot be loaded
- If gets server config, caches and notifies subscribers
- If setConfig called, initializes app, caches and notifies subscribers 

authentication module
---------------------

- Caches the auth initialized from the current app
- Has internal getAuth that is used by various auth-related functions
- Subscribes to onAppChanged in firebaseApp when auth first requested
- getAuth is null if no app is present
- getAuth caches the auth when the app changes
- If getAuth returns null, other functions are null or do nothing
- If app changes, sign out of any previous auth and unsubscribe, cache a new auth or null
- Provide a separate exported auth state observer that covers change of app and sign-in/out
- User logon subscribes to that to know when it can show the button
- Provides hooks useAuthReadyState and useSignedInState

Firebase datastore
------------------

- Caches the Firestore Db
- Subscribes to onAppChanged in firebaseApp
- If being observed, subscribes to auth state in authentication and invalidates when changes
- db is null if no app
- On app change, db is recreated and all observers invalidated
- All functions return null/empty/do nothing when no db
