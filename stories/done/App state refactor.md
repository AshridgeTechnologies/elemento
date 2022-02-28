App state refactor
==================

For use in action functions
---------------------------
- ✅ Runtime elements have state object passed in
- ✅ State replaces initialValue in the _runtime_ element
- ✅ Must still check all expressions used for initialValue
- ✅ Passed state includes the path
- ✅ Path is added by useObjectStateWithDefaults
- ✅ State object has an update function added to it
- ✅ State object can have an item (eg value) removed (effectively)
- ✅ Runtime element decides what to do if if no value supplied
- ✅ State object can be passed to action functions

To enable auto-value
--------------------
- ✅ State object can have a valueOf method
- ✅ Functions can wrapped to get valueOf from all their args
- ✅ updateState is hidden from generated code



Possible
--------

- ~~Move state update to container as well as read so symmetrical?~~