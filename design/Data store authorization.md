Data store authorization
========================

21 May 2025

Aims
----

- Define how access to remote datastores will be controlled with Cloudflare
- Find a way to sync different parts of a data store to each client - see Part 2

Needs
-----

- Allow only authorised reads
- Allow only authorised writes
- Cater for D1 database and TinyBase Durable Object stores
- Support access for groups to a DO instance
- Work with any authentication provider
- Flexible authorization criteria
- Secure against forged calls from client
- Allow offline working (!)
- Support all the use cases below
- Ideally have just one datastore with different rules per collection

Use cases
---------

### Personal app
- Examples: task list
- Single user for datastore
- Datastore per user
- Permanent
- Offline working
- Sync data on different devices
- No need for real-time sync
- User can see and update any data as desired
- App may have validation, but no reason to avoid the rules

### Collaborative app, trusted users
- Examples: project planning with chat, whiteboard
- Multiple users for datastore
- Datastore per tenant
- Permanent
- Immediate sync
- Offline not necessary
- Users can see and update any data as desired
- App may have validation, but no reason to avoid the rules

### Multi-user app, untrusted users
- Examples: calendar, department admin
- Multiple users for datastore
- Datastore per tenant
- Permanent
- Immediate sync - maybe
- Offline - maybe
- Users can see all data, but updates only if authorised and validated

### Multi-user app with private data
- Examples: calendar, department admin with private sections
- Multiple users for datastore
- Datastore per tenant
- Permanent
- Immediate sync - maybe
- Offline - maybe
- Users can see data only if authorised
- Per-user private data is synchronised only to their device
- Private data is not synchronised to other users' devices
- Users can update data only if authorised and validated
 
### Real-time app with private data
- Examples: multi-player game with hidden info for each player and for the game (like the players' hands and the remaining deck)
- Multiple users
- Many datastores per user/tenant, for different game-plays or other events
- Temporary
- Immediate sync required
- Offline - probably not
- Users can see data only if authorised
- Per-user private data is synchronised only to their device
- Private data is not synchronised to other users' devices
- Server-only data is not sent to any device
- Users can update data only if authorised and validated
- Some actions can only be processed by the game server eg guessing a hidden answer

Forces
------

- Will need to send auth token to server with server function request
- Will need to send auth token to server with websocket request
- All updates must be via server functions in some apps
- BUT TinyBase sync is designed for two-way updating
- TinyBase ws synchronizer is designed to pass opaque messages to all subscribers
- AND some apps need two-way syncing for single users accessing from different devices
- Will need authorized users in the DB somewhere - but may vary a lot
- May use a synchronized datastore just to push updates to users
- Parts of the datastore may be synchronized, others not
- Different items in the same collection may be sent to different users
- Direct sync from client updates can be either on or off
- Probably ok for offline working to be only available with direct client updates across whole store
- Initial sync would need careful filtering according to rules
- BUT !!! - the TinyBase CRDT protocol is designed to sync the entire database by using hashes - it just won't work if not all data is sent

Possibilities
-------------

- Separate Authorization expression on server calls
- Check(condition, message) function that throws if the condition is false - use in server calls
- For DO groups, DO data holds the user ids of the members, calls validate current user vs that
- Override webSocketMessage in TinyBaseDurableObject to drop any incoming messages
- Make client TinyBaseDataStoreImpl update methods just throw an exception
- Pass onSend to synchronizer that throws exception in TinyBaseDataStoreImpl
- Build validation into WS synchronizer
- Have a setting per datastore for client updates on or off
- Use queries for one-way updates - ?
- Use subset loading to restrict data - ?
- Download all data client is entitled to see, do queries client-side

Possible approach
-----------------

- Whole store can be set as accepting direct client updates or not
- If it does, the whole store is sync'ed to client, other rules cannot be applied
- If no direct client updates:
  - Store, or maybe each table, can have a sync rule
  - Sync rule is a function given table name, row id and user id, maybe cell id
  - If sync rule returns true, the update is sent to that client
- Would require authenticating users when connect via websocket, and holding table of clientId vs user id

Part 2 - Partial Syncing datastores based on authorization
==========================================================

Needs
-----

- Satisfy the Real-time app with private data use case above
- Single datastore including all data available to server code
- Partial view of the datastore synced to each client
- Immediate updates to clients after a change on the server
- Prevent direct updates from clients

Forces
------

- TinyBase sync depends on hashes calculated at datastore level
- Can't block all messages from client as even one-way sync requires two-way messaging
- Tinybase has already solved the merging and messaging problems
- Snag: Subset loading not available on Durable Object persister
- Snag: Note that SQLite- Persisters can currently only persist MergeableStore data in DpcJson mode, so no subset loading.
- Durable Objects now recommend sqlite storage, but current TB implementation is KV
- Just as easy to use the DO storage API direct as it is to go via the store


Possibilities
-------------

- Own mechanism to push filtered updates to clients outside TinyBase, SSE or WS
- Separate Tinybase store for each client, with that client's view
- Subset loading with conditions for the client stores - BUT not available on Durable Object persister
- Use only auto loading, not saving, for the client stores
- Maybe: Use sqlite storage in Durable object persister OR use sqlite persister
- Could trigger updates in client stores from the server db updates, as all in same DO
