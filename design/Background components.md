Background components
=====================

Needs
-----

- Components that carry on background work
- May be used by other components
- May be used by standard functions
- Self-contained implementation
- May be created by others without changing Elemento internals
- Multiple implementations of same or similar functionality
- May have properties set by the app
- May perform actions
- May expose data
- May need initialising
- May be async
- May create events by changing their data without a user action - UI must update
- May want to show their state in a debugger
- Current examples: Data Store, Email sender, Message Receiver
- Can also be used in server apps where appropriate


Forces
------

- Fit with the runtime React component model
- Fit with the runtime state management approach
- Fit with the Editor model
- Fit with the Generator approach
- Easy to understand code
- Classes are the standard approach
- Mutable state, not under control of the app state manager, is a problem
- This would be a problem in a hand-coded app too
- Initial simple implementations of collections assume in-memory data structures


Possibilities
-------------

- React component with null UI, or debug UI
- State-only component
- Methods in the state object
- Methods in an associated class that uses the state
- State object has single ref to class with functions
- State object has a prototype - need to ensure maintained by merges


Initial decision - 11 May 22
----------------

- State objects can be standalone, not associated with a UI component
- Generated code gets these in useState for a Page, but does not include them in the child components
- State object can have a set of functions associated with it
- State proxy uses a function if found in the get trap
- SP returns a function that calls the function, bound to the state obj, uses result to update the app state
- SP expects the result to be a set of updates
- This allows callers to call functions in a normal OO way
- The runtime implementation function/class can have a create function, otherwise do new
- Pass this to useStoreWithDefaults instead of existing default values
### Reasons
 - Keep existing state and proxy code as it works
 - Make the implementation class do more currently to keep changes to existing infrastructure minimal
 - Can relax the requirements on the implementation class later


Notes
-----

### Data store - what needs to happen

- Standard Open function can call store's implementation
- Collection can "connect" and ensure the data is OK
- Standard functions that act on a Collection can call the backing store's implementation to get/update data
- When async data is retrieved, update state management so UI updates

