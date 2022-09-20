Preview with remote resources
=============================

Aims
----

- Studio preview works when remote resources eg Firestore are needed

Needs
-----

- Works now for Firebase, adaptable to other hosting in the future
- Developer can easily set which remote environment to connect to
- Can use live or test environments
- It is obvious which remote environment you are connected to
- Preview works normally

Nice to have
------------

- Works in elemento apps publishing

Forces
------

- Existing solution for deployed running is to download a config from the host
- Studio gets the config to deploy from Firebase API
- Currently, Gapi is initialized, and permission requested, when you deploy

Possibilities
-------------

- Config could be injected into the preview page
- Preview page could work like the deployed page
- Mark a Firebase Publish as the Preview env
- If Firebase Publish objects exist, show a select with their names in preview bar
- Don't show preview until selected a project
- Ask for permission when select project
- Use top-level await in gapiProvider to fetch config if it exists, or log a warning and leave empty if not

Spike 1
-------

- Collect the names of all Firebase Publish objects in the Elemento Project
- If they exist, put a bar with a select of the names above the preview frame
- When select, ask the Firebase Publish to get its config
- Inject the config into the preview