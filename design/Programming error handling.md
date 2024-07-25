Programming error handling
==========================

8 Feb 2024

Aims
----

- Easy to find all static errors in the project
- Easy to find the source of a runtime error
- Easy to understand what the error is
- Avoid losing the app display as much as possible

Needs
-----

- Be able to easily see all elements with a static error
- See where in the formula the error occurs
- Know which component a runtime error occurs in
- Know which property a runtime error occurs in - state object
- Know which property a runtime error occurs in - React component
- Know which function call a runtime error occurs in, with simple stack trace
- Know when an error occurs in an action, and where
- Clear plain language error messages with names, actual and expected values
- Limit the scope or impact of errors to keep the page displayed
- BUT avoid knock-on errors

Forces
------

- Keeping generated code "conventional"
- Keeping generated code readable
- Keeping generated code efficient
- Conventional code would use JSX anyway
- !!! React elements must be given the actual prop values, not just a big lump
- Some warnings will pass through the unusual value
- Errors may want to substitute a harmless value and report error 
- Can't pass functions into React components or state objects as they would not compare equal so would continuously re-render

Possibilities
-------------

- State object init values are in a function, wrapped in error handling with the component name by the constructor or useObjectState
- Function is only called when needed (but that is on every render...)
- Builder pattern for state objects that knows what property is being initialised
- State object property expressions always wrapped in functions
- Builder pattern for react element props
- Calculate expression values in separate variables with mechanism to catch errors
- Format all values on separate lines to keep readable
- Builder has functions for expression values, not for plain, just evaluates them all
- Builder is a proxy that provides chainable setter methods for any property
- Builder could add the path argument separately
- Builders can return all values that do work, even if errors
- Wrap React.createElement in another fn that builds the props first
- useObjectState could take constructor and buildable args separately, and build/check the args first before passing to state object constructor, and have path to report
- Translate/explain JS errors into plain language
- All Elemento functions check their arguments and report errors with as much detail as poss
- Pull out all expressions in React props into separate variables before the return statement
- Pull out expressions in state object props into variables before each component
- In ErrorFallback, pull out line from stack trace, use to find line in source and extract variable name, and then component/prop
- Insert trace statements to set current component/prop before evaluating expr

Possibilities - Actions
-----------------------
- 
- Actions catch programming errors and notify


Tolerance
---------
- Functions tolerate empty or other invalid values, but warn about them in an unobtrusive way
- The result is a "sensible" default
- Could avoid the need for lots of error checking
- Could lead to sloppy programming and difficult to find bugs
- Context for warnings important, but difficult - maybe set global current function name in a try/finally
- Probably better to have a different channel for programming errors and warnings


Decisions
---------

- Spike separate vars


