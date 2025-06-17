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
- ✅ Model objects
- ✅ Auth token available on client
- ✅ Auth token sent to server by TBDSImpl
- ✅ Auth token JWT decoded to get user id by Durable object
- ✅ Auth token sent to server by server app connector
- ✅ Server side current user and authorization
- ✅ Two server DO classes
- ✅ Authorization for client connection
- ✅ TBDSImpl can function in two different sync modes
- ✅ Full two-way sync on personal apps
- ✅ Readonly authorization
- ✅ Warn if do illegal update on client with readonly sync
- TBDSImpl clears data, notifies InvalidateAll and reconnects/disconnects when the auth changes
- Generate datastore classes with auth functions
- Generate bindings for the datastore classes
- Server only Durable object store
- Decide on how to make authentication flexible
- Use individual table fields instead of JSON lump
- Decide on how to use sqlite, json and pass data to authorize function
- Use databaseId, not name?

Further
-------

- ~~Start with sync from store, move to updates copied to clients~~

Multi-user game scenario
------------------------

- Match owner goes to game app site
- Match owner logs in - how? with main game site?
- Match owner creates a match
- New DO datastore for the match
- Match owner adds other users to the match
- Other users accept 
- Match owner starts the match

