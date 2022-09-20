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

