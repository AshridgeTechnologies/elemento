Auto state
==========

30 Sep 2025

Aims
----

- Make component building and code-generation easier by making each component manage its own state

Needs
-----

- Self-contained state-management module
- Easy way to use in any component
- Revised code-generator
- Migration path for existing components
- Works in App, Page, ListItem and Form
- Works in user-defined components

Main points
-----------

- Hierarchical ids so can find children and parents
- Need to find children so can use them in the parent component
- But child state objects may not exist as they are created on first render of the child component
- Need to find parents so know which components are affected by a change
- State object associated with each stateful component
- State object can have external properties (constructor arguments) and internal state
- Store available everywhere via a context
- State object stored/retrieved with the component id
- Each component subscribes to changes in the store, re-renders if needed
- Hook to get state and subscribe/unsubscribe
- Component creates a state object and stores it in the store on first render
- Component updates the state object's external properties on each render, keeping the internal state
- Internal state is updated by events, keeping the external properties
- State objects are immutable, so updates are done by copying to a new object
- Updates to internal state must always be done on the latest version of the state object

Basic usage
-----------

- Component gets reference to the whole store via a context
- Component can get and put any object in the store
- Component decides when to update the object
- Actions must have the store in their closure and get the latest version of the component to construct a new one when updating
- Component can get child objects by constructing their id
- Component can subscribe to all changes in the store and decide if they are relevant
- Or component can subscribe to changes to its state and any child state

Standard state object usage
---------------------------

- State objects extend a standard base class
- Can compare a new set of external properties and decide whether they match existing ones
- Can decide whether changes to external state will change the state
- Can create a new version with either the new external properties or the new internal state

Advanced state object usage
---------------------------

- Store will inject a restricted interface to itself into the state object, via an init function
- The app store interface can be used to set a new version of the state object, get the latest version, and get a child state object
- The init function may also do certain one-off setup, or setup that needs to change when properties change
- The init function can return the state object itself, or a different object, eg a proxy that adds extra functionality
- The proxy could be used for state objects that can have child states, to return them automatically when requested
-

Technical
---------

- Have SubscribableStore as a dumb get/set/notify layer
- AppStateStore assumes it is dealing with App State objects with a certain interface
- App State objects can:
  - be constructed with props
  - can have state separate to props
  - can compare/merge their state
  - can compare/merge their props
  - can accept an init call with an app store for object interface
  - init returns the object to store
  - init may return itself and ignore the app store interface
  - or init may return a proxy
- AppStateStore deals with all this so it can be used outside the react hooks world
- 
