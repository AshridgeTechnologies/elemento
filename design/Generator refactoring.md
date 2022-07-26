Generator refactoring
=====================

Aims
----

- Make Generator more maintainable
- Lay groundwork for using externally defined components

Forces
------

- Syntax Error collection is one aspect of the job
- Finding the identifiers used in expressions is another aspect
- Unknown identifier error collection is a related aspect
- Manipulating the AST should be separate to parsing and collecting errors
- Keeping parsed or generated state in an object and caching is neater than passing it around
- Allow definitions of components to be added at runtime

Initial spike 22 Jul 22
-----------------------

- Split into Parser and Generator
- Parser takes the App as its constructor argument
- Parser is a one-shot object so can use member methods and cache results
- Parser responsibilities:
  - AST for any individual component property
  - Convert fixed values to AST
  - Identifiers used in a component property, or a component at any level
  - Errors for a component property, or a component at any level
  - Identifiers of each type in a component at any level

Further work
------------

- Model objects have metadata on each property, not just names
- Metadata used by Property editor
- Metadata used by Generator
