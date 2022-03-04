App element values
==================

Needs
-----
- Controls behave "as expected" for the programmer
- Controls behave "as expected" for the user
- If a control has an empty value, it should show an empty string for text and number, default or "Please select" for select, false for boolean
- Control value can be used in expression before anything entered - when value is empty
- Control value for empty in expressions is "sensible" - empty string for text, null for select, 0 for number, false for boolean
- Initial values can be set
- Initial values can be empty
- Initial values can be overridden with another value
- Initial values can be overridden with empty
- When the control is cleared by the user, the value is empty
- When the control is changed by Reset, the initial value is used


Forces
------
- This decision needs to be settled early, as it affects the behaviour of programs
- This is a general issue for all apps, not just Elemento
- It needs to remain simple to add new controls without modifying code generation
- Keep generated code simple
- Two issues - what is displayed in the control, and what is seen in expressions using its value
- Need to consider what is sent by the control when its value is cleared, and what is stored in the app state, what is generated into the defaults, what the runtime control does with the value
- React components should not be given explicit undefined values
- Some controls have an empty value different to the default in expressions eg number, some are the same eg text, boolean.  Select could be either.
- There are three places values are used: the state stored in the app state, the values supplied to and received from a control, and the value used in expressions
- Values could be held in the app state and/or added by the generated code when it is retrieved


Possibilities
-------------
- Have a defaultValue as well as a value in the appState, returned by valueOf
- Have an Empty value
- Have an Empty object that contains the default
- Generate code to get a static object from the control class

Decision 10 Mar 22
------------------
- The state can be empty - no value has been set, no initial value supplied
- The state object in the app state stores just the value
- The state object returned by useObjectState is a Proxy holding the initial value and default value
  - defaultValue - the value used in expressions if the value is empty
  - value - as set by the user
  - initialValue (optional) - the starting state when the control is first displayed AND if it is reset
- The proxy state object has a valueOf and a value property that return the same thing
- The value is:
  - if the value is present and not empty, the value
  - if the value is present and empty, the default value
  - else if an initial value is supplied, that value
  - else the default value
- If a control is reset, the value is set to undefined, which means not present
- If a control is cleared by the user, the value is set to empty
- The proxy state object has a _controlValue property, used by the control, that gives:
  - if the value is present and not empty, the value
  - if the value is present and empty, null
  - else if an initial value is supplied, that value
  - else null
- The control decides what to show for a null value
