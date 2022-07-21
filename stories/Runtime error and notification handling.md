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

- 