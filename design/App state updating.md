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
- Only need to replace one state object usually
- Must use paths for ids because in lists there may be many instances of the same id
- State objects know best for themselves when they are updated
- The proxy is a different aspect to the state updating


Possibilities
-------------

- State objects return a new version of themselves and their children, ready to insert into the app state
- State object base class and/or mixin
- State object can update itself and queue the update
- Code may be clearer (and faster?) without proxies
- Could arrange for state updates to be queued
- Maybe update the current state instance _and_ queue the update
- How much is a proxy really needed?  Could a state superclass do the same job?
- Could get own state in the component
- Consider where state needed and not needed
- Could use AppState to update things like Collection state and then replace whole thing in the main app state
- The path id could just be used in a map, fast to copy, fast to access
- Path as id allows to get sections of hierarchy if needed
- A state object could update itself AND queue a new copy to go into the app state

