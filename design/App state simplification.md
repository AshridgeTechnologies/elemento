App state simplification
========================

10 May 2024

Aims
----

- Simplify app state management
- Make use of app state more reliable

Forces
------

- Using Zustand in a particular way, to just hold a map of objects, rather than a hierarchy
- Holding old versions of state objects in closures has led to several bugs
- Can't do anything in state object constructors anyway as they need to be very lightweight
- Having to find the latest version in various cases is a smell
- Will still need the input properties comparison

Questions
---------

- Will you still need deferred updates? - prob yes


Possibilities
-------------

- State objects are just wrappers around the state properties held in the central store
- Look up the state properties by id (path) every time you want to use them
  - BUT many things, eg React element props comparisons, rely on comparing object instances
- Deferred updates could be just changes, rather than whole states
- All construction done via app store new function, taking class, path, props
- App store injects itself into object before returning
- App store does the getObject functionality, returning existing if the props match

Simplified app state without Zustand
------------------------------------

- Just have a Map of object states
- Don't recreate whole map, just update one object
- Subscribe to updates by id, trigger update by a useState hook
- Have one state access object (as _state now) to manage all the subscriptions
- Clean up subscriptions with a useEffect cleanup in the one 
