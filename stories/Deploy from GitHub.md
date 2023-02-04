Deploy from GitHub
==================

Aims
----

- Developer can easily deploy to Firebase
- Remove troublesome client-side Firebase API functionality
- Fit better with common practice

Requirements
------------

- Uses access token available without complex command line work
- Studio has a way to get the token into a GitHub secret
- Can only be deployed by repo owner even if repo is public
- Success or errors are notified to developer
- Script is included in working copy
- Preview works with Firebase datastore


Technical
---------

https://github.com/google-github-actions/auth

https://stackoverflow.com/questions/72454571/deploying-firebase-cloud-functions-using-github-actions

https://cloud.google.com/blog/products/identity-security/enabling-keyless-authentication-from-github-actions

- Need to work out how to use access token from console
- Use old Firebase token?  google_application_credentials? Federated identity?
- Action does auth and calls separate script
- Script testable locally
- So need to run outside the studio
- Which means making the generator tools available in a library
- Can run a node script - doesn't have to be a command-line tool with args
- May also need a package.json so can install FB tools
- Generator tools library needs to be available to build - npm, download from Elemento?

Tasks
-----

- Example repo in GitHub and on disk with Firebase deploy and server app
- Build a library to make Generator available
- Make library accessible on internet
- Script to build files locally
- Deploy client app to FB hosting 
- Deploy server app to FB functions
- GitHub action

