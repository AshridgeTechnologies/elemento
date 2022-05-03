Collections
===========

Aims
----

- Users can create applications that deal with collections of items

Requirements
------------

- ✅ Collection component
- ✅ Initial values from array
- ✅ If items have an Id or id property, that is used as the id
- ✅ If an item is a simple value, the value is used as the id
- ✅ If an item is an object without an id property, a unique id is generated
- ✅ Initial values from object - use the keys and values
- ✅ Property value is a map of ids to items
- ✅ Action function Add(collection, item) => add item with same id rules as initial values
- ✅ Action function Remove(collection, id) => remove item with id
- ✅ Action function Update(collection, id, changes) => merge changes, cannot change id
- ✅ Function Get(collection, id)  => one item value
- ✅ Function GetAll(collection) => all item values

