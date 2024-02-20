Debugger Part 1
===============

Aims
----

- Developers can inspect and control a running app to understand what it is doing

Requirements
------------

- Debugger can only be activated in editor preview mode
- Editor can attach to debugger
- Two-way communication between editor and debugger
- Selection highlighting moved into debugger

UI requirements
---------------

- Select a component - probably the one selected in the Editor
- Show the state and React component property values, and (external) state values
- Show the expression for any property value or indicate plain value
- Show the value of any elements in the formula by hover or click
- Quick view of property values of any element in the formula by simple gesture
- Navigate to an element in the formula by simple gesture
- Highlight and evaluate any expression in the formula
- Box to evaluate any expression
- Also run any command in the evaluation box
- Value display allows for structured objects many levels deep

Further requirements
------------------

- Tree view of a property value that follows the expressions that go into it


Technical steps
---------------

- Debugger tool can user Editor Controller to subscribe to id of currently selected element
- Debugger tool reads Project from Editor Controller to get the element
- Debugger UI shows the Element property values and expressions
- Debugger UI also shows the state object property values
- Debugger sends an eval string for all required values by postMessage to the Preview window with origin check
- Debugger listens for return messages with the values
- runPreview listens for debug messages
- runPreview adds a DebugContext wrapper and passes in the debug data and a callback
- useDebugExpr hook gets debug eval string
- useDebugReport hook expects a function that returns any value, traps errors, sends it back to the DebugContext callback
- generator inserts a debug here comment just before the return of each page function
- Editor service worker replaces the debug comment with useDebugReport( () => eval(useDebugExpr()))
- runPreview callback posts message back to the Debugger
- Debugger updates the values displayed
- 
