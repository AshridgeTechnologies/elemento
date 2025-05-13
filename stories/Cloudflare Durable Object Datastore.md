Cloudflare Durable Object Datastore
===================================

Aims
----

- Provide a low-cost datastore synchronized between clients for games and collaborative apps
- Provide a private datastore limited to one or a few users or a single "event" such as a game play

Requirements
------------

- Conform to the standard Elemento data store interface
- Provide an observable for updates
- Allow a dynamic id for the database name


Technical
---------

- Consider how to do updates for a Collection - maybe InvalidateAll on every change
- Consider whether we need Collection any more - or whether every Collection should be a Tinybase store

Tasks
-----

- ✅ Spike putting DO server on subpath
- ✅ Spike moving client into a datastore object
- ✅ Assess need for unsubscribe on destroy etc - prob ok without
- ✅ DO and routing in cloudflareWorker
- Client datastore that connects to DO
- Server side datastore that acts directly on DO
- Server side current user and authorization
- Authorization for read and write on client
