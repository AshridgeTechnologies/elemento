Immediate Set Data
==================

Aims
----

- Make it easier for developers to understand and use how Data and Set work

Requirements
------------

- After a Set(dataElement, newValue), the new value is seen by anything in the same action
- The new value is also seen in any functions called by the action that use the Data


Technical
---------

- Seeing new value in same function possible by having a cached pending value in the Data object
- Seeing new value in other called functions should also work:
  - every function should depend on the Data object if code generation of useCallback dependencies is correct
  - so all the current versions of each function in the page should refer to the same version of the Data object



