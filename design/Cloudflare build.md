Cloudflare build
================

12 May 2025

Aims
----

- Decide the best way of building for Cloudflare
- Make the "cloudflare:workers" import available for Tinybase Durable Object storage

Needs
-----
- To use Tinybase Durable object storage, you need to extend WsServerDurableObject, which extends the Cloudflare DurableObject class, which is imported from "cloudflare:workers"
- Fit with conventional dev practice
- Leave open the possibility of automatic setup for novices


Initial problem
------

- The CF class must be imported from "cloudflare:workers", which is only recognised in Wrangler builds
- The Tinybase module containing WsServerDurableObject cannot be built into the serverRuntime bundle, as the "cloudflare:workers" is not available to esbuild
- Marking "cloudflare:workers" as external allows esbuild to run, but wrangler then fails with a dynamic require not available error
- The current generated server has a package.json but no dependencies, so no need to run npm install - everything comes from serverRuntime

Forces
------
- We need Wrangler anyway, which cannot be installed without node and npm
- Wrangler does its own bundling (using esbuild) and pulls in only what it needs from serverRuntime
- Having the Elemento runtime available as npm module would probably be good
- Publishing an npm module involves some work

Possibilities
-------------

- Isolate the Durable object stuff in another runtime file

Initial solution
----------------

- Change format of serverRuntime to esm, name it .mjs
- Keep cloudflare:workers marked as external
- The import now works as desired in the wrangler build
