User defined components Part 2
==============================

Aims
----

- Solve the specific problem of puzzle apps where the definitions are about 50% shared, 50% specific to the app
- Enable component re-use across apps
- Enable components to extend others (maybe)
- Enable components to have state and actions

Requirements
------------

- ✅ Component can have child elements
- ✅ Component can have state properties
- ✅ Component can have events with actions
- ✅ Which means properties can be functions, not just plain values
- ✅ Component can have state update functions
- ✅ Component can use state properties and state functions of child elements
- Components can be exported and imported

Further requirements
--------------------

- Component can have multiple slots for child elements


To do
-----

- (Maybe) Child elements add parent name to path
 
Events with actions
-------------------
- InputProperty element
- propertyDefsOf uses InputProperty elements
- should just work!
- but also needs dependencies on the generated action functions for the input props

State update functions
----------------------

- ✅ Component can contain FunctionDefs
- ✅ Generate functions on state object
- ✅ Don't generate functions in render function
- ✅ Do declare constant in render for state object function used in a page function or action
- ✅ Include state functions in dependencies
- ✅ State functions can call other state functions
- ✅ State functions can use all the globals, app functions etc that render function can
- ✅ Output properties do all the things state functions can
- Don't declare constants in render for things needed only by a state object function
