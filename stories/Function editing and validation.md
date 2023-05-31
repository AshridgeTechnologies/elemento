Function editing and validation
===============================

Aims
----

- Make functions clearer and easier to edit
- Functions can create runtime errors

Requirements
------------

- Functions have an editable, variable length list of arguments
- Each argument has a name, a Data Type and am optional default value
- Functions have a variable list of intermediate calculations with a name and a formula
- Functions have a variable list of rules, which are like Record Type overall validation
- Rules may use the arguments and the intermediate calculations
- Error thrown if any arguments are invalid - include all errors
- If all arguments valid, an error is thrown for all invalid Rules
- Calculation can use arguments and intermediate calculations 

Technical
---------

- Need an editable list component