Table of Contents
=================

Aims
----

- Support tutorials with a number of steps
- Be usable in different situations to navigate around a sequence or hierarchy of sections

Requirements
------------

- Text elements can have a styleName property - Normal or Heading 1-6, generates Typography variant
- Table of Contents Model object
- Source element or name property
- Width property
- Style names property - list of names
- Generates tree view from headings in the given source element
- Click on tree item selects it and scrolls that item to top of it's container
- Scrolling the container changes the selected tree item to the one at the top or the first one above the container
- ToC state has a Set function to set the current selected item and scroll to it
- ToC has Up and Down functions to move the selected item
- Tree always expands to show selected item