Tutorial and general improvements
=================================

Aims
----

- Make developer experience easier
- Fix small bugs
- Add small necessary features

Requirements
------------

- App blows up on invalid code far too often
- ✅ Random gives 0 when want minimum 1
- ✅ Range function
- ✅ Uppercase function
- List manipulation - Join, Unique, Sort, Without, Contains, Append, Count✅ 
- Intuitive way of joining lists and keeping unique
- ✅ Can use collections as lists - just use GetAll()
- ✅ RandomFrom(list/collection)
- ✅ RandomListFrom(list/collection, count)
- ✅ Shuffle
- ✅ Split function on string
- ✅ Contains on string checks for match
- ✅ Can Reset a collection
- ✅ List items cannot refer to things in page - parentPath is incorrect if ends in #0
- Treat Collection as a List if passed to a function that expects a list
- Good way to compare collections eg to decide if won - eg ContainsItems(list, otherItems | item, item...)
- Need to scroll list up or to position
- Way to specify parameter names in inline functions
- Functions can be created at app level but cannot be referenced in Pages, and Page errors while trying to get state for them
- Max length on Text Input
- Need styles on all elements
- Newline to split on lines

Blow ups
--------

- ✅ boolean true is not a function - because Count not generated with function argument
