Formulas using page elements
============================

  - Formulas can refer to value of an element on the same page
  - Element referred to by name, with spaces removed
  - Value property referred to with dot syntax eg My_Input.value
  - Value is the value set by the user, or initialValue
  - Errors due to invalid names and formulas are handled cleanly

Technical Design
----------------

### Preparation
  - Separate component generated for each page
  - Review use of Zustand and other global state mechanisms

### Make data available
  - App state held in an appData module that calls Zustand create 
  - App state has section for each page
  - Page state has section for each element
  - Element section includes value
  - Element onChange updates the app state for that element
  - Element value displayed is either initialValue, or app state value if present

### Allow formulas to reference the data
  - Collect all the identifiers in the page formulas
  - Valid where match an element name
  - Generate code to get each element state from the page state
  - Generate a const referring to the element state in the page component function body


State management
----------------
  - Use Zustand
  - Give every component a path property, also use it for the id on the page
  - Every component at any level has access to it's own slice of the state via useStore
  - Every component _manages its own changes_ by calling set with its id
  - Each component uses any default it is supplied with if the state has not changed
  - Any identifiers used in formulas are exposed as consts from the state
  - The set uses optics or ramda to update a deeply nested path while retaining immutability
