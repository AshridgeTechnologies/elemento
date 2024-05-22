Inspector Part 3
================

Aims
----

- Further improvements to Inspector

Requirements
------------

- Show runtime errors in actions with their location
- Show runtime errors in React rendering with their location
- Prevent errors when trying to postMessage functions etc
- Break in Functions before return and debug intermediate values or any expression
- Break in actions before return and debug intermediate values or any expression
- Find values of $item etc inside Items
- Can evaluate expressions with async calls, without repeating each time the debugging is re-evaluated
- Can cache and refresh expressions with async calls
- Edit state values
- Eval/run multiline expressions
- Quick view of property values of any element in the formula by simple gesture
- Works for list elements
- Works inside forms
- Works for expressions used as functions in ForEach, Select, etc - but how?
- debug statement commented out when generated, Editor service worker removes the comment
- Tree view of a property value that follows the expressions that go into it
- Stack of states with Undo

Technical
---------
