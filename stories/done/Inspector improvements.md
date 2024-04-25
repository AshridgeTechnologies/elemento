Inspector improvements
======================

Aims
----

- Fix errors caused by Inspector
- Make Inspector more useful to developers

Requirements
------------

- ✅ Catch errors when evaluate properties if selected element is not in the page being displayed
- ✅ Do not try to evaluate JavaScript function calculation or action properties
- ✅ Make it possible to evaluate properties of app-level elements and app bar
- ✅ Evaluate expressions in Styles properties
- ✅ Don't try to evaluate invalid expressions
- ✅ Inspector eval failures must not stop app displaying
- ✅ ~~Evaluate any expression in the current page as a one-off~~ Can do with Watch
- ✅ Watch one or more expressions, indicate if not available
- ✅ Validate expressions based on the current page shown
- ✅ Highlight or click an expression in a formula on editor and see its value immediately in inspector (or in the editor)
- ✅ Save current expression as a watch
- ✅ Delete and edit watches
- ✅ Navigate to an element in a formula in Editor by Cmd-Click
- ✅ Run an action in the current page
- ✅ Prevent actions in a watch re-executing and causing an infinite loop
- ✅ Make all functions available within the eval whether they are already used in the Page or not
- ✅ Value display clearly presents structured objects many levels deep


Further requirements - moved to Inspector Part 3.md
--------------------
- Show runtime errors in actions with their location
- Show runtime errors in React rendering with their location
- Prevent errors when trying to postMessage functions etc
- Break in Functions before return and debug intermediate values or any expression
- Break in actions before return and debug intermediate values or any expression
- Can evaluate expressions with async calls, without repeating each time the debugging is re-evaluated
- Can cache and refresh expressions with async calls
- Edit state values
- Eval/run multiline expressions
- Quick view of property values of any element in the formula by simple gesture
- Works for list elements
- Works inside forms
- Works for expressions used as functions in ForEach, Select, etc - but how?
- debug statement commented out when generated, Editor service worker removes the comment
- Tree view of a property value that follows the expressions that go into it
- Stack of states with Undo

Technical
---------

- All changes from design doc Debugger app level objects.md
- Run actions once:
  - ✅ If get updateAttempted back, mark the expression as needs update
  - ✅ Show run button for needs update
  - ✅ Button updates debug expr to show update in progress, disables run button
  - ✅ Show update allowed by sending object with updateAllowed: true in it
  - ✅ Preview side checks flag and allows updates


