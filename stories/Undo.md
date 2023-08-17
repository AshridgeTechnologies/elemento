Undo
====

Aims
----

- Give developers the Undo/Redo capabilities expected in other apps and editors

Requirements
------------

- Undo can be triggered by Edit->Undo or Ctrl/Cmd-Z anywhere in the Editor
- Go back to the previous state, keeping states after the current one
- Redo can be triggered by Edit->Redo or Ctrl/Cmd-Shift-Z anywhere in the Editor
- Go back to the state after the current one, if there is one
- On a change, clear the undo states after this point
- If keypress occurs in an input field it must not interfere with the Editor undo
- Limit the number of states held to a reasonable number, maybe 100
- Changes of selected items in the Project Tree are included as state changes
- Maybe: Successive changes to same property of same element are condensed into one

Technical
---------

- Need to share old state content as much as poss
- Best place for holding the state queue and an Undo/Redo method is: 