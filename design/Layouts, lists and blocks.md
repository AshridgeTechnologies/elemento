Layouts, lists and blocks
=========================

20 Mar 2024

Aims
----

- Simple, unified, versatile concept for elements that may contain others
- Intuitive and easy to use approach for developers
- Allow for future unforeseen arrangements

Needs
-----

- Standard vertical and horizontal layouts of a fixed set of elements
- Standard vertical lists from a variable set of elements
- Free-form layouts of a fixed set of elements
- Free-form layouts of a variable set of elements
- Positions of elements in a set generated from input data or the index
- Blocks that can be styled and may or may not contain other elements

Forces
------

- Lists are conceptually different because they have a variable set of items, are selectable, ordered, etc
- Layouts have a set of elements known at design time
- Standard and free-form layouts have some things in common - they both contain other elements
- Standard and free-form layouts have different intentions
- Standard and free-form layouts have different implementations
- Blocks could just be empty (free-form) layouts
- Free-form lists also have some things in common with standard lists, but also different intentions and implementations 
- Formal lists in MUI use lots of wrappers etc which could interfere with free-form positioning
- For absolute positioning, need both a relative container and an absolute position contained element

Possibilities
-------------

- Make Layout a Block, may or may not contain other elements
- Block can be vertical, horizontal, horizontal-wrap or free-form
- Free-form uses absolute positioning - need to set position on each element
- Lists can have the same options
- Keep Layout separate from Block to avoid confusion
- Separate List Block element to avoid confusion
- Blocks can have variable items instead of fixed children - then repeat all the children for each item
- Blocks can have variable items as well as fixed children - but would not know which is which
- Wrap or clone each child element to set position absolute
- Leave it to dev to set position on each element

Decision
--------

