Shared real-time data
=====================

30 Sep 2024

Aims
----

- Support real-time multi-user games
- Fit with local-first ideas where reasonable
- Improve app and deployment architecture where possible

Needs
-----

- Multiple users (< 10? < 100?) can share the same data
- Small amount of data shared at a given time
- Many small groups sharing distinct sets of data
- Data is persisted
- Frequent updates (~ 1/s))
- Update data could be either direct from client or via server function
- Immediate updates to every user

Forces
------

- Broadcast data update solutions exist but can be expensive for many users/updates eg Firestore
- Websockets require a dedicated process
- P2P seems unreliable
- Many CRDT solutions seem fairly experimental
- Tinybase looks well designed and implemented
- Tinybase doesn't support complex data directly
- Deploying a container looks better than FB extensions
- Firestore is convenient for persistence
- May need multiple server instances, which would need to be stateless
- Solution for a small number of users could be quite different to that for large number
- Not all server apps need shared real-time data

Questions
---------

- How do serverless Cloud Run containers behave when websocket connections exist?

Possibilities
-------------

- Tinybase websocket server in container on Cloud Run
- Store complex objects as JSON
- Firestore just for persistence
- Persist only once every few seconds
- Restrict containers to single instance, use local files
- Multiple servers but each group of users assigned to one
- Container deployed to run just one app
- Container can run many apps
- Container is just for TB, separate from app runner container

Prototyping steps
-----------------

- Tinybase data store
- Local TB websocket server
- Local TB websocket server in container
- Cloud Run TB WS server in container
- Updates persisted
- Updates persisted across instances of container
