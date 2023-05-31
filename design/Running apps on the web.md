Running apps on the web
=======================

19 May 23

Aims
----

A review of the approach for running apps on the web
- Simplify deploying and running apps on the web for developers
- Less maintenance and moving parts for us
- Improved facilities like versioning, instant deploy/rollback, run old/new versions

Needs
-----

- Run client-only apps from GitHub
- Deploy client and server apps to hosting
- Avoid complex Firebase access permissions
- Allow use of private repos
- Avoid builds, but...
- Allow for builds if needed in the future
- New deployments available as quickly as possible
- Default current version
- Current version can be changed quickly by dev, up or down
- Other versions can easily be accessed by devs and general users eg with tag in URL
- Security around which users can access other versions
- Run from general app runner with app url in path
- Run from custom domain, still with versioning
- Allow multiple hosting environments connected to same GitHub repo, for testing
- Run preview of server apps with immediate update
- Preview server apps only available from editor with security

Forces
------

- Setting up permissions to deploy code to Firebase is hard
- Setting up permissions to access private GitHub repo is easier - just create an API key
- Storing secrets in GitHub is fairly easy
- Storing secrets in Firebase is ~~hard~~ easy if using an Extension
- Secrets for other services may be needed in deployed apps
- Continually accessing files direct from GitHub would lead to problems
- Local dev server gives possibilities for deploying to Firebase
- JsDelivr will cache versions
- JsDelivr will cache unspecified version forever, so cannot use that
- JsDelivr can pull code for server apps too
- Private repos will require a different way of pulling code
- Studio has to build code for preview anyway, so could commit to GitHub
- Committing build artifacts not seen as good practice, but quite possible
- Putting builds on a different branch may be good, but may also just complicate things
- If want to commit to GitHub on a different branch, would need a dance to check it out, do the build commit, check out main again - dodgy on client
- Want to avoid Firebase-specific stuff as far as possible
- Pulling code from GitHub as needed will give flexibility, but...
- Pulling code from GitHub as needed will need to be carefully cached to avoid slowness and costs
- Good to include the index.html in the built code so it can be tailored in the future if necessary
- Probably acceptable to require extra effort for server apps at this stage
- Generating code on GitHub requires a standalone generator


Possibilities
-------------

- Generate all app and server code in studio, commit to GitHub with source
- GitHub action builds code after commit
- Use a different branch for build artifacts
- App runner looks up version via GH API (as now) but gets generated code, not source
- App runner loads index.html and replaces its own content(difficult, scripts in new content do not run), or loads it in an iframe 
- Elemento hosts app runner that runs the app
- GitHub pages host the app runner page that runs the app
- Server Hosting uses a general app runner that pulls server code from GitHub
- Store secrets in .env file
- Store secrets in storage
- Have to install node and firebase tools OR install standalone firebase tools with bundled node
- Just deploy a standard server runner function and app runner index.html
- Can avoid builds if only use modules directly imported from npm via jsDelivr
- !!! The Firebase server could be the dev server instead of running locally!
- Potential to run a shared dev server for public use
- Firebase extension to install app server function
- Secret key shared between app server and editor for preview
- App server has list of users (by email address?) that can access preview and/or other versions

Decisions 20 May 23
-------------------

- Write generated code to disk in Studio
- Commit generated code with the source on the same branch
- App runner just loads the app code in its own DOM container
- Server app runner imports app code via same mechanism
- Server app runner can import different versions of server apps and run each concurrently
- Server app runner Firebase function is written to disk in the project directory
- Dev can install standalone firebase tools and deploy the server app runner from command line

Update 30 May 23
----------------

- Server app runner is in an extension, with configs for repo and keys/permissions
- Use Cloud Storage to cache downloaded code

Later
-----

- Load parts of index.html, like CSS or scripts