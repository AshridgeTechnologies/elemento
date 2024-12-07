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
- Seeing new value in other called functions difficult: they are memoized with useCallback, so have an old version in the closure


