Firebase Deploy 2
=================

Aims
----

- Run elemento server functionality in a container, not the extension

Requirements
------------

- ✅ Change elemento site to full URL
- ✅ App server image on Dockerhub
- ✅ Bootstrap deploy tool in Elemento studio for Google Cloud Run
- ✅ Friendly URL set up in hosting redirect for the Cloud run service
- ✅ App server can do apps, deploy, preview and install
- ✅ Each facility can be switched on or off when deployed
- ✅ Consider how the project id is/should be supplied to each service
- ✅ Have a default project id for each deployment
- ✅ Get default project id from env var
- ✅ Installer sets env var
- ✅ App server has to use the default project
- ✅ Admin server deploy and setup should use the default project id but allow override in request
- ✅ Install server never uses default project
- ✅ Server app client uses new URL
- ✅ Preview uses new URL
- ✅ Firebase deploy tool has UI for install
- ✅ Server with install capability on elemento.online
- ✅ Server has basic home page showing status and services available
- ✅ Tidy up old files and directories in elemento-app-server

Further requirements
--------------------
- Server admin only accessible with admin login
- Firebase deploy tool can deploy to different firebase project
