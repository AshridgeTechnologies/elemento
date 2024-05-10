Rendering and state bugs
========================

9 May 24

Action used old version of Data state
-------------------------------------

- Caused by ItemSetItem being memo-ized, but not including the selectAction in its dependencies
- Solution: include selectAction in the dependencies

Rendering loop
--------------

- Caused by a Function in page NOT being memo-ized, so it created a new version each time, but the function was used in the select action.
- This meant the select action (correctly) regenerated itself when the Function changed, but this caused the properties for the ItemSetItems to have a new select action each time
- Solution: (to check) generate functions with useCallback
