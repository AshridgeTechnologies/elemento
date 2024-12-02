Search in project
=================

Aims
----

- Developer can easily find a component
- Developer can easily find usages of a component
- Can also search for any text

Requirements
------------

- Search box
- Immediate search when enter something
- Highlight elements where the text occurs in the name or an expression or fixed value
- Expand tree to show elements where the text occurs
- Highlight where the text occurs in property editor entries
- Cancel button in search box
- Case-insensitive search



Further requirements
--------------------

- Search box pops down/out from small link
- Esc clears search
- Case sensitive
- Full word
- Regex

Technical
---------

- Search is an interface - has matches() function
- Project has a searchElements function - list of elements
- Element has a searchProperties function - map of name to array of positions
- Search.matches() function returns null or array of positions
- Editor has the search box, creates the Search object
- Editor passes the search results into tree data, which sets isSearchResult in each tree item 
- Pass the Search into Property editor - it calls searchProperties
- AppStructureTree sets search result class which highlights the name
- Override standard node selected classes to highlight whole row (slightly less width) and not the name
- Property editor highlights 
