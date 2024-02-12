Tutorial and general improvements - Part 1
==========================================

Aims
----

- Make developer experience easier
- Fix small bugs
- Add small necessary features

Requirements
------------

- App blows up on invalid code far too often
- App blows up on any runtime exception with no indication of where or what is wrong
- Clear warnings from errors in args to Elemento functions
- Way of reporting which component and which property the error is in, and where in the expression
- ✅ Random gives 0 when want minimum 1
- ✅ Range function
- ✅ Uppercase function
- List manipulation - **Join**, Unique, Without, Contains, Append, Count✅ 
- Intuitive way of joining lists and keeping unique
- ✅ Can use collections as lists - just use GetAll()
- ✅ RandomFrom(list/collection)
- ✅ RandomListFrom(list/collection, count)
- ✅ Shuffle
- ✅ Split function on string
- ✅ Contains on string checks for match
- ✅ Can Reset a collection
- ✅ List items cannot refer to things in page - parentPath is incorrect if ends in #0
- ✅ Generates a function $item => null when function arg not supplied
- Need to ensure service worker loads when trying for first time
- Click Name in Getting Started selects many items
- Blows up when a null is supplied to HasSameItems
- Treat Collection as a List if passed to a function that expects a list
- Need to scroll list up or to position
- Way to specify parameter names in expression arguments
- Functions can be created at app level but cannot be referenced in Pages, and Page errors while trying to get state for them
- Max length on Text Input
- Need styles on all elements
- Newline to split on lines

Tutorial improvements
---------------------
- Page index for app
- Fixed app components top, bottom, left, right - for nav or whatever
- ShowPage(following|before|first)
- Show previews for each app in separate tabs
- Lock an app to avoid changes

Blow ups
--------

- ✅ boolean true is not a function - because Count not generated with function argument
