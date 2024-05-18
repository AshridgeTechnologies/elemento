Item Set Part 2
===============

Aims
----

- Make Item sets more useful, especially for free-form layouts

Requirements
------------

- Item styles can use the $item and $selected
- Item styles can refer to names in the containing page


Technical
---------

- ✅ Generated code of the item component creates the ItemSetItem, adds content directly
- ✅ ItemSet creates an element using the component
- ✅ Generated component needs path, $item, $selected, onClick as props
- ✅ Generated component includes the styles expressions
- ✅ Take valueOf the styles inside ItemSetItem, as state objects compared by instance
- ✅ Memo-ise the generated component
- Parser for generated component needs to pick up names used in itemStyles of the ItemSet
