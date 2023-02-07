Firebase permissions
====================

Aims
----

- Developers can easily set up a Firebase project for use with Elemento
- Complex authorisation and client calls to Firebase API are eliminated

Needs
-----

- Permissions and access tokens are set up for deploy from a GitHub action
- Firestore settings, functions and hosting can all be deployed
- Developer actions are minimised
- Developer actions are easy to explain, difficult to get wrong
- Failures can be easily diagnosed

Forces
------

- Function deployment needs a particular set of roles/permissions for the firebase service account
- The firebase service account created with the project does not have these
- Standard Firebase CLI init sets these up
- Expected UX with Elemento does not include installing node, Firebase tools and command line operations
- Web apps will need approval to get auth scopes that allow setting up permissions
- Doing things outside the approved way will usually be troublesome
- Delivering standalone apps to run locally is an overhead and poor UX
- Maintaining server functionality is an overhead and a cost
- Firebase token is not very secure and needs Firebase CLI to create
- Service account access token can be generated in console, but no good unless account has permissions
- Workload identity federation is very complex
- The project is not in a disk filesystem, so firebase-tools probably won't run locally anyway
- Auth requires a web browser even in a node or CLI app

Possibilities
-------------

- Use another cloud service - but Firebase is a sweet spot for many reasons
- Adapt Gapi and deploy functionality in Elemento
- New standalone web app just to do the setup
- Node-based app to download and do setup
- Call firebase cli functions from an app to do init
- Super-detailed instructions for dev to do it in Google Cloud console
- Wait for a better solution to come along