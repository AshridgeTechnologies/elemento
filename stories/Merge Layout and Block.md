Merge Layout and Block
======================

Aims
----

- Transition to single Block element, without breaking things that use Layout

Requirements
------------

- Keep existing vertical with Stack as default
- Horizontal and horizontal-wrapped are other layout options
- ✅ Keep absolute positioning option as 'positioned'
- ✅ Have a 'none' at the end to use default doc layout
- ✅ Name of merged element is Block
- ✅ Existing projects with Layout can read the element as a Block
- ✅ Convert horizontal and wrap properties to new Block layout options
- Runtime Block element renders differently depending on Layout

Technical
---------

- Put constructor on Layout, return a Block
