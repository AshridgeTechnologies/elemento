Startup Action
==============

Aims
----

- Provide a way to do anything necessary when an app starts up

Requirements
------------

- App has a startup action property
- When app has loaded, run the action

Technical
---------

- As for button: generate action function, pass into App element as a property
- App element has a useEffect, empty dependencies to run once
