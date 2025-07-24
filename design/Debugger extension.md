Debugger extension
==================

17 Jul 2025

Aims
----

- Move the debugger to a dev tools panel
- Improve the facilities and implementation

Needs
-----

- Chrome extension that adds a debugger panel
- Debugger panel has similar facilities to existing panel


Possibilities
-------------

- Page render loop calls a function to get the current debug code
- The debug code includes continuous expressions, and one-offs
- One-offs are included in the debug code once and removed afterwards
