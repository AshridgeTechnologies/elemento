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
- ✅ Init may optionally return the state object to use
- ✅ Init is called by the store on all new and updated objects
- ✅ Previous version (if any) is passed to init
- ✅ Objects should not call init, even when copying
- ✅ In update, store should not replace a proxy that wraps the same object
- ✅ Proxy creation moved out of AppStateStore
- ✅ Two ComponentStates - with/without proxy
- ✅ Good approach to using state from elsewhere in the app - just reference it's path.  Calculate path from own path if appropriate
- ✅ Decide what parts of base component are to do with state, and which are convenience for Elemento eg valueOf, domElement
- ✅ Does path need to be in properties - no, can get from asi
- ✅ Read https://www.telerik.com/blogs/vue-basics-state-management-vue
- ✅ Proper typing for state objects - no as any
- ✅ Move overrides of withState/withProps to copy eg Data
- Unit tests for AppStateStore, ComponentState, app state hook
- Change all code generation to use auto state
- Move to separate package

