App State Simplification 2
==========================

30 Jan 2025

Aims
----

- Simplify current app state management core code
- Simplify current generated code
- Simplify user-defined components
- Make Pages and other components consistent

Needs
-----

- Allow for components that can have children supplied when they are used

Forces
------

- State is currently managed in the parent component
- State is retrieved again in the child component to which it belongs
- State management and rendering are separated
- Some functionality is in the render function, some in the state
- Render function creates child states - reasonable?
- The React class pattern had advantages
- States need to know about their child states
- Need immutable objects to work well with React, and other reasons
- Objects need access to the state management mechanism to update themselves
- The Zustand state management system is hard to understand
- The Zustand state store is hard to use outside React for unit testing

Possibilities
--------------

- Every component inc App and Page has a render function and a state class
- Render function gets or _creates_ its state object
- React component props all passed to state object
- State object is immutable as now and render triggered when it changes
- State object knows its child states and updates itself when they change
- Render function delegates everything to the state object (~~except possibly~~ _including_ simple prop expressions)
- Every action and property expression is a property of the state object
- Debug and error reporting might be simplified by putting all expressions into state object
- Testing might be simplified, as could set up state object and test any calculated props directly

New approach
------------

- Keep immutable objects
- Simple store for objects keyed by id
- Subscribe to object changes by id
- All objects have reference to store so can update themselves
- Store available throughout app via context
- React hook to subscribe to object (useEffect, useState)
- Page has a generated state object - prob App too, Form does already
- Render function calls useObject on its own state object, passes id, type, props
- Component state object takes all properties, keeps the ones it is interested in
- If props have changed, create new state obj from old one and new props, notify subscribers

Issue - creating child state objects
------------------------------------

- Ideally each component creates its own state object - in the first render
- But need them in advance to calculate properties of child elements in render
- Some elements do not have state objects
- If a state object creates its child state objects:
  - State object gets all props passed to render function
  - State object can create child state objects in same way as render function could
  - So child state objects are created at same point and available for child element props
  - If child element prop calculations are all in state object - that's fine

Issue - when to update state object if a child state changes
------------------------------------------------------------

- If a state object uses a child state in a render calculation, it needs to update so that the element re-renders
- If a state object only uses a child state later in an action, it does not need to update
- Or does it - the observable behaviour changes, the action will be in a closure, so it does need to update
- So maybe need to compare all the output properties of the state object
- But will depend on when the state object gets its child states:
  - On creation
  - Or when they are used
- For an object to be immutable, it must give the same result to the same calls forever
- If the result of (say) an action call is different after a child state changes, it is not immutable
- So maybe need to update the parent each time a child state changes

Issue - change storms from multiple changes or multiple levels
--------------------------------------------------------------

- Externally and internally triggered changes
- Multiple changes in one action
- Possible: store set of changed ids, lazy recalculation
- But need to notify things outside the store
- Probably stick with the commit in next tick mechanism in existing appData

Issue - when should state object updates be visible
---------------------------------------------------

- Can choose whether to defer updates during rendering, or update store immediately and just defer notification


Design approach - how to do updates for child state changes
-----------------------------------------------------------

- Use the updateChildStates function from user defined components spike
- BaseComponentState has onChildStateChange() function, for now just calls updateChildStates
- Can subscribe to any change on store, get an array of changed ids
- App State Store wrapper does this, then -
- Extract parents from all changed ids, remove duplicates
- Get each parent from the store and call onChildStateChange on it
