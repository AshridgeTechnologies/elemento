General object adapter
=====================

Aims
----

- Make it easy to use any promise or observable in an Elemento app
- Support getting values from Editor and Preview controllers

Requirements
------------

- Adapter component
- Target object property - no update if constructed with identical object
- Target object must be an expression
- Can call any method on the target
- Return result directly if its a plain value
- If method returns a Promise, update app state when it resolves
- Has property to show call in progress whenever a promise is not resolved
- Return and cache error if promise rejects
- Return error without caching if not a promise
- If method returns an observable, update app state whenever there is a new value
- Cache calls for same arguments (by equals)
- Refresh method for all, function, function and arguments


Further requirements
--------------------

- Use adapter with a single function, make callable
- Close subscription to observable
- Auto close subscription if nothing uses the value

Technical
---------

- Base on server app connector

