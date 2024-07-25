Error finding improvements - Part 1a
====================================

Aims
----

- Simple improvements to runtime error handling

Requirements
------------

- ✅ Show element and property for state object errors
- ✅ Show element and property for React element errors
- ✅ Show element and property for action errors

Technical
---------

- Use property builder to store name of each property before evaluating the expression
- In ErrorFallback display the element name, property name and error message
- Wrap all functions and actions to catch exceptions and report the element/property
