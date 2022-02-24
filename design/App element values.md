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
- 


Possibilities
-------------
- Have a defaultValue as well as a value in the appState, returned by valueOf
- Have an Empty value
- Have an Empty object that contains the default
- Generate code to get a static object from the control class


