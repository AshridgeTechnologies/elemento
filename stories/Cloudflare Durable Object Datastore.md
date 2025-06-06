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
- Model objects and generation
- ✅ Auth token available on client
- ✅ Auth token sent to server by TBDSImpl
- ✅ Auth token JWT decoded to get user id by Durable object
- Auth token sent to server by server app connector
- Server side current user and authorization
- Generate auth function for multiple datastores
- (Authorization for read and write on client)
- TBDSImpl clears data, notifies InvalidateAll and reconnects/disconnects when the auth changes
- TBDSImpl can function in two different sync modes - or two different classes?
- Full two-way sync on personal apps
- Server only Durable object store
- Decide on how to make authentication flexible
- Use individual table fields instead of JSON lump
- Decide on how to use sqlite, json and pass data to authorize function

Further
-------

- Start with sync from store, move to updates copied to clients

