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
- All tests continue to pass
- Use generated class for user-defined components

Technical
---------

- Create element classes dynamically when required for each schema
- Extend BaseElement or BaseInputElement
- Change component type to property
- Create a Meta-Schema to enforce the special keywords used
- Separate out types to ensure runtime does not depend on model package
