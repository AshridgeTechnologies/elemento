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

- ✅ All input elements have a DataType property
- ✅ DataType is always an expression
- ✅ DataType may refer to a Type defined elsewhere, or be a DataType expression
- ✅ Input element state has a valid property, an Errors property
- ✅ Input element state has a private errorsShown property and a ShowErrors method
- ✅ Errors are shown with the input element if errorsShown is true
- ✅ Invalid entry shows in style
- ✅ Required inputs are indicated
- ✅ The errorsShown property is set by ShowErrors and set to false by Reset
- ✅ The errorsShown property is set to true when the input is blurred
- ✅ Inputs have a Modified property to show if current value different to original value
- ✅ If have type description, shows it as help text, if hover over an i symbol
- ✅ Input elements set their properties from relevant DataType properties eg min/max
- ✅ Remove unneeded props like TextInput.maxLength
- ✅ Select values can come from data type or external

Further requirements
--------------------

- If validation rules exist, show More... link in help text and expand to show rules
- Checkbox in error state is outlined in red and has red label when has an error


Technical
---------

- Where a Type expression is used as a property, may need to ensure it does not lead to extra updates/renders
- Need to refactor input components to share validation and error settings