Cloudflare
==========

3 Apr 2025

Aims
----

- Explore possibilities for using Cloudflare as a deployment platform

Forces
------

- Durable objects seem like best option for low-cost multiplayer games
- Free plan that includes server functions
- Low cost paid plans
- Deployment seems much quicker
- Git deployment seems to work easily
- Local dev seems simpler
- Firebase has a poor reputation these days
- Cloudflare is a better future bet - more popular, still being improved, part of core business
- Have jumped through a lot of hoops and built a non-standard deployment mechanism to provide dev preview for server functions
- Performance seems better
- Facilities like DB are all in place now
- Workers can include static files, OR Pages can include functions
- Risk of vendor lock-in
- Difficult to avoid installing node then wrangler

Possibilities
-------------

- Ditch all the service worker and other stuff for preview, just use wrangler
- Have a public dev/preview server available on CF
- Run wrangler in a server, write files to local disk for it to process

General client approach - Spike 1
--------------------------

- Move towards conventional development, find other ways to smooth the edges for novices
- Elemento studio produces a conventional code structure on user disk (not OPFS)
- Wrangler (or another tool) does:
  - build
  - deployment
  - local dev server
- Preview app does dynamic import of generated app module and refreshes when triggered, as now
- Use postmessage, so studio can talk to preview window on different domain

Initial server app approach
----------------------------

- Server Apps included in the worker
- Worker fetch code looks up the server app and calls it

Later server app approach
------------------------

- Functions can be marked as client or server
- Server app and server app connector removed
- Client has stubs for server functions generated
- Stubs return a Pending until they update
- ServerAppConnector => ServerFunctionConnector
- Can you make the connector extend Function so it is callable?
- Can Refresh server functions, multiple args

Tasks
-----

- ✅ Set up Cloudflare worker project
- ✅ Preview from wrangler dev server
- ✅ Cloudflare D1 datastore
- ~~Cloudflare KV datastore~~
- ✅ Cloudflare Durable object datastore
- ✅ Alternative authentication
- ~~Make CreateUser, UpdateUser, GetUser work again - or~~ find a better alternative
- Remove Firebase
- Remove preview server

Issues
------

- How to handle client runtime - dynamic import from elemento site, import from deployed site, bundle before deploy, get from elemento, get from npm
- How to handle server runtime - get from elemento, get from npm? where to do it?
- How to set up a cloudflare project from scratch
  - Need KV datastore for auth, with id in settings

Cloudflare project scenario
---------------------------

- Create new project in Studio
- Write wrangler.jsonc, index.js etc to project dir
- Start wrangler dev in the project dir
- Develop project
- Save to GitHub
- Deploy to Cloudflare from PC


