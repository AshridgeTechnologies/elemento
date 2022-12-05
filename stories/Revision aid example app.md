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
- ✅ Revision row hides answer until click one of two buttons - tick or cross
- ✅ Update revised data according to answer
- ✅ Can change answer on the same day
- ✅ Can search for a word in the question or translation
- Format works on a phone
- Help page

Bugs
----

- ✅ If type in middle of word in text box, cursor goes to end
- ✅ If enter accented characters, inserts extra one and loses char before
- ✅ Sorting should be case insensitive
- Not clearing changes when display a different word - but also linked with warning about unsaved changes


Desirable
---------


Finishing touches
-----------------

- ✅ Revision: Better indication of good/bad/not tried yet
- Links to word entry from lists
- Handle errors in import
- Catch duplicates on imports
- Forms can be entered with enter
- Scroll to new word after adding - maybe any time you set the list selected item
- Need a refresh button in case using it on different devices
- Nav buttons highlight the current page
- ✅ Revision needs to hide unless specifically shown that day
- ✅ Revision needs to show whether you have revised a word that day
- ✅ Learn: Show which are being learned
- ✅ Learn: count of how many being learned
- ✅ Import Learned, Last Revised
- Show All/HideAll buttons
- Focus field - maybe auto after reset form
- Readonly inputs keep title in border
- Revision: split into sections
- ✅ Keep Learn words visible on day learned
- Ask to save changes before moving away from word
- ✅ Words: search/filter list
- Buttons too small
- ✅ Separate add word form on Words page
- Touch to show word, then swipe
- Swipe right/left to revise on phone
- Show name of open data file


Further features
----------------

- Tags for words
- Speech synthesis
- Speech recognition
- Random ordering in revision sections

Problems
--------

- ✅ Dual id/Id
- ✅ Message and clear after import
- If change a word, don't save. move to another, the changed data sticks in the field
- Words list does not update after an import
- Change of item state when click on phone is slow
- ✅ Typing in text box is slowing as word list grows - too much rendering?

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
- ✅ Menu
- ✅ Tabs in CSV
- Confirmation and error messages
- Navigation
- TextMatch function that uses value, converts number to string, checks all fields of object/array recursively
- Lower function that uses value, accepts numbers
- Empty message in List
- Scroll to item in list (auto on select and/or in action)
- Date entry
- Get current page
- Styling/Highlight button

Revision conditions
-------------------

- Taking the latest revision date on or before the current date, the last revision is not successful and on or after the revision date  

Learning UI improvements
------------------------

- ✅ Three states: ready (initial), learning, learned
- ✅ Show words that are ready, learning or learned on the current day
- ✅ Can move between any of the states
- ✅ Three close spaced icons to switch state 
- ✅ Icon for current state highlighted
- ✅ Save the state in the database
- ✅ Whole row highlighted for words in the learning state
- ✅ List is not selectable
- ✅ Translations of words in the learning state are hidden by default
- ✅ Can show a translation in the learning state by clicking a button in the space (ideally just while button clicked)
- ✅ Words and translation wrap under each other

