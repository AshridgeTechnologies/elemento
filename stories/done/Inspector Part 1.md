Inspector Part 1
===============

Aims
----

- Developers can inspect and control a running app to understand what it is doing

Requirements
------------

- Inspector can only be activated in editor preview mode
- Editor can attach to inspector
- Two-way communication between editor and inspector

UI requirements
---------------

- ✅ Select a component - probably the one selected in the Editor
- ✅ Show the state and React component property values, and (external) state values
- ✅ Show the expression for any property value or indicate plain value
- Show the value of any elements in the formula by hover or click
- Quick view of property values of any element in the formula by simple gesture
- Navigate to an element in the formula by simple gesture
- Highlight and evaluate any expression in the formula
- Box to evaluate any expression
- Also run any command in the evaluation box
- Works for list elements
- Works inside forms
- Value display clearly presents structured objects many levels deep
- Allows for expression transformations
- debug statement commented out when generated, Editor service worker removes the comment


Further requirements
------------------

- Tree view of a property value that follows the expressions that go into it


Technical steps
---------------

- ✅ Controller client has subscribe mechanism (and unsubscribe to avoid leaks)
- ✅ Inspector tool can user Editor Controller to subscribe to id of currently selected element
- ✅ Inspector tool reads Project from Editor Controller to get the element and subscribes to updates
- ✅ Inspector UI shows the Element property values and expressions
- ✅ Inspector UI also shows the state object property values
- ✅ Preview Controller can provide observable for required values
- ✅ Inspector subscribes to required values
- ✅ generator inserts a debug statement just before the return of each page function
- ✅ Inspector updates the values displayed when they change in the app
- ✅ Inspector updates the values displayed when the project changes
- ✅ Inspector keeps getting debug info after app changes
- ✅ All components have their state properties defined
- ✅ Action properties are not executed
- ✅ Lists are at least ignored if cannot handle
- ✅ Takes implicit values of state objects

State output properties
----------------

- ✅ Add StateAttributeDefs or just names to model objects
