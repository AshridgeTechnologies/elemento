Auto State - Code generation
============================

Aims
----

- Change code generation to work with auto state

Requirements
------------

- All apps still work!

Technical
---------

- ✅ useObject => useComponentState
- ✅ setObject => useComponentState with class and props separate
- ✅ Remove childNames, createChildStates, child state getters
- ✅ State functions become methods on the state class
- ✅ Make createProxy take a functionTransformer function, default to bind
- ✅ Pass in function from wrapComponentState
- ✅ ElementoStateStore passes function equivalent to wrapFn
- ✅ Need to find a way to reference app elements - pass in a reference to the app?
- ✅ Decide whether the App is an exception in having generated state extend AppState and the extending component creates it - yes
- ✅ Problem: placeholders mask missing features


