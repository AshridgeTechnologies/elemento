Deploy from GitHub
==================

Aims
----

- Developer can easily deploy to Firebase
- Remove troublesome client-side Firebase API functionality
- Fit better with common practice

Requirements
------------

- Uses access token that is available without complex command line work
- Studio has a way to get the token into a GitHub secret
- Can only be deployed by repo owner even if repo is public
- Success or errors are notified to developer
- Script is included in working copy
- Preview works with Firebase datastore
- Images work on deployed app
- Document manual steps to set up Firebase


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

- ✅ Example repo in GitHub and on disk with Firebase deploy and server app
- ✅ Build a library to make Generator available
- (✅)Make library accessible on internet
- ✅ Script to build files locally
- ✅ Deploy client app to FB hosting 
- Deploy server app to FB functions
- Get firebase config and add to deployed files
- ✅ GitHub action
- Remove unnecessary dependencies in Generator library
- ✅ Ensure icons still OK in studio

Steps to set up action
----------------------

- Create .github/workflows/deploy.yml


Steps to set up Firebase - permissions problems
------------------------

- New Google account if required
- Sign in to console
- New project
- New app - with hosting
- Create service account
- Download private key
- Need to enable at least two APIs (cloud function, artifact registry) - why not automatic?

Steps to set up Firebase - by the book
--------------------------------------

- New Google account if required
- Sign in to console
- New project
- (Not: new app)
- Upgrade to Blaze plan
- Create Firestore DB
- In CLI, firebase login
- firebase init - select hosting, firestore, functions
- Fiddle settings
- npm install in functions dir
- firebase deploy

With private key in credentials
-------------------------------
- deploy hosting OK
- deploy functions, firestore fail on permissions error

Permissions needed
------------------
artifactregistry.googleapis.com
cloudbuild.googleapis.com
cloudfunctions.googleapis.com
eventarc.googleapis.com
pubsub.googleapis.com
run.googleapis.com
storage.googleapis.com

BUT these are provided by three roles, as in
https://davelms.medium.com/deploy-firebase-functions-using-github-actions-7dbafbd4df77
Cloud Functions Admin, Artifact Registry Writer, Firebase Authentication Viewer

With this, command line deploy works

Options
-------

- Look at the other auth method - Workload Identity Federation
- Find an easy way to auto add all the permissions
- Search for github action functions deployment
- Instructions to add all manually in console

