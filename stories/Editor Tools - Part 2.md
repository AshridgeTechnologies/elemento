Editor Tools - Part 2
=====================

Aims
----

- Developers can control the Editor from Tools

Requirements
---------------------

- Tools can use Editor object
- Highlight function adds highlight to selected elements
- Highlight function clears all and removes if none selected
- Selector uses data-elementtype
- Selector uses label
- Selector uses text content
- Selectors can be nested
- Selectors can be joined (anded) with +
- Empty selector selects empty list
- Click function clicks first in selected list
- Enter function types value into textbox, or selects a value, or sets value of a checkbox
- Editor object can highlight things in the editor

Technical
---------

- EditorRunner creates EditorController object
- EditorRunner sets as global in Tool window
- EditorController has Highlight function
- Highlight function affects DOM - how?


