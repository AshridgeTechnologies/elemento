Menu improvements
=================

Aims
----

- Make menus more consistent and easier to understand for users
- Make Editor code more maintainable

Requirements
------------

- New Edit Menu with all options from context menu except Insert
- Edit Menu also has Undo and Redo
- Insert Menu has radio buttons for Before/After/Inside at the top
- Inside only shown if applicable to selected element
- Default insert position is After
- Elements allowed depends on radio button selected
- Context menu has single Insert option that shows same menu

Technical
---------

- Menus are refactored to be part of EditorRunner, not Editor