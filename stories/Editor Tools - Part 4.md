Editor Tools
============

Aims
----

- Make Tools usable for Tutorials and Help
- Tools can be imported from a URL


Requirements
------------

- ToolImport element
- Can only be added to Tools folder
- Only property is the URL, no children
- If opened, gets published tool as for an App and displays in an iframe in a Tool window
- General Help tool is pre-populated and imported from Elemento studio site
- Multiple tools can be open at the same time
- Tool stays active even if closed or switch to another tab

Technical
---------

- Start with a ToolImportWindow
- Refactor to merge ToolWindow/ImportWindow
- Try to refactor to single AppRunner from URL
- Have an array of tools in EditorRunner
- Keep Help at beginning
- Tabbed window with Tab for each open Tool
- If Tool state is lost when closed, consider moving to a collection of closed tools and re-opening from there