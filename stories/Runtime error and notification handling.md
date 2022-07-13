Runtime error and notification handling
=======================================

Aims
----
- Errors are reported and leave app in a good state
- Programmer does not need to do anything to handle errors in most cases

Requirements
------------

- General notification mechanism in app
- Errors, warnings, info
- Can call Notify Error, Notify Info etc from action formulas
- Callers of action formulas handle errors by notifying them
- Can attach a success message formula to an action
- Promises that reject are also notified
- App has list of notifications
- AppBar has standard notification UI mechanism
