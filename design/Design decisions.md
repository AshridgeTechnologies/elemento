Design decisions
================

Tree controls
-------------
Use rc-tree for the editor tree as it is versatile and allows drag-drop
Use MUI TreeView for the help tree as it does not need drag-drop and it is easier to make consistent with the rest of the MUI controls

Selection and highlighting - 31 May 22 - reversed
--------------------------------------
Add source element id as a data attribute to root DOM element of a component, to support selection and highlighting
Forces: 
- element ids are moving too far away from the source tree with Lists and Layouts
- adding another attribute is another overhead
Decision: the overhead is justified by the complexity of making it work using the hierarchical ids
BUT on spiking this solution: 
- the overhead of the attribute runs through all our code and tests, not just the DOM in the page
- there are simple ways of working around ids not exactly matching the source hierarchy
New decision: adjust algorithms to find source element from id on page and vice versa
