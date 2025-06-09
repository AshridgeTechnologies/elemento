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

App Use cases
-------------

### Single shared 
- large db
- single dataset
- many users
- no need for real-time updates or offline
- little user-private data
- Dataset creation: app deployment

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
- Dataset creation: on user signup
- 

### Collaborative app, trusted users
- Examples: project planning with chat, whiteboard
- Multiple users for datastore
- Datastore per tenant
- Permanent
- Immediate sync
- Offline not necessary
- Users can see and update any data as desired
- App may have validation, but no reason to avoid the rules
- Dataset creation: ad-hoc, by any user


### Multi-user app, untrusted users
- Examples: calendar, department admin
- Multiple users for datastore
- Datastore per tenant
- Permanent
- Immediate sync - maybe
- Offline - maybe
- Users can see all data, but updates only if authorised and validated
- Dataset creation: on tenant signup
- 

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
- Dataset creation: on tenant signup
 
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
- Dataset creation: ad-hoc, when needed by user, with limits
- Dataset deletion: at some point after no longer being used, probably auto process


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


Issues
------

- How do you create app instances?
- How do you control app instance creation?
- Do you need to clean up unused or no longer needed app instances?

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
- Each TinyBaseDataStore can have its own rules

Forces
------

- TinyBase sync depends on hashes calculated at datastore level
- Can't block all messages from client as even one-way sync requires two-way messaging
- Tinybase has already solved the merging and messaging problems
- Snag: Subset loading not available on Durable Object persister
- Snag: Note that SQLite- Persisters can currently only persist MergeableStore data in DpcJson mode, so no subset loading.
- Durable Objects now recommend sqlite storage, but current TB implementation is KV
- Just as easy to use the DO storage API direct as it is to go via the store
- Having public, private and user-private would be useful, even if can't do fully flexible conditions
- Snag: Durable object is accessed via a stub, cannot serialize functions, so can't send a function to the DO from TinyBaseDataStore for full flexibility
- May multiple TinyBaseDataStores in an app - ideally just want to have one TBDO instance for all of them
- Only want to have one TBDO per app
- Really looking at app instance name rather than database name as the DO id
- Which leads to the next problem of how you manage app instances


Possibilities
-------------

- Own mechanism to push filtered updates to clients outside TinyBase, SSE or WS
- Separate Tinybase store for each client, with that client's view
- Subset loading with conditions for the client stores - BUT not available on Durable Object persister
- Use only auto loading, not saving, for the client stores
- Maybe: Use sqlite storage in Durable object persister OR use sqlite persister
- Could trigger updates in client stores from the server db updates, as all in same DO
- May be able to use json_xxx functions to pick things out of
- Pass query criteria for authorization - BUT could start syncing before server data store is instantiated
- Create a subclass of TBDO for each app, with authorizeUpdate override

Spike 1
-------

- Can get TinyBase to work with DO sqlite storage, but only in json mode - whole db in a blob in one col of one table

Spike 2
-------

- ✅ Each client connects with a token that gives their user id
- ✅ Hold map of client id to user id
- ✅ Each client has a separate in-memory store, synchronized to client via ws
- ✅ Each store has an authorization rule attached to it (table name, data) => boolean
- ✅ Each store has a data update function, takes chunk of data, checks rule, add/updates if ok, all in one transaction
- ✅ For new store, get all data, apply to data update function
- ✅ On updates to main db, offer the update to each store
- Start with sync from store, move to updates copied to clients
- Decide on how to make authentication flexible
- Decide on how to use sqlite, json and pass data to authorize function
- Gets user Id from proper JWT token

Client Handler
--------------

- ✅ Has a TinyBase store, in-memory
- ✅ Can be bulk-loaded with all the data from the main store
- ✅ Can be notified of updates
- ✅ Has a rule about whether a particular table/row is included in the store
- ✅ Selects whether to include each record in the initial load or updates
- ✅ Synchronizes all it's data with a client's store over a single websocket connection
- ✅ Ignores updates arriving from the client (should not happen)
- Parent DO class:
  - ✅ Creates a Client handler for each connection
  - ✅ Loads the whole database into it
  - ✅ Sends database updates to it
  - ✅ Routes incoming messages to it

Authorization mechanism - approach 1
------------------------------------

- ✅ Server TinyBaseDataStore can have a set of query criteria for each table
- Can use $currentUserId in the criteria
- Table with no entry means all rows available
- Can have a condition that is always false to make a table private to the server
- TinyBaseDataStore sets the criteria in its instance of the TinyBaseDurableObject
- TinyBaseDurableObject.authorizeUpdate uses the criteria
- Use queryMatcher function
- Upgrade queryMatcher to accept substitutions like $currentUserId
- BUT probably won't work as the DO may start syncing local datastores before the criteria in the DO are initialised


Authorization mechanism - approach 2
------------------------------------

- Server TinyBaseDataStore has an authorization function, give collectionName, rowId, changes, currentUserId
- In generated index.js, have subclass of TBDO with authorizeUpdate override
- Different function for each TinyBaseDataStore in the app
- Generated TBDO subclass looks up the auth function based on the TBDO component name
- Does _not_ use the databaseName as this can be variable and may be many instances


Part 3 - Full sync and offline operation with Personal app datastores
=====================================================================

Similarities to multi-user one-way sync
---------------------------------------

- Need immediate inbound synchronization
- Must be logged in to synchronize
- May want to check user authorized to sync
- Server has a merged copy of the data

Differences to multi-user one-way sync
--------------------------------------

- Outbound sync
- Offline local updates, sync when connected
- All devices and users have the same data
- Don't need a server-side datastore element (although may still want one to do some server side ops)

Forces
------

- One user for each datastore is normal
- Multiple devices for each user is normal
- Stopping client->server sync has to be enforced at server, client stops it just for convenience
- Client TBDSI will have few differences between full and partial sync, apart from blocking update ops
- Each datastore is a separate DO instance
- May have a full sync and a multi-user sync datastore in the same app, or even multiple of each
- Having a separate datastore for each user could be a big overhead in some apps
- Server side datastore bypasses all the auth anyway
- In app just want to specify a single datastore, with or without an auth rule
- New situation: Need to specify a datastore on server side and on client side
- Need to link the client and server datastores
- Need to give client and server datastores the same database id
- With the Firestore datastore, that was a bit confused between client and server side stuff
- Having separate client and server apps confuses things, as have to link them up
- Merged client and server apps would be better here - but not part of this effort

Possibilities
-------------

- One DO class, with settings to work in different ways
- Separate DO classes for full sync and multi-user-sync
- Every datastore is a different DO
- Datastore component must have same name in client and server
  - Still need to know which server app to look at
- Client datastore explicitly links to server app and datastore
- Or just link to serverApp (as ServerAppConnector) and datastore has to have same name
- Could default to the single server app if only one
- Server side datastore component generates both the access object in the server app and the specific DO class

Decisions
---------

- Have a noUpdates property on client TBDSI, throw excp if try to do update ops
- Link up client and server datastores by name, use first/only server app
- One TinyBase DataStore model component on server side
- One TinyBase DataStore runtime component in the server app
- If no auth rule specified, use the full sync TinyBaseDurableObject
- If it has an auth rule specified, use the multi-sync TinyBaseDO as base for a generated class
- Generate DO bindings needed
- Cloudflare worker routing needs to include Datastore component name as well as the database id
- Route to the getWsServerDurableObjectFetch using correct binding


