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
