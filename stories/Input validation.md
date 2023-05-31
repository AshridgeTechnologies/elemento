Input validation
================

Aims
----

- Types can be used to provide for input fields:
  - validation
  - help text
  - defaults for characteristics
  
Requirements
------------

- All input elements have a Type property
- Type is always an expression
- Type may refer to a Type defined elsewhere, or be a Type expression
- Input element state has a valid property and an Errors property
- Errors are shown with the input element if Touched
- Invalid entry shows in style
- Required inputs are indicated
- Inputs have a Touched property to show if focused since last Reset
- Inputs have a Modified property to show if current value different to original value
- If have type description, shows it as help text, if hover over an i symbol
- Where possible, input elements set their properties from Type properties eg min/max
