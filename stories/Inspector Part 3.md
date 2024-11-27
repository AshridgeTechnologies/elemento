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
- Break in server functions before return and debug intermediate values or any expression
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

- Log could return last argument so could assign and log
- Use debugger on client
- Chrome dev tools panel for Elemento
- Server side logging/debugging returned alongside data - in response, or headers
- Calculations inside server functions auto logged - but just use log?
- Insert a debug statement at end of every function that logs requested expressions
- Expressions requested on client in map of fn path to exprs, in window global
- Way of passing requested expressions to server, maybe in header, and make available in global
  - Must make sure this is preview-only!
- Debug function that logged an expr or passed back to inspector, as well as returning the result, or nothing in prod
