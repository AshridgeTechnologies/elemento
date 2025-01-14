App state simplification
========================

Aims
----

- Simplify current app state management core code
- Simplify current generated code
- Simplify user-defined components
- Make Pages and other components consistent

Requirements - Part 1
------------

- ✅ Simple store for objects keyed by id
- ✅ Subscribe to object changes by id
- ✅ All objects have reference to store so can update themselves
- ✅ Store available throughout app via context
- ✅ React hook to subscribe to object (useEffect, useState)
- ✅ Defer updates or notifications when necessary
- ✅ Page has a generated state object
- ✅ Child states set up in parent state object
- ✅ Action functions are in the state object
- ✅ Child state updates
- ✅ Functions are functions of the state object
- ✅ Pull imports up to top of file where possible
- ✅ App has a generated state object
- ✅ Form still works
- ✅ ItemSet still works
- ✅ Elements in App bar still work
- ✅ Error warnings still work - eg with wrapFn (dummy asi still needed?)
- ✅ Debugging still works
- ✅ Actions and functions in Item Sets still work
- Prevent updates still works
- ✅ New unit tests
- ✅ Ensure everything in appData.test is tested in new tests
- User defined components still work when merged in
- Define state object interface contract
- Try to simplify BaseComponentState
- Make generated and built-in components consistent in where state set up
- Compare equals using properties - check extra constructor actions and overrides for equals
- Pass constructor and properties
- Check for memory leaks
- Calculations and Data - should they be simple properties of the state object? Prob not, as have Reset and When true etc
- Explore simpler debugging using the state
- Versions of store so can go back/forward


To do
-----

- Component state needed if have non-stateful child component that uses the state class eg Button or is generated in it eg FunctionDef
- createChildStates needs to be able to use input properties
