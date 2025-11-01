Table component
===============

Aims
----

- Provide a simple way to include a table in an app
- Similar to List/Item Set

Requirements
------------

- ✅ Table component
- ✅ Items property - array of objects OR Collection
- ✅ Also Selected item, selectable, select action props like Item Set
- ✅ styles, show props
- ✅ Row styles
- ✅ Cell styles
- ✅ Data type - must be a record type
- ✅ Scrolling table with sticky header
- ✅ Virtual scrolling for large data sets
- ✅ Columns formatted according to data type

Further requirements
--------------------

- Simpler columns record - item prop name => Label;type
- OR override record
- Auto-format from types of first record
- Min/max display widths for certain data types
- Cell styles is an object that has general top-level defaults plus individual styles for each cell, produces a function


Technical
---------

- ✅ Review vs ItemSetState and refactor 
- ✅ Fix scrolls back to top when select
- ✅ Certain table level styles => container eg border-* - others?
- ✅ Unit test
