Create first component schema
=============================

Aims
----

- Learn what is needed in a component schema

Requirements
------------

- JSON Schema for first component - TextInput
- Include state and React component props
- Include documentation
- Must have all information needed for the model object and editor
- Define as simply as possible, but reuse common defs
- Pull out common properties into a shared schema
- Schema is exported from the module

Points
------

- Most properties can be null - but just miss out of the required list?
- Most properties can be expressions - held differently in the JSON
- Fixed only may need to be a type so it's description of a string only can be used in the docs
- Similar for expr only
- Can you use $id to tell more about the type of a property?
- How to store/access class-level values like icon?
