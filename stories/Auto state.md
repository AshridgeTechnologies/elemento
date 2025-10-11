Auto State
----------

Aims
----

- Migrate existing components to auto state
- Lay groundwork for unified components

Requirements
------------

- New state management package that can be a separate module in future
- Each existing stateful component is migrated to auto state
- Code generation for Apps and Pages uses auto state
- Everything still works!

Remaining refactoring
---------------------

- ✅ Remove all xxx2 versions
- ✅ Get as many test working as poss
- ✅ Take out App store interface into separate class
- ✅ WithProps should return itself if no changes
- ✅ With state should return itself if no changes
- ✅ Use matchesProps and matchesState functions
- ✅ Testing for new version with state -> ComponentState
- Init may optionally return the state object to use
- Init only called on brand new objects - up to object to copy across if updated
- Proxy creation moved out of AppStateStore
- Two ComponentStates - with/without proxy
- Proper typing for state objects - no as any
- Move overrides of withState/withProps too copy eg Data
- Unit tests for AppStateStore, ComponentState, app state hook
