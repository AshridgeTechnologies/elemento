App state refactor 2
====================

Aims
----

- Make state classes easier to do for new components
- Make state management more efficient
- Avoid future snags and hooks errors

Requirements
------------

- ✅ No set or update if nothing has changed
- ✅ State objects can be constructed from props object
- ✅ State objects must be capable of having the app state link injected
- ✅ State object must always be in the store after it is first requested with an initialiser
- ✅ If props of an object in app state are the same as incoming props on a shallow comparison, no need to update
- ✅ If props are not the same, update the state object in the store and also use it in calculations
- ✅ If no object in store, add the initialiser object to the store and use it in calculations
- ✅ State objects use only a subset of the component props - others just affect the display
- ✅ State objects can replace themselves in the store with a new version
- ✅ State objects can get the latest version of themselves
- ✅ Should always call the update function on the latest version, as it may use current state to calculate the next
- ✅ No updates applied to app state store during rendering of a component
- Desirable: throw or warn if update (or even access?) an old version  BUT allow for going back to old states for debugging or undo


Steps
-----

- ✅ Upgrade Zustand
- ✅ Rework context to new recommendations
- ✅ Store state by id, not in a hierarchy
- ✅ Store the state objects, not just the properties
- ✅ State object updates itself and returns new instance
- ✅ State object calls the app state update itself - especially for async results
- ✅ Fix the problem of applying async updates to the latest version
- Move proxy functionality into the class