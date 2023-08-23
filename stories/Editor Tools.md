Editor Tools
============

Aims
----

- Developers can build add-on tools for the studio

Requirements - Part 1
---------------------

- ✅ Fixed Tools area under Project
- ✅ Can create a Tool under the Tools area
- ✅ Tool is almost identical to App
- ✅ Can edit Tool like any other element
- ✅ Studio has a Tools window
- ✅ Selecting a Tool opens the Tools window if not open, shows it in the Tool window, replacing any previous Tool
- ✅ Tool model updates cause live updates in the tool window 
- ✅ Tool window can be closed

Requirements - Part 2
---------------------

- Tools can use Editor object
- Editor object can inspect and manipulate the Editor
- Editor object can highlight things in the editor

Requirements - Part 3
---------------------

- Tools can use Preview objects
- Can set value of a checkbox
- Preview object can inspect and manipulate the Preview app state
- Preview object can inspect and manipulate the Preview app window

Requirements - Part 4
---------------------

- Tools can be imported from a URL
- General Help tool is pre-populated and imported from Elemento studio site
- Multiple tools can be open at the same time
- Tool stays active even if closed or switch to another tab

Technical
---------

- ✅ Model element for Tool
- ✅ Use App runtime element
- ✅ Generate Tool component
- ✅ ToolsFolder model element
- ✅ Fixed ToolsFolder in Project when created, saved, loaded, etc
- ✅ Tools appears in Project tree after Files
- ✅ Can insert Tool inside Tools area
- ✅ EditorRunner splits window with Editor and Tool window, if a Tool is shown
- ✅ ToolWindow component with name of tool and an onClose
- ✅ Tool window contains an iframe similar to preview
- ✅ Tool window does not overlap editor window
- ✅ The code url is /studio/preview/tools/<tool-name>
- ✅ Service worker handle request gets the code from the tools dir
