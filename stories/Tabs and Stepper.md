Tabs and Stepper
================

Aims
----

- Provide the developer with a simple and intuitive Tab component
- Allow dual-use as a stepper/wizard

Requirements - Part 1
---------------------

- TabSet element
- Tab element within TabSet
- Show Tab navigation and currently selected Tab
- Tab can contain any elements that a Layout can
- Elements in Tab can access all Page elements including in other Tabs
- Tab has a Label - default to Name
- TabSet navigation can be vertical or horizontal
- Tab has an enabled property - default true
- TabSet has Next, Previous, Set(tab-name) functions

Requirements - Part 2
---------------------

- Tab has a valid property - default true
- TabSet has a completeInSequence property - makes Tabs enabled only when all previous are valid

Technical
---------

- Use Mui Tabs
- Tab has a state
- TabSet has a state
