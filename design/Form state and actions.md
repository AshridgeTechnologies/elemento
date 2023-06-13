Form state and actions
======================

Aims
----

- Make _Editor_ forms collecting data and invoking actions:
  - easier to test
  - simpler to write
  - more maintainable

Needs
-----

- Avoid many useStates in a component
- Avoid business logic in React component
- Test business logic outside UI

Forces
------

- React way of doing things - immutable state object
- Async data initialisation in the state is hard, because may be a new version when resolved
- Desirable: Neat separation between UI and a state object with the business logic for the UI and a backing object
- Tension between immutability and object looking after its own state

Approach - 1 Feb 23
-------------------

- Each form component has a state object class
- State object holds entered data
- All validation and other stuff happens in the state object
- React component just displays what is in the state object
- React component creates the state object and holds it in useState
- State object is immutable
- Changes to state object create a new version
- State object notifies the new version to the setState function in the component
- Async calls from the state object to get data sent to the async value
- Async value object is passed between version, but each new version sets itself as the recipient of the data
