Expectations
============

19 Apr 2024

Aims
----

- Give the developer a way of defining expectations on values in the editor, preview, maybe elsewhere
- Support:
  - Tests
  - Tutorials
  - Demos

Needs
-----

- Get values via async calls
- Get values via observables
- Support at least Editor and Preview, maybe other sources
- Update the value as promises fulfilled, new observable values arrive
- Test those values for at least equals and not null
- Expectations can be constructed from data in test or tutorial specs
- Can easily get plain language descriptions for expectations

Forces
------

- Don't introduce new components, mechanisms, functions unless needed
- Make any new functions reusable and not specific to tests
- Hide async things from developer as much as poss
- Expect to use plain arithmetic expressions widely

Possibilities
-------------

- Have live expressions that update for observables and promises
- Calculation elements update for observables and promises
- Elemento functions all handle observables and promises
- Replace binary expressions with calls to functions that can handle async
- Make it possible for any expression to include an async value (promise or observable), and update component when they arrive
- Calculations update for async values
- Calls to defined Functions update for async values
- Editor/Preview Controller Client update the app state
- Async wrapper around any object or function
- EditorController Client is or has an Element type
- Editor/Preview Controller Client are background components automatically injected into tools at app level

Options for getting controllers to affect app state
---------------------------------------------------

- Explicit component added by developer
- Component auto-added to app by Generator
- General async adapter around the controller

Decisions
---------

- Several distinct issues here:
  - Using promises and observables from new sources in an app - only data stores and server app connectors do it so far
  - Assertions
  - Friendly presentation of values and assertions
  - Constructing assertions from data
- So:
- General DataAdapter to wrap any object or function with the Elemento state mechanism
- Assertions done by Equal() and NotNull() functions, or even Equal() and AnyNotNull
- Construct from data using same method as do now
- Expectation object that takes in target object, call, args, path after, expected value, value prop is result, toString presents the data
