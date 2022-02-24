Formula improvements Part 2
===========================

- Stop invalid formulas being generated into code eg TextInput InitialValue of "xx  (no closing quote)
- Functions without brackets are invalid
- Auto use value of controls
- Reset(page/control) function

Auto use value of controls
--------------------------

- Still need to refer to whole control in some places
- May occur in operator expressions
- Could pre-process function arguments
- BUT control names may occur in operator expressions
- A combination of coercing function arguments and adding valueOf to state objects should work
