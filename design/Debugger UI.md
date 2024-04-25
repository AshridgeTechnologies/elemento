Debugger UI
===========

19 Feb 2024

Aims
----

- Top class debugging facilities for developers
- Help learners to find their mistakes while learning
- Also be able to help experienced developers quickly find problems

Needs
-----

- See the current properties of any component
- See the current state of any component
- See collection and list items individually
- See values of separate calculations in a formula
- See errors and where they occurred
- See the tree of function calls in each calculation, and the inputs and result
- Evaluate expressions in context of page/app
- Evaluate expressions in context of a calculation - but how, exactly?
- Run any command in context of page/app

UI
--

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

Possible future UI
------------------

- Tree view of a property value that follows the expressions that go into it

Forces
------

- Because everything is functional, debugging is static, not on breakpoints
- But because the values are all hidden inside the render function of the page component, values are not so easily available to inspect
- Need to translate expression values into standard JS to evaluate
- Need to update values shown in debugger as they change due to user action or async events
- Allow for people inventing alternative debuggers
- May get invalid expressions
- Expression evaluation may throw an exception
- Expression evaluation may return a Promise
- Probably want to evaluate several expressions together - some may throw, some may return Promise
- Expressions may get Pending values from our async components
- Expressions that call get functions should be called on each render to update the result
- Expressions that call an update function should be called only once

Possibilities - implementation
------------------------------

- Generate code to dump everything inside the page render
- Generate React component props separately so easy to get at
- Get expression from design for each prop and evaluate in page
- "Hook" of some sort to evaluate one or more expressions in the context
- Expressions required are in the app context, only there in preview mode
- Generate call to a debug or useDebug() function just before returning the contents
- Modify the code when loaded in the preview
- Generate hook call commented, uncomment in service worker
- Changing context value of expressions required should cause a re-render if get with a useContext call
- Actions: An adhoc expression that returns undefined or a Promise of undefined is removed after being called once
- Security - must ensure no opportunity to read data or execute code except from the debugger tool

Decision - initial approach
---------------------------

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

Decisions - further refinement
------------------------------

25 Apr 2024

- Debugger UI decides what expressions it wants evaluated, and translates to JS as necessary
- Preview Controller is responsible for evaluating those expressions safely
- Each expression should be evaluated individually and errors trapped



