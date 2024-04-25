Debugger actions and functions
==============================

02 May 2024

Aims
----

- Developer can easily debug and run actions and functions in the inspector

Needs - running
---------------

- Can run an action from the inspector
- Run the action only once
- Actions run as a current expression by mistake do not cause an infinite loop
- Intuitive UI for running actions and/or watches that turn out to cause updates
- Can use current page elements when running the action

Needs - debugging
-----------------

- Can see parameters and intermediate calculations in the run
- Can see the return value

Forces
------

- Actions and functions have a lot of similarities
- Both need to be run in Page to have context
- Actions usually update the state, which causes re-render and debug statements to be executed again
- Some actions are async, some not
- Functions may call update functions
- We do process multiline statements already to add return, but not actions
- Can't select an action like an element
- Have access to state in preview window, set by app store hook, and also in StoreContext
- appStore.getState gives you the state
- BUT updates can be deferred


Possibilities
-------------

- Detect state updates from a debug expr:
  - Include the StoreApi in the debug data returned from the eval
  - Use it in elementoDebug to check whether each debug expr causes a state update
  - Return marker to say whether an expr updated the state
  - Remove it from watches if it does
- Hook into state update calls, detect, disallow
- Generate action expressions with marker to allow update 
- Undo the state update for watch expressions that cause updates, 
- When a watch tries to update, suggest moving it to an action
- When a watch tries to update, show a Run button beside it
- Add debug statement to code of actions, triggered if current debug requests it
- Mark a function calculation or action for debugging
- Generate code for debugging only when requested - but problems with leaving it in?
- Generate and mark debug code, multi-file writer that removes from dist, enables for preview

Spike of running actions
------------------------

- Trying to mix watch and one-off runs is difficult
- Consider separate call to run an action one off 
  - BUT if you want to use page elements, you have to run it during page rendering, so need the useDebug mechanism
- Consider using the same for requests that return a promise
