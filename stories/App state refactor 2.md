App state refactor 2
====================

Aims
----

- Make state classes easier to do for new components
- Make state management more efficient
- Avoid future snags and hooks errors

Steps
-----

- ✅ Upgrade Zustand
- ✅ Rework context to new recommendations
- ✅ Store state by id, not in a hierarchy
- ✅ Store the state objects, not just the properties
- ✅ State object updates itself and returns new instance
- ✅ State object calls the app state update itself - especially for async results
- Fix the problem of applying async updates to the latest version
- Move proxy functionality into the class