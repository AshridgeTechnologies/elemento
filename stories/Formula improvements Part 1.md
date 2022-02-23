Formula improvements Part 1
===========================

Error handling
--------------
  - Handle other errors including:
  - Uncaught SyntaxError: Unexpected token 'return' (eval expr as function arg)
  - Uncaught ReferenceError: (Unknown token in initial value)
  - isExpr with null
  - Generating React error into prop values
  - Invalid syntax in action expressions
  - Formula errors displayed in the property editor
  - Bugs in setting initial values of Number input



Usability
---------
  - Formulas can be multiline eg Record
  - Assignment turned into equality comparison

Tasks
-----

  - PropertyInput displays an error it is given
  - PropertyEditor displays errors it is given
  - Generator returns errors with generated code
  - runtime has codeGenerationError
  - Editor generates code and gets errors
  