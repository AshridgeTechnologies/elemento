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


Part 3 - Calling from client app
================================

Needs
-----

- Can call server functions as easily as client functions
- Use the most intuitive form for the calls
- Call in same way as external apps
- Caching, async and errors handled automatically
- Automatic setup for own server apps
- Setup from Open API for external apps, with manual option
- User id and authorization must be available on the server side

Forces
------

- Dot notation is more suited to situations where you have an object with many specialised methods
- Dot notation is somewhat familiar from Excel, easy to learn
- Dot notation also need in general objects
- Dot notation works with proxies
- Easier to generate code around a single object 
- Introducing many new global functions will lead to clashes
- Need a model object to focus usage of the API
- Also need a runtime object for caching, async, state updates, etc
- Need to know the functions available in the model for checking, autocomplete, docs, etc
- Consistent approach to generating code - don't use generated class in one place, proxy in another
- Making generated code similar to handwritten code
- Proxies are harder to understand and debug
- BUT shared code is good and easier to test than generated code
- App connectors all have different functions; collections all have the same functions
- App connectors handle every function the same way (or all query and all action functions, anyway)
- Need to fit in with the state management approach
- Would be good to migrate collections and databases towards the same approach
- Collections could use a default memory data store


Possibilities
-------------

- Proxies
- Functions generated at runtime
- Classes generated at build time
- Wrapper classes
- Proxy for async and caching stuff, generated classes for actual calls and implementation


Decisions 7 Oct 22
------------------

- App connector in the client app for the server app
- Use dot notation to access app connector functions
- Model object linked to a server app object
- Model object exposes its functions by looking at the server app
- Runtime object takes a config in its properties
- Runtime object adds functions to itself on construction from the config
- Each added function is a simple call to a base function with name and params
- Runtime object does all caching and async handling in base functions
- Runtime object use firebase auth and sends id token in header if present
- Server side express app picks up id token and verifies and gets auth user
- Server side base app is instantiated for each request with the user


Part 4 - Running server side apps for development
=================================================

Needs
-----

- Server side apps run and update instantly
- Debugging (when added) is as easy as for the client app
- Server app behaves as closely as possible to when deployed
- Need to still be able to connect to deployed server app from preview
- Developer needs to control and know when using deployed or dev server app
- All still runs from the browser, no extra installs needed

Forces
------

- Firebase-admin may be impossible to run in the browser
- Browser APIs are different to firebase-admin
- Debugging would be for a single request with particular inputs
- Should at least serialize the inputs in the same way as an HTTP request
- A short-term solution may be useful
- Running the server code in the browser may be needed in production in some cases

Possibilities
-------------

- Another iframe alongside client preview
- Communicate by postMessage or broadcast channel
- Local web server that accepts put requests with files and runs the app locally
- Find a trick to swap out one set of firebase APIs and substitute another for browser running
- Write files locally and run a hot reloading server
- Poke app into browser frame as in client
- Web containers

Spike - Web containers
----------------------

- Quick attempt to get a server app running in Webcontainer had some promise, but hit some little snags
- Also not sure how functional-style debugging would work with it
- If want to run the actual express app, probably better to use a local node server

