Model types in studio
=====================

Aims
----

- Developer can define types for use by other features

Requirements
------------

- Project has a Data Types area
- Types can contain new model objects to define types
- Some type model objects can contain others
- Types all have name and optional description
- Default description generated from other properties
- Other properties to suit the kind of type
- Types can be referred to by name throughout the app
- Types within others can be referred to by dot notation
- Desirable: Additional constraints with expression and description

Type Objects
------------

- Text Type: min length, max length, format (email, url), regex
- Number Type: max, min, format(integer, currency)
- Boolean Type
- Date Type: max, min
- Enum type: values
- Object type: can hold a map of other types
- List type: can hold a single other type, called item
