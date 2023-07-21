Precise decimals
================

Aims
----

- Make Elemento usable for apps doing calculations with currency amounts

Requirements
------------

- ✅ No rounding errors!
- ✅ Decimal number type available
- ✅ Can create with a Decimal function from number or string or value object
- ✅ D(val) or D`123` is available as a shorthand
- ✅ Add/Sub/Mult/Div functions take Decimal or ordinary numbers, Decimal result
- ✅ Gt, Lte, Gte, Lte, Eq functions also take Decimal or ordinary numbers, boolean or value object
- ✅ Decimal calculations are always done with precise digits, unless recurring
- ✅ Other functions like Sum, Max, Min accept Decimal arguments
- ✅ ~~NumberType can be Decimal, also have a quick~~ DecimalType object
- ✅ Number Input converts its value to Decimal if its Type is DecimalType
- ✅ Form generation creates a NumberInput for a DecimalType

Further requirements
--------------------
- Set an app to do all calculations as Decimal - convert all binary arithmetic ops to decimal function calls


Issues
------

- Better to have separate Integer and DecimalTypes?

Technical
---------

- Implement using bignumber.js or one of its related libraries