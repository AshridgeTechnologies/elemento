App level shared components
===========================

Aims
----

- Users can define components under the app that can be used anywhere in the app

Needs
-----

- Define the properties and initial data in one place
- Clear references to the component where it is used in the Elemento definition
- Clear references to the component in the generated code
- Create and destroy shared components at the appropriate times
- Efficient use of the app state
- Efficient rendering

Forces
------

- Top-level shared components will always be background, without UI
- Some will be singletons that keep the same instance eg DataStores, API connectors
- Some will be stateful that need to trigger updates when they change
- The shared objects will refer to each other eg a stateful Collection cache will refer to a singleton DataStore
- May want to use select controls in Editor to choose a shared component
- May want to store ids instead of names in the future
- Possibility of name-clashes with lower-level components, but these will be rare
- Limit what is possible as can open up later but difficult to tighten up
- Need to know which components are which type in the model
- Recreating components inside others could be difficult and could have unforeseen snags
- Immediate needs are for singleton Data Store and shared stateful Collection - other ideas are YAGNI

Possibilities
-------------

- Idiom of using state to create and hold a fixed object, in the app (would also work in pages)
- Could create an object with all the app singletons in one go
- Context to share the app singletons object
- Share stateful objects in a context, avoid creating a new instance unless they change
- Share stateful objects in the app state, avoid creating a new instance unless they change
- All state objects can be created with a class prototype, not just shared ones
- Recreate stateful objects wherever they are used, store the app singletons in the state
- Don't share app singletons - only the stateful objects can be shared
- Make top level of path app, rather than app name - (if it is useful)
- Shared stateful components have to take props object as only constructor argument, and give access to it for comparison
- useAppShared hook
- app._shared area in state

Initial design 17 May 22
------------------------

- Model objects have component type of stateless UI, stateful UI, stateful background or singleton
- Singletons are created with a read-only useState call
- Singletons are not shared around the app
- Stateful background components are created with useObjectState, pass all properties from the model, initial value => value
- Stateful UI components are created with useObjectState, initial value => value AND also rendered as React with all other props
- Stateless UI components are rendered as React with all props
- State objects are set in the app state when they first initialised, so they are available to lower-level components
- Enter the name of the shared component as an expression when referring to it
- Allow app level components to be shared, but no others
- Find app level identifiers in page component generation
- Generate useObjectState calls with 'app.Name', no initial values
- Separate useObjectState call for each app component
- So actually creating a new class instance on the same state
- Assign object state to local consts
- Ensure _type is stored in app state
- References to app singletons are held in the state - like _type, they will not change
- Do app components before own state as may use the former in the latter


Further findings
----------------

- Updating app-level components from a child's render function causes warnings, although everything seems to work
