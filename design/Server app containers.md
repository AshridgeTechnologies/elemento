Server app containers
=====================

31 Jan 2024

Aims
----

- Improve developer experience
- Avoid difficult Google rules and requirements
- Improve reliability in light of 30 Jan server bug
- Fit in better with current practice
- Improve flexibility for future

Needs
-----

- Preview can run locally or in cloud
- Deploy can run locally or in cloud
- App server can run in cloud (or locally)
- App server easily deployed to different environments
- Local tools can easily be run on different OS
- Insulate app server and tools from environment changes like the 30 Jan server bug

Forces
------

- The server bug on 30 Jan (see problems) was worrying as it made a previously working environment useless from one day to the next
- Most of the working code for app server and tools can easily be configured to run in a container
- Containers can be deployed on Firebase and integrated into Hosting via rewrites
- Preview and deploy need a consistent environment but don't have to run on a cloud server
- Extensions show lots of little niggles as you get into them
- Extension approval process is a big unknown
- Docker is easy to install locally
- Installing and updating Docker images is easy
- Google Cloud container services can be installed via API, extensions can't
- Local tools open up many future possibilities

Possibilities
-------------

- Deploy server could install container as now and then upload new versions
- Deploy server could create a new container image for each deploy


Initial spike 22 Oct 24
=======================

- Current extension functions are all on same URL (different to deployed site)
- First part of path indicates the individual functions (app server, preview, admin)
- So could have an app server process where first part of path decided the area - app server, preview admin
- Express can have other express apps as request handlers

Running in container locally
----------------------------

- PROJECT_ID set as env var, so can pick up to set default bucket when initialize admin app
- Service account key file dir set as bind mount
- GOOGLE_APPLICATION_CREDENTIAL set to internal location of service account key file
- Could also get service account key contents another way and pass to init admin app
- Expose container port on local machine
- Temporarily hardcode localhost url in FirebaseDeploy tool and EditorRunner

Running on Google Cloud
-----------------------

- Change elemento site to full URL
- Build image
- Follow steps to deploy manually
- Deploy from firebase tool
- Use server as preview server

Ready for use
-------------

- ✅ App server image on Dockerhub
- ✅ Bootstrap deploy tool in Elemento studio for Google Cloud Run
- ✅ Friendly URL set up in hosting redirect

Further steps
-------------

- ✅ App server can do apps, deploy, preview and install
- ✅ Each facility can be switched on or off when deployed
- ✅ Consider how the project id is/should be supplied to each service
- ✅ Have a default project id for each deployment
- ✅ Get default project id from env var
- ✅ Installer sets env var
- ✅ App server has to use the default project
- ✅ Admin server deploy and setup should use the default project id but allow override in request
- ✅ Install server never uses default project


Further requirements
--------------------
- Firebase deploy tool has UI for install
- Server with install capability on elemento.online
- Firebase deploy tool can deploy to different firebase project
- Server has basic home page showing status and services available

