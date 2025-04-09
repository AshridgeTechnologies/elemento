Set up Cloudflare worker project
================================

Aims
----

- Easy to set up a project to work with Cloudflare

Requirements
------------

- Generate wrangler.jsonc
- Generate index.js
- Elemento project file NOT loaded by cloudflare
- Static assets handled correctly
- Paths and queries work
- Server functions work
- Can run wrangler dev for local testing
- Can deploy

Technical
---------

- ProjectBuilder writes files to cloudflare dir
- ProjectBuilder writes standard wrangler.jsonc, package.json
- Server runtime works in wrangler build
- Standard fetch and requestHandler in server runtime
- ProjectBuilder writes standard index.js
- Write server runtime file to server dir
- Write client runtime to client dir
