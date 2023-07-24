Manipulating screen elements
============================

Aims
----

- Make it easy for developers to inspect and act on screen elements from tools
- Consistent between editor and user app in preview
- Also consistent with tools in future user apps

Needs
-----

- Do all Editor actions:
  - Navigate tree
  - Select Menu items
  - Select context menu items
  - Enter properties
- Highlight any Editor element
- Open and highlight any Editor menu item
- Do all user app actions - click, enter/select, menu, context menu
- Highlight user app elements
- Inspect values of user app elements, inc text

Forces
------

- Ids and codes more accurate, less intuitive
- Text and labels more intuitive, less accurate
- Specific functions for each editor item may be more obvious, but less flexible
- This is more advanced than normal programming, so a little more complexity may be ok
- Page object idea of working with intentions rather than just clicks and keystrokes

Possibilities
-------------

- Have specific functions for acting on or selecting editor items
- Combine action functions with element selectors
- Select by a combination of ids, labels and text values
- Nested selects
- Allow or use css selectors
- Simple selector with chain of tokens that could be class, id, label, text or index
- Join selectors with : to mean both on same element
- jQuery or similar selector engine as an alternative choice
- Some functions can take multiple selectors to do one after the other
- If selector returns multiple elements, do all if possible (eg Highlight) or first (eg Click)

