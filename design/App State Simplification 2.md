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
- The React class pattern had advantages
- States need to know about their child states
- Need immutable objects to work well with React, and other reasons
- Objects need access to the state management mechanism to update themselves

Possibilities
--------------

- Every component inc App and Page has a render function and a state class
- Render function gets or _creates_ its state object
- React component props all passed to state object
- State object is immutable as now and render triggered when it changes
- State object knows its child states and updates itself when they change
- Render function delegates everything to the state object (except possibly simple prop expressions)
