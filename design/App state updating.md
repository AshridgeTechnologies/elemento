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
- Updates: much easier if object itself does them
- Could arrange for state updates to be queued
- Maybe update the current state instance _and_ queue the update
- How much is a proxy really needed?  Could a state superclass do the same job?
- Code may be clearer (and faster?) without proxies
- Also factor in getting own state in the component
- Also consider state where no associated UI
- Also consider where state needed and not needed
- Some components may depend on app level state being set before they are rendered

Possibilities
-------------

- State objects return a new version of themselves and their children, ready to insert into the app state
- State object base class and/or mixin
- State object can update itself and queue the update