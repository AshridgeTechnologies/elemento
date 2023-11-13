Server app preview
==================

13 Nov 2023

Aims
----

- Find a simple and effective way of running an instant preview of server apps in development

Needs
-----

- Server apps in a project run together with the client preview in Studio
- Server app previews update immediately as changes made
- Uses latest server runtime
- Memory leaks avoided to reduce serverless function running costs
- Latest version of server app always available even if not changed for some hours

Forces
------

- Server runtime updates rarely
- Server app could update 1/s or more
- Don't want unused instances of serverless functions hanging around for test
- Caching much easier with only one instance
- Still need to scale main app server
- Need to store things persistently for when instance goes away
- May be better to separate preview from main, for security, ease of management, etc
- Imports always leak

Possibilities
-------------

- Separate preview server
- Preview server handles the preview upload and serving
- Cache function versions in memory
- Cache latest function version in storage
- Limit scaling on preview server to one instance
- Throttle saves to storage
- Can store etag in metadata of server runtime and use to check whether new version on server

Decisions
---------

- Extension has Preview server function alongside main app server and admin server
- Preview server receives PUTs of updated server apps
- Create server app function using the Function constructor
- Hold map of latest version of each app function
- Write each new server app function to storage, overwriting previous
- On Preview server instance startup, load current version from storage
- Store server runtime in storage
- Create check for updated server runtime and download if needed
- Do check on Preview server instance startup
