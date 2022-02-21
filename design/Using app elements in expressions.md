Using app elements in expressions
==================================

Needs
-----

- Refer to app elements by their names in expressions
- Plain names for elements at this level on the same page
- Dot notation names for elements under the app or nested within elements on the page
- Use properties of the elements in expressions
- Pass the elements as arguments
- Functions receiving the elements can update them

Forces
------

- Keep flexibility to allow for future needs
- Don't add requirements on controls that make iot difficult to add new or use third party controls
- Keep code generation simple
- Keep the generated code similar to hand-written
- State is currently accessed in both the parent container and the element
- Elements use the path as an id in the React element

Possibilities
-------------

- Make the element state an object with prototype that knows how to update itself
- Make the element state an object with prototype that can return an updated version of itself
- Make each element state object know its path
- Accept path or object with a path in functions
- Accept path or object with a path in updateState
- Access state in container and pass state with path into the element 