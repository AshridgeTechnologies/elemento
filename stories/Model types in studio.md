Model types in studio
=====================

Aims
----

- Developer can define types for use by other features

Requirements
------------

- ✅ Project can have named collections of Data Types
- ✅ Types can contain new model objects to define types
- ✅ Record type model objects contain other types
- ✅ Record type fields can be optional
- ✅ Types all have name and description(optional), and type description (validation rules)
- ✅ Default type description generated from other properties
- ✅ Other properties to suit the kind of type
- ✅ Properties produce constraints with expression and description
- ✅ Additional constraints with expression and description 
 
Moved to [Generate Type objects.md]
------------------------------
- Record type fields can refer to other top-level types
- Record type cross-field constraints can refer to values within the object
- Types can be referred to by name in component properties and expressions throughout the app
- Types within others can be referred to by dot notation

Type Objects
------------

- ✅ Text Type: min length, max length, format (email, url, multiline), ~~regex~~
- ✅ Number Type: max, min, format(integer, currency)
- ✅ True False Type
- ✅ Date Type: max, min
- ✅ Enum type: values
- ✅ Record type: can hold a map of other types
- ✅ List type: can hold a single other type, called item

Technical
---------

- Refactor type model classes
- Need to be able to refer to another type as a base
