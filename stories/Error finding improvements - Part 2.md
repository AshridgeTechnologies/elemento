Error finding improvements
==========================

Aims
----

- Continue Part 1

Requirements
------------

- All built-in functions validate arguments and warn - but not for pending
- State object runtime errors are trapped and warn, with detail and position in expression
- React component runtime errors trapped and warn
- Built-in errors tool to show component and runtime errors
- Table view with all parts of each error



Technical
---------

- Generate functions for any expression in a property value, unless plain value
- Property builder function evaluates all, traps errors, subs neutral values, notifies errors
- Property builder and/or state object also validates all properties
- Change useObjectState to have separate constructor and property args
- Separate notifications for program errors/warnings
- Send level, component path, property, error message
- Console log for each error
- In preview, have a listener that sends messages to service worker
- Editor Runner receives messages and stores
- Editor Controller can supply messages
- Editor Controller can have subscription to new messages
- Error Tool shows updating messages


