Revision aid example app
========================

Aims
----

- Serve as a programming example
- Drive improvements to Elemento
- Be actually useful

Requirements
------------

- ✅ File datastore: Open, New, Save As on Menu under icon
- ✅ Browser (indexed db) data store
- ✅ Fact entity: Id, Question, Answer, Date Learned, Recall data
- Recall data: Last revised, Success, Times revised, Times succeeded
- ✅ Fact list page: List with Show/Add/Update/Delete
- ✅ Bulk add facility from CSV
- ✅ Learning page: Facts not yet learned
- Revision page: List with Selection in priority order
- ✅ Selection is by time intervals after date learned and no successful revision
- Ordering is by date learned descending, random within date
- Revision row hides answer until click one of two buttons - tick or cross
- Update revised data according to answer
- Can change answer on the same day
- Can search for a word in the question or translation
- Format works on a phone
- Help page



Desirable
---------

- ✅ CSV import or use directly as datastore
- Previous attempts

Finishing touches
-----------------

- Handle errors in import
- ✅ Import Learned, Last Revised
- Nav buttons highlight the current page
- Grey out today's revision if already answered
- Show All/HideAll buttons
- Show name of open data file
- Forms can be entered with enter
- Focus field - maybe auto after reset form
- Readonly inputs keep title in border
- Links to word entry from lists
- Keep Learn words visible on day learned
- Import uses AddAll 

Problems
--------

- ✅ Dual id/Id
- Message and clear after import


Features needed
---------------

- ✅ Constants in function calculations
- ✅ First/Last of list (to get highest date less than age) and/or FindFirst/FindLast
- ✅ Readonly property on text input
- ✅ Date storage in program - consider valueOf to allow subtraction? Prob not because addition not work
- ✅ DateFunctions - today, difference
- ✅ Date storage in database
- ✅ Date formatting
- ✅ Select(List, expression)
- ✅ ForEach(List, expression)
- ✅ User-defined functions
- ✅ Way to keep local state things in lists, like the Show button on Learn list, with the item, not the index
- ✅ CSV to Object function
- ✅ Bulk Add on collection and data store
- ✅ Text area preset size and fix typing behaviour
- ✅ Date functions give sensible output with undefined dates
- ✅ Date functions get values of args
- ✅ Sort
- ✅ Icon buttons
- Styling for buttons
- ✅ Menu
- Confirmation and error messages
- Empty message in List
- Date entry
- AddOrUpdate
- Get current page
- Highlight button
- ✅ Tabs in CSV

Revision conditions
-------------------

- Taking the latest revision date on or before the current date, the last revision is not successful and on or after the revision date  
