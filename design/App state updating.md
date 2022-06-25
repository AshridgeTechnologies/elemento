App state updating
==================

Aims
----

- App state storage simple in implementation
- App state storage is simple to use in generated or manual code

Needs
-----

- Avoid react hooks errors
- State objects are simple and conventional to code
- State objects appear to update whenever they are needed, even if actually separate instances
- Many/most state objects will be class instances


Forces
------
- Three sources of props: app settings (initial or updated), updates from events (user or datastore, etc), own settings
- ! Properties of objects may change if other things in the app change, so must recalc each time
- Updates: much easier if object itself does them
- Some state objects don't need an associated UI
- Some components may depend on app level state being set before they are rendered
- State objects are needed in formula expressions
- State objects help make formulas simpler by acting as values
- A lot of the state is only needed internally to the component
- But things like Collection don't really need a component and have loads of state
- State objects also encapsulate functionality
- State objects may need to do much more when things like validation and change detection are implemented 
- State updates for private things like subscriptions seems weird
- Only public state _needs_ to be in the app state store
- Only need to change the store if the public state updates
- _controlValue may not be needed
- State objects are independent - don't have to be in a tree
- BUT may want to find all components under another eg for form processing
- And may need to find them in an async call when the store is not available from the context
- Only need to replace one state object usually
- Must use paths for ids because in lists there may be many instances of the same id
- State objects know best for themselves when they are updated
- The proxy is a different aspect to the state updating
- Delegating direct to a value sub-property could be difficult without a proxy



Possibilities
-------------

- State objects return a new version of themselves and their children, ready to insert into the app state
- State object base class and/or mixin
- State object can update the current state instance _and_ queue the update
- State objects have a ref to the state (or an interface to part of it) so they can get associated components and update themselves
- Code may be clearer (and faster?) without proxies
- Could have proxy for Data - only case where need/(want?) to elide the 'value' and go straight to a sub-property
- Could arrange for state updates to be queued
- How much is a proxy really needed?  Could a state superclass do the same job?
- Could get own state in the component
- Consider where state needed and not needed
- Could use AppState to update things like Collection state and then replace whole thing in the main app state
- The path id could just be used in a map, fast to copy, fast to access
- Path as id allows to get sections of hierarchy if needed


Decision 13 Jun 22
------------------

- Store app state by id, not in a hierarchy
- Store actual state objects, not just their props
- Provide a mechanism for a state object to update itself
- Move functionality into the class itself, try to remove proxies

Async updates
=============

Forces
--------------

- ! Many updates are async and need to act on the latest state, not the state at the time the handler was created
- Want to write code in handlers as if it was acting on the current instance

Possibilities
-------------

- Inject a function that allows to get the latest from the store
- Pass a function to the updateFn
- Convention to call the function with this set to the latest
- Mark an instance as outdated and warn if anything called on it
- updateState automatically gets the latest and applies the changes to it

Extra decision 15 Jun 22
------------------------

- Provide an appState interface
- Have update and getLatest functions
- updateState would always call getLatest to apply changes to

Deferred updates
================

Forces
------

- The new execution relies on higher level components setting up state that is retrieved by their children 
- The state is retrieved _within the same render_
- If the updates to set up this state are passed to setState via Zustand, React logs a warning (although it still works)
- Even if it works, there may be efficiency issues, and it is untidy and looks bad
- The updates do not need to be notified to others during the render
- Complications and difficult bugs could arise with this sort of unusual behaviour
- We want to have undo in the future - need to avoid saving many intermediate states

Possibilities
-------------

- Find a new execution model
- Ensure the updates are visible to children if requested
- Delay updating the app state until after the render
- Treat updates from different sources differently
- Could have a pending AppState which is updated several times before being committed

Extra decision 23 Jun 22
------------------------

- Spike a delayed update mechanism
- Done Within appData.ts

