Runtime error and notification handling
=======================================

Aims
----
- Errors are reported and leave app in a good state
- Programmer does not need to do anything to handle errors in most cases
- Can also have info and feedback messages

Requirements
------------

- General notification mechanism in app
- Errors, warnings, info, success
- Can call Notify Error, Notify Info etc from action formulas
- ~~Callers of action formulas handle errors by notifying them~~
- ~~Can attach a success message formula to an action~~
- Promises that reject are also notified
- App has list of notifications
- App has standard notification UI mechanism


Implementation notes
--------------------

- Refactor Generator
- 
From design note _Error and info notifications_
- Mark all standard functions with async keyword or async property
- Detect async functions by AsyncFunction constructor or async property
- Transform call expressions using these functions to await expressions while parsing the AST
- Make user defined functions async if they include any awaits
- Make action functions async if they call any awaits
- Wrap actions in handleResult function, which:
    - shows working indicator if gets a promise
    - shows success indicator when the promise resolves
    - shows error message when the promise rejects
    - shows success indicator if gets immediate result
    - shows error message if catches error
- App has a notification slot in its state, with message and type
- Use Snackbars at bottom left, containing Alerts, to show messages


