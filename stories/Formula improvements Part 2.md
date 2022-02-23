Formula improvements Part 2
===========================

- Functions without arguments are invalid
- Auto use value of controls

Auto use value of controls
--------------------------

- Still need to refer to whole control in some places
- May occur in operator expressions
- Could pre-process function arguments
- BUT control names may occur in operator expressions
- A combination of coercing function arguments and adding valueOf to state objects should work
