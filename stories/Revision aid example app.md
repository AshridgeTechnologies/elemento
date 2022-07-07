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


Features needed
---------------

- AddOrUpdate
- Date storage in program - consider valueOf to allow subtraction? Prob not because addition not work
- DateFunctions - today, difference
- Date storage
- Select(List, expression)
- ForEach(List, expression)
- User-defined functions
- Empty message in List
