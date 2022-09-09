Server side apps
================

Aims
----

- To enable systems where some processing is done on the server side
    - for security and data integrity
    - for things which cannot be done in the browser

Needs
-----

- Server apps use similar concepts to client apps
- Can be deployed to hosting platforms
- Simple and intuitive to call from browser
- Parameters can be passed
- Can provide external APIs
- Can call third party APIs
- Calls from the browser similar to calling external APIs
- Async calls handled automatically in the server code, even if written as plain calls
- Async result handled automatically on client
- Get calls are cached automatically
- Update calls are like actions
- Errors are handled automatically
- Functions can be defined in JavaScript if required
- Allow for possibility of using npm packages

Forces
------

- Similarity between API calls and database calls
- Server apps only have functions
- Dev should not have to worry about async in the formula code
- Generated code should be in a normal style
- Need to do GET or POST calls depending on whether calc or action
- Having id in path may be useful and fit with REST, but could be many other params
- Get expects params in query string
- Post expects params in body
- Params may be complex
- Pragmatic REST ideas
- Rest centred around resources rather than function names
- Need to know the URLs for the environment deployed to, including in Preview

Possibilities
-------------

- Each function defined as a handler in an Express app
- Do we even need Express? Just a lookup from path to function
- Deploy app as a cloud function
- Default for get is the function name as path, params as query args
- Default for action is function name as path, params as JSON in body
- Optionally define HTTP verb and path for a function
- Call with fetch
- Include user auth token in header
- Extract auth token in Express middleware, use to pick up current user for request
- Function cache for each app, keyed by function name and args
- Explicit app connector in client app
- Or default app connector created if the app name is used in the client
- App connector (or similar idea) also used for third party APIs
- App connector could hold the cache and adjust call details if needed, make fetch call
- Return Pending from each call until it resolves, as with Collection and db
- On server side, prefix all calls with await
- Detect which functions are async by inspecting them BUT can return promise from non async function
- Mark functions as sync to avoid using await

Decisions 9 Sep 22
------------------

- Generate a traditional Express app with routing (keeps generated code similar to manual development)
- Generate an HTTP cloud function (so can also be used for an external API)
- Standard client App connector adds auth token to cloud function requests
- Client app must include app connector explicitly
- App connector configures itself from the server app definition
- Add await to all function calls - can optimize later

Part 2 - Access to datastores
=============================

Needs
-----

- Can access server side datastores
- Access in the same way as on client

Forces
------

- Caching needed within the request
- Want to use same elements as in client app - DataStore, Collection
- Want to use same functions in formulas
- Only some types of datastore available
- Need to handle async with await rather than state updates
- Want to have datastores and collections at app level
- Client side datastores are intended to be long-lasting and stateful
- Server side datastores are stateless and per-request
- Datastore and collection initialisation should be lazy
- BUT should last for the instance lifetime
- Some parts of client datastore are not relevant on server, like auth and observable
- Firebase libraries for server side are different and they have a different interface
- In Collection, nearly all the client-side code is irrelevant for the server
- Errors will be handled differently on server - catch all errors centrally - so client wrapper not needed
- Need to have firebase-admin available

Possibilities
-------------

- Different server side implementations for same model objects
- Pending placeholder could also be a Promise
- Could bundle firebase-admin and upload it OR include in package.json and retrieve in server build

Decision 4 Oct 22
-----------------

- Separate the data functions from other client side functions in appFunctions, reuse on server
- Server uses serverAppFunctions
- New implementations for Collection and FirestoreDataStoreImpl on server
- Generate code to instantiate as top-level variables in the Server App file
- Implementations should use lazy initialisation


