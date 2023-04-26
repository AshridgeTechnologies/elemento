Generate Type objects
=====================

Aims
----

- Code is generated for type objects that can be used in other features

Requirements
------------

- ✅ Elemento runtime type objects corresponding to Types
- ✅ Generate declarations of objects of all types
- ✅ Each DataTypes is an object with fields for the top-level types it contains
- ✅ Rules can use formulas for the validation expression and description
- ✅ Record type cross-field constraints can refer to values within the object
- ✅ Errors in type generation refer to appropriate field of type or Rule
- Errors shown in Editor
- Types can be referred to in component properties and expressions throughout the app, using name prefixed by name of the DataTypes
- Types within others can be referred to by dot notation
- ✅ Generate a types module for each DataTypes object
- ✅ Correct JavaScript code(!)
- ✅ Runtime types validate values correctly
- Types can refer to each other by name within a DataTypes collection
- Type objects that refer to each other are defined in the right order
Technical
---------

- Use a separate generator, may want to use types in both client and server

To Do
-----


Enabling expressions in Types
-----------------------------

- ✅ Make Parser work with Types
- ✅ Refactor Parser to use app field instead of passing down
- ✅ Find where it needs to be an App rather than any element
- ✅ Maybe push functionality into the model element eg finding names
- ✅ Make Parser able to work with any top level element
- ✅ Make Parser able to work with a set of DataTypes - maybe a pseudo-element above? or the Project?