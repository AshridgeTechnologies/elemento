App level functions
===================

Aims
----

- Allow top-level functions that affect app state to be used throughout the app as plain functions
- Allow functions that act on a specific component to be used throughout the app as plain functions

Forces
------

- Need to easily introduce new components and use them in the same way as existing components
- Uncertain whether using a function on a component via dot notation is intuitive or not
- Dot notation almost certainly clearer for property access
- Is functional notation really intuitive for 
- Need to initialise the app data in only one place to avoid competing init loop
- Want to check whether object functions valid at design time

Possibilities
-------------

- Create fns to send top-level function calls to the first arg
- Transform functional expressions into dot notation if valid
- Embrace object notation
- Live with object notation 
- Get app state in a component if it is referenced direct or if any of its functions are used as top-level
- App functions special case - "imported" via declarations as needed

Decision 25 Jun 22
------------------

- Functions that act on the app exposed as if they are top-level functions
- Functions that act on other objects used via dot-notation

