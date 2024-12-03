Search in project
=================

Aims
----

- Developer can easily find a component
- Developer can easily find usages of a component
- Can also search for any text

Requirements
------------

- ✅ Search box
- ✅ Immediate search when enter something
- ✅ Highlight elements where the text occurs in the name or an expression or fixed value
- ✅ Expand tree to show elements where the text occurs
- ✅ Highlight where the text occurs in property editor entries
- ✅ ...including style properties
- ✅ ... and Name and Notes
- ✅ Cancel button in search box
- ✅ Case-insensitive search



Further requirements
--------------------

- ✅ Esc clears search
- Case-sensitive option
- Full word option
- ✅ Regex
- ✅ Search for this element button by Formula Name

Technical
---------

- ✅ Search is a regex - has match() function
- ✅ Editor has the search box, creates the Search object
- ✅ Element has a searchElements function - list of elements
- ✅ Editor passes the search results into tree data, which sets isSearchResult in each tree item 
- ✅ AppStructureTree sets search result class which highlights the name
- ✅ Pass the Search into Property editor - it passes to each PropertyInput
- ✅ Override standard node selected classes to highlight whole row (slightly less width) and not the name
- ✅ Property editor highlights 


