Block element
=============

Aims
----

- A container element with fine control over positioning of the elements inside
- A simple block that can be styled to show a block even without contained elements

Requirements
------------

- ✅ Block model element
- ✅ Block runtime element
- ✅ Contained elements use the position set in their styles
- ✅ Can control position with top, left, etc
- ✅ Can also use normal flow and use margins or anything
- ✅ Quick Preset positions for elements - at least centered
- ✅ Make styles with numbers default to px where appropriate
- ✅ Selections for valid values where appropriate

Technical
---------

- ✅ Generate in similar way to Layout
- ✅ Override set for styled elements to set style preset positions
- Need a way to either warn, or only enable if element is in a Block
- ✅ Default the Block container width to 100% so it doesn't squash text elements
- ✅ Remove undefined styles before setting
- ✅  Use sxProps fn throughout, also use in sxPropsForFormControl, sxFieldSetProps
