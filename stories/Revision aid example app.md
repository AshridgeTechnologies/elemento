Revision aid example app
========================

Aims
----

- Serve as a programming example
- Drive improvements to Elemento
- Be actually useful

Requirements
------------

- File datastore: Open, New, Save As on File Menu
- Fact entity: Id, Question, Answer, Date Learned, Recall data
- Recall data: Last revised, Success, Times revised, Times succeeded, Previous attempts
- Fact list page: List with Show/Add/Update/Delete
- Bulk add facility from CSV
- Learning page: Facts not yet learned
- Revision page: List with Selection in priority order
- Selection is by time intervals after date learned and no successful revision
- Ordering is by date learned descending, random within date
- Revision row hides answer until click one of two buttons - tick or cross
- Update revised data according to answer
- Can change answer on the same day



Desirable
---------

- CSV import or use directly as datastore

Finishing touches
-----------------

- Nav buttons highlight the current page
- Show All/HideAll buttons
- Show name of open data file
- Forms can be entered with enter
- Focus field - maybe auto after reset form


Features needed
---------------

- ✅ Constants in function calculations
- ✅ First/Last of list (to get highest date less than age) and/or FindFirst/FindLast
- Readonly property on text input

- ✅ Date storage in program - consider valueOf to allow subtraction? Prob not because addition not work
- ✅ DateFunctions - today, difference
- ✅ Date storage in database
- ✅ Date formatting
- ✅ Select(List, expression)
- ✅ ForEach(List, expression)
- ✅ User-defined functions
- Way to keep local state things in lists, like the Show button on Learn list, with the item, not the index
- Empty message in List
- Date entry
- AddOrUpdate
