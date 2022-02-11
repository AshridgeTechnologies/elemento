Plain value/formula switch
==========================

  - Most but not all properties can have formulas (name cannot)
  - Button at start of property field
  - Fx= or Val, colours, with title and hint
  - Toggle shows other button
  - On Val, show appropriate control - string, number, checkbox
  - Keep both until move to another element in case want to switch back
  - Store formula in an {expr} object
  - Set state of control based on {expr} or plain value

NTH
---

- Change to formula if type = at the start

Tasks
-----

  - Change property editor to use PropertyInput that has button but still just text field for _expression_
  - Change to store expression in an object
  - Change to store fixed value or expression
  - Change to use fixed value literal in generated code
  - Make button toggle type
  - Use true/false dropdown for boolean fixed
- ~~Use numeric control for number fixed~~  Show error if invalid number entered in fixed mode
  - Experiment with button styling and position
- ~~Use generic typing for values and onChange etc~~