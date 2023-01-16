Server side apps - test and deploy
==================================

Aims
----

- Instant redeploy of server apps in development
- Debugging of server apps
- Quick deployment of server apps
- Allow conventional deployment in flexible ways
- Allow use of npm packages

Forces
------

- Express apps can be restarted very quickly
- npm install is slow
- Firebase function deploy is even slower because of above and container initialisation
- Many server container environments to choose from
- User needs to own/pay for dev and prod environments
- Firebase Function deploy from client is a nightmare - complexity of process, authentication from browser

Possibilities
-------------

- Get latest from GitHub as for browser runner
