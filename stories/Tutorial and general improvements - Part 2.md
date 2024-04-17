Tutorial and general improvements - Part 2
==========================================

Aims
----

Continue to:
- Make developer experience easier
- Fix small bugs
- Add small necessary features

Requirements
------------

From user test, changes to Elemento:
- ✅ Tutorial page scrolls down every time you focus on another part of the page
- Not clear where had got to in the steps on each page
- ✅ Show me for properties panel  all the different properties
- ✅ Avoid highlighting in preview when click in editor (different action queue) - maybe await steps?
- Vertical Progress bar with ticks starting near the top and continuing below the fold
- Completeness tests
- Practice task at end of tutorial
- Tutorial step component?  Or general user component mechanism?
- Ensure all controller actions return promises and/or common action queue
- ~~Comic Sans doesn't work as Font Family~~
- When changed the name of the Your Name element, things stopped working, no indication why
- Unknown names error message not very intuitive

From user test, changes to tutorial:
- ✅ Concepts of Properties and Properties Panel not obvious - or element
- ✅ Suggest working through before doing Show Me
- ✅ Typed own name instead of "Your Name"
- ✅ Did not like having the formula typed automatically before had chance to enter it
    - would have preferred being shown the right box and entering the formula as separate steps
- ✅ Suggest playing with properties after completing the tutorial
- ✅ Would have liked more explanation, so long as could choose to ignore

Other points:
- List manipulation - **Join**, Unique, Without, Contains, Append, Count✅ 
- Ensure service worker loads when visit studio site for first time
- Click Name in Getting Started selects many items
- Treat Collection as a List if passed to a function that expects a list
- Need to scroll list up or to position
- Way to specify parameter names in expression arguments
- Functions can be created at app level but cannot be referenced in Pages, and Page errors while trying to get state for them
- Max length on Text Input
- Newline to split on lines

Tutorial improvements
---------------------
- Tutorial format to include task statement
- Page index for app
- Fixed app components top, bottom, left, right - for nav or whatever
- ShowPage(following|before|first)
- Show previews for each app in separate tabs
- Lock an app to avoid changes
