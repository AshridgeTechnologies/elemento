Data store authorization
========================

21 May 2025

Aims
----

- Define how access to remote datastores will be controlled with Cloudflare

Needs
-----

- Allow only authorised reads
- Allow only authorised writes
- Cater for D1 database and TinyBase Durable Object stores
- Support access for groups to a DO instance
- Work with any authentication provider
- Flexible authorization criteria
- Secure against forged calls from client

Forces
------

- Will need to send auth token to server with server function request
- Will need to send auth token to server with websocket request
- All updates must be via server functions
- BUT TinyBase sync is designed for two-way updating
- Will need authorized users in the DB somewhere - but may vary a lot

Possibilities
-------------

- Separate Authorization expression on server calls
- Check(condition, message) function that throws if the condition is false - use in server calls
- For DO groups, DO data holds the user ids of the members, calls validate current user vs that
- Override webSocketMessage in TinyBaseDurableObject to drop any incoming messages
- Make client TinyBaseDataStoreImpl update methods just throw an exception
- Pass onSend to synchronizer that throws exception in TinyBaseDataStoreImpl



