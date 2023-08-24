Editor Tools
============

Aims
----

- Make Tools usable for Tutorials and Help
- Tools can be imported from a URL


Requirements
------------

- ✅ ToolImport element
- ✅ Can only be added to Tools folder
- ✅ Only property is the URL, no children
- ✅ If opened, gets published tool as for an App and displays in an iframe in a Tool window
- ✅ General Help tool available from Elemento studio site
- ✅ Help button opens the Help tool
- ✅ Multiple tools can be open at the same time
- ✅ Can close individual tabs, one to right or first becomes active
- ✅ Tool stays active if switch to another tab
- ✅ Can show or hide entire tools panel
- ✅ Non-Elemento tools can control editor and preview
- ✅ Permission on tool import to allow editor/preview control
- ✅ Tool window styling is clear and intuitive

Technical
---------

- Start with a ToolImportWindow
- Refactor to merge ToolWindow/ImportWindow
- Try to refactor to single AppRunner from URL
- Have an array of tools in EditorRunner
- Keep Help at beginning
- Tabbed window with Tab for each open Tool
- If Tool state is lost when closed, consider moving to a collection of closed tools and re-opening from there

To Do
-----

- ✅ Get heights right for tools window
- ✅ Work out how to have close button on tabs 
    - https://github.com/mui/material-ui/issues/1680
- ✅ Work out how to select a tab from outside
   - pass in value to Tabs, listen to onChange and store state with selectedToolTab, use tab id
- ✅ Work out how to allow communication from tools and editor
  - use postmsg-rpc
- Investigate delay on loading tools/preview

Communication from Tool windows
-------------------------------

- Move controllers to runtime/tools
- Create client version of Editor and Preview controller with postmsg-rpc
- Include singleton Editor and Preview clients in runtime index
- Allow Editor and Preview in parser, create globals in tool code only
- Wrap Editor and Preview in permission checker
- Include read/write permissions on ToolImport 
