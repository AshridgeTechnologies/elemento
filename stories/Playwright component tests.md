Playwright component tests
==========================

Aims
----

- Simplify unit-testing React components

Requirements
------------

- Test in a real browser environment
- Ease the problems of async stuff in React and generally
- Move away from the restrictive weird interface of React testing library
- Allow visual understanding of what is happening
- Allow browser console debugging, with source maps

Technical
---------

- To debug, use PWDEBUG=console
- If the mount fails, also need a page.pause() at the start of the script
- Remember dialogs are not actually within the component that creates them
- There are two processes running: the test, in Node, and the component in the browser
- SO you are restricted in what you can pass into the component from the test
- Functions, and objects with functions, will NOT work, but they may be substituted by a function that returns undefined
- Workaround is to create a wrapper component and mount _that_ in the test