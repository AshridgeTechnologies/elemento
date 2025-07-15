Cloudflare usability
====================

Aims
----

- Fix the loose ends and difficulties in using Elemento with Cloudflare

Requirements
------------

- New project is created on user disk
- Remove OPFS
- Keep recent projects and dir handles
- Copy client runtime to dist/cloudflare, use from there
- Calculations at App level
- Cannot have client updates without creating a server app to override authorizeUser
- Database id has to be in props, so awkward to assign new id and set up db in one function

Bugs
----

- Changing db id all the time (even undefined to an id) confuses everything
- ✅ In generated app, base App functions come from "app" instead of the state eg const {CurrentUrl} = app
- Preview app loses contact with data store after changes
- ✅ Show Page(Start, Date.now()) leads to Start??0=undefined
- ✅ CurrentUrl() not available in Page
- If change app name, the preview doesn't pick up the name
