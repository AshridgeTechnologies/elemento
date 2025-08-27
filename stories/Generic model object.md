Generic model object
====================

Aims
----

- Don't need a boilerplate model object for every component

Requirements
------------

- ~~One generic ModelElement class~~
- ✅ Function to get a model element class for a schema
- ✅ Cache classes so single class for each element type
- Instances instantiated using a JSON schema
- ✅ Defines elements
- ✅ Validates JSON when loading using the schema
- Meta-Schema to enforce the special keywords used
- ✅ Share definitions between schemas
- All tests continue to pass
- Covers all style attributes
- Use generated class for user-defined components

Technical
---------

- Create element classes dynamically when required for each schema
- Extend BaseElement or BaseInputElement
- Change component type to property
- Separate out types to ensure runtime does not depend on model package
- Generic type to recognise properties?
- Components have metadata to hold state props etc
- Get rid of stateProperties - only used in Inspector

To Do
-----

- Ensure all prop options can be set by the schema
- BUT move state/stateAndDom out of schema - how?
- Work out best way to define what an element can contain eg parentType
- How to deal with enums that can be expressions
- Shorthand for show and styles
