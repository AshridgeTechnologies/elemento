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
- Collections at App level
- Database id has to be in props, so awkward to assign new id and set up db in one function
- Single named data values in data store eg for whose turn - link to Data elements?
- Link element with content and href props useful
- Copy to clipboard function useful

Bugs
----

- !!! Intermittent failure to sync
- !! In create child states, if a Calculation value calls a function that uses another component, that component will not exist yet, as all assigned to childStates at the end
- Even if it did - are dependencies calculated recursively
- Runaway connections to db from client when first create and use the datastore
- ✅ When app re-renders due to url change, it still sees the old url
- ✅ Changing db id all the time (even undefined to an id) confuses everything
- ✅ In generated app, base App functions come from "app" instead of the state eg const {CurrentUrl} = app
- Preview app loses contact with data store after changes
- ✅ Show Page(Start, Date.now()) leads to Start??0=undefined
- ✅ CurrentUrl() not available in Page
- If change app name, the preview doesn't pick up the name
- Corruption of text in Text when creating <a> element with HTML


To set up project
-----------------

- Open project in studio to write initial files
- npm install
- Need to create KV namespacewith: `npx wrangler kv namespace create auth`
- Need to put its id in project config: {"authStoreId": "generatedId"}
- npx wrangler dev
