Using app elements in expressions
==================================

Needs
-----

- Refer to app elements by their names in expressions
- Plain names for elements at this level on the same page
- Dot notation names for elements under the app or nested within elements on the page
- Use state properties of the elements in expressions
- Pass the elements as arguments
- Functions receiving the elements can update them
- Nice to have: use input properties of elements in expressions  (?? - could lead to circular refs)
- The value property of an element state should be the default in expressions
- Be able to use initial values of other elements in expressions

Forces
------

- Need a way of using a state object to update the state in an action
- Keep flexibility to allow for future needs
- Don't add requirements on controls that make it difficult to add new or use third party controls
- Keep code generation simple
- Keep the generated code similar to hand-written
- Avoid duplication in generated code
- State is currently accessed in both the parent container and the element - messy, inefficient
- Parents and generator currently needs to know the default state of a control
- Parents and generator should not need to know the details of a component's state
- BUT parents need component state values to use in formulas
- Elements use the path as an id in the React element
- Some state values are updates to properties, some public in app state, some private
- Want to have formulas automatically use value of a control where appropriate

Possibilities
-------------

- Make the element state an object with prototype that knows how to update itself
- Make the element state an object with prototype that can return an updated version of itself
- Make each element state object know its path
- Accept path or object with a path in functions
- Accept path or object with a path in updateState
- Access state in container and pass state with path into the element
- Component class static generates property defaults

Spike 1
-------

- Elements have state object passed in
- Passed state includes the path
- Path is added by useObjectStateWithDefaults
- State object has an update function added to it
- State replaces initialValue in the _runtime_ element
- State object can be passed to action functions
- State object can have a valueOf method
- Functions can wrapped to get valueOf from all their args
- Mechanism for generating defaults code from model object - mark as stateful?

Decision 1 Mar 22
-----------------

- Revert the valueOf mechanism for controls, because
  - it does not work everywhere
  - it is "magic" that is not obvious in the generated code
  - it gets confusing when used with Data controls
- Instead, in the code generator, transform expressions using Input control identifiers to add .value where necessary

Other possibilities
-------------------

- Return a proxy for state objects
