Security and debugging
======================

Aims
----

- Allow inspection and control of running apps by developers
- Prevent attacks on running apps from any source

Needs
-----

- In appropriate environments, allow apps such as editors and debuggers to inspect and change data in a running app
- Allow multiple apps to run safely in the same page
- Allow control by tutorials and wizards (this will be needed in production even if debugging not available)

Forces
------

- How often would anyone really want to run two Elemento apps in the same page?
- If they did, should it be up to them to work out whether to trust the other app?

Possibilities
-------------

- Apps could be published without debugging facilities
- Development runtime is different to the production one
- Apps start in debug mode or not
- Every user has own sub-domain on apps.elemento, run apps in iframe
- Allow random sub-domains on apps.elemento
- Redirect to a random sub-domain - effect on caching?

Initial decision 9 Jun 22
-------------------------

- Optionally pass a debugger object into AppRunner
- Create this in AppRunnerForPreview and expose at window level
- Move selection mechanisms ino the debugger
- Editor and associated tools can use the debugger to inspect and control the app