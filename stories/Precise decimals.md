Precise decimals
================

Aims
----

- Make Elemento usable for apps doing calculations with currency amounts

Requirements
------------

- No rounding errors!
- Decimal number type available
- Can create with a Decimal function from number or string
- Add/Sub/Mult/Div functions take Decimal or ordinary numbers, Decimal result
- GT, LT, GTE, LTE, EQ functions also take Decimal or ordinary numbers, boolean
- Decimal calculations are always done with precise digits, unless recurring
- Other functions like Sum, Max, Min, Avg accept Decimal arguments
- NumberType can be Decimal, also have a quick DecimalType function
- Number Input converts its value to Decimal if its Type is DecimalType
- Set an app to do all calculations as Decimal - convert all binary arithmetic ops to decimal function calls


Issues
------

- Better to have separate Integer and DecimalTypes?

Technical
---------

- Implement using bignumber.js or one of its related libraries