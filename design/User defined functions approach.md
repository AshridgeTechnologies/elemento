User defined functions approach
===============================

Aims
----

- Users can define their own functions and use them in one area or throughout the app


Forces
------

- Needs to be simple and intuitive
- Should be easy to understand where/whether you can use functions elsewhere
- Functions should not automatically be global
- Functions may use other elements in their calculation
- Functions may also be pure
- Needs to fit with the globalFunctions and useStateObject conventions
- Should fit JS conventions
- If a function uses other elements, it is not pure, and it effectively becomes a different function when those elements change, so calculations that depend on it need to change

Possibilities
-------------

- They are like state objects
- They are like global functions
- They are like local functions within a component
- Generate different code depending on whether they use other elements or not
- Use dependency lists to know when a function has changed
- Mark functions as local or shared (private/public)

Decision 6 Jul 22
-----------------

- Initial implementation will be local functions only
- Reasons: 
  - sharing functions brings many complications
  - sharing functions may not be needed
  - sharing functions may be regarded as bad practice
  - can add shared functions later, difficult to remove