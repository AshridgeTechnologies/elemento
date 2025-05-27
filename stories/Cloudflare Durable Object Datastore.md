Cloudflare Durable Object Datastore
===================================

Aims
----

- Provide a low-cost datastore synchronized between clients for games and collaborative apps
- Provide a private datastore limited to one or a few users or a single "event" such as a game play

Requirements
------------

- Conform to the standard Elemento data store interface
- Allow a dynamic id for the database name
- Server-side store
- Client-side store with sync
- Support two-way sync
- Support server-to-client only sync
- Fine-grained sync for individual record fields
- Provide an observable for updates
- Authorization for read and write on client
- Immediate multi-user sync for apps like games
- Offline working and sync when connect

Technical
---------

- Consider how to do updates for a Collection - maybe InvalidateAll on every change
- Consider whether we need Collection any more - or whether every Collection should be a Tinybase store
- Consider Collection being a very thin wrapper and using a Tinybase store by default

Tasks
-----

- ✅ Spike putting DO server on subpath
- ✅ Spike moving client into a datastore object
- ✅ Assess need for unsubscribe on destroy etc - prob ok without
- ✅ DO and routing in cloudflareWorker
- ✅ Client datastore that connects to DO
- ✅ Server side datastore that acts directly on DO
- Use individual table fields instead of JSON lump
- Model objects and generation
- Server side current user and authorization
- Authorization for read and write on client
