Calculation conditions
======================

Aims
----

- Make "when conditions" available for clearer programming
- Easier to work with newly-Set values
- Avoid adding extra elements

Requirements
------------

- ✅ Calculation has a When True Action property - action expression
- ✅ When the calculation is truthy, and it was not when previously evaluated, run the action
- ✅ Run the action again if the calculation goes to false then true again
- ✅ Can use the new value of the calculation in the triggered action

Technical
---------

- Spike best place to store previous value and trigger action - seems to work ok in state
