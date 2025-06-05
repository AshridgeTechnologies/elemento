App instances
=============

2 Jun 2025

Aims
----

- Allow multiple instances of an app to exist for various reasons

Needs
-----

- Support instances of an app for game-plays
- Support instances of an app for tenants
- Continue to support single instance apps
- Have Durable Object and Tinybase sync available even in single instance apps

Forces
------

- Durable Object storage has limits - but is 10Gb enough?
- D1 may still be more suitable for some apps
- Where multiple users access one store, need a way to send them the name, and for them to attach

App Use cases for TinyBase datastore
------------------------------------
- See Data store authorization design note for more details
- Tenanted shared - as single shared, but multiple organisations, one isolated dataset for each
- Personal - each user has one isolated dataset, offline desirable, multi-device sync desirable
- Multi-instance - many isolated datasets, several users for each, each user involved in multiple datasets, real-time updates, datasets may be short-lived

Issues
------

- How do you create app instances?
- How do you control app instance creation?
- How do you control access to each app instance?
- Do you need to clean up unused or no longer needed app instances?
- How does this work with app-in-app, like on a games site?

Games site scenario
-------------------

- Games site has user database
- Login to games site
- Many self-contained game apps
- Game apps will each be an individual worker, as each will need its own server functions
- Game apps can be on subdomains of the games site
- Will be easiest to have each game app own its own DO instances
- Game app can have a service binding to main games site worker to record results, check users
- Game app may run in same window as games site or in an iframe
- ??? Game app gets a database name/id passed in, passes to a TinyBaseDatastore(Impl) component, which connects to DO
- DO connection for sync goes to a cloudflare worker in the server app, which will be on the games site
- This is passed direct to DO, not via TBDS
- Auth token is passed in when connect
- BUT the DO instance is found/created by getWsServerDurableObjectFetch, which does idFromName
- SO should maybe use idFromString with ids created by newUniqueId
- User creates a new game play on the ~~games site~~ game app
- UI scenario:
  - User goes to games app home page
  - New game button
  - App Server allocates new DO id, tells games site server, initialises state
  - Show game ready page with DO id in path as parameter
  - Can share this URL to invite other users
  - Any other _logged-in_ user who goes to this URL sees the game ready page, with other users, can choose whether to join
  - Any user who joins is stored in the game state
  - Users' moves stored in the game state and synced with others
  - When game over, app server records the result in the games site server, deletes the DO storage

Possibilities
-------------

- Personal apps: User id is db name (via idFromName)
- Datastore name/id is the first part of the url pathname - but then confused with page
- Can only create datastore instances within the framework of a controlling app, like a games site
- CreateDatastore function available - new DO id
- Users are stored in D1 in controlling app
- Store ids of DOs created
- Pass ids into apps in iframes via query params
- Limit DOs per user and also access the stored ids to clean up
- Use the control-data plane pattern: https://developers.cloudflare.com/reference-architecture/diagrams/storage/durable-object-control-data-plane-pattern/

Decisions
---------

- A multi-instance app will have a single control datastore, with a fixed name, accessed only via server
- The control datastore will have data such as a list of app instances, and maybe a list of users
- Have a CreateDatastore function on server side to assign a new unique id
- Pass DO ids around as strings, rather than names, so clients cannot create new DOs
- Pass the DO id to users to ask them to join a game or otherwise collaborate on a DO instance
- Every server request will need to include the datastore id so the handler function can create/call the TB Datastore with right id
- Replace getWsServerDurableObjectFetch with a function that gets the id from the string id
- Could use "anyone with the link" authorisation
- Could store authorised users for each app instance in the control datastore, then:
  - Check authorised user when connecting for sync
  - Check authorised user in server calls

