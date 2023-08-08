Editor Tools - Part 3
=====================

Aims
----

- Developers can control the Preview app from Tools

Requirements
---------------------

- Tools can use Preview object
- Highlight function adds highlight to single selected element
- Highlight function clears all and removes if none selected
- Selector uses an element id
- Click function clicks selected element
- ContextClick function does a context click on selected element
- Enter function types value into textbox, or selects a value, or (un)checks a checkbox
- Can show steps with pointer and pause or not

Technical
---------

- EditorRunner creates PreviewController object
- EditorRunner sets as global in Tool window
- EditorController has Highlight function
- Highlight function affects DOM
