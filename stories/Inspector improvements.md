Inspector improvements
======================

Aims
----

- Fix errors caused by Inspector
- Make Inspector more useful to developers

Requirements
------------

- Do not try to evaluate properties if selected element is not in the page being displayed
- Do not try to evaluate JavaScript function calculation or action properties
- Make it possible to evaluate properties of app-level elements and app bar
- Show runtime errors in actions with their location
- Show runtime errors in React rendering with their location
- Inspector eval failures must not stop app displaying
- Evaluate any expression in the current page as a one-off
- Watch one or more expressions, indicate if not available
- Highlight an expression in a property on editor and see its value immediately in inspector (or in the editor)
- Run an action in the current page
- Make all functions available within the eval whether they are already used in the Page or not
- Break in Functions before return and debug intermediate values or any expression
- Break in actions before return and debug intermediate values or any expression

Technical
---------

- Possible: wrap actions, notify errors to user and inspector
- 
