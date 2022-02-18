Global functions and data
=========================

Needs
-----

- Certain functions need to be available everywhere in generated code:
  - Standard pure functions eg Sum, Left
  - Standard functions that use the top-level App
  - User-created pure functions
  - User-created functions that use the top-level App
- Certain fixed data needs to be available everywhere in generated code:
  - Page names in the app 

Forces
------
- The functions will not change while the app runs
- Only some components will need them, tidier not to import/declare where not needed
- Do not want to pass down through all components
- May have more levels than App and Page in the future
- As code is generated, can do whatever needed to make them available in a component
- Do not want to make app functions global as may want multiple apps on a page, and making things global always bites you in the end
- BUT runApp.ts currently makes everything global
- AND the app currently expects to take up the whole page
- Context is intended for changing data and causes a re-render when it changes - so more than needed
- Context is a standard recognised technique
- Context is slightly cumbersome to use

Possibilities
-------------
- Custom hooks may be useful
- Zustand technique of creating a store and returning the hook may be useful

Decisions
---------

- Feb 22: Make ShowPage and the page names part of a global app functions, note making it app-specific as a future improvement

