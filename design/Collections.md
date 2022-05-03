Collections
===========

Needs
-----

- Hold lists - ordered collections referenced by index
- Hold maps - collections referenced by key
- Hold sets - collections of simple or comparable values
- Use an item id as a key automatically where necessary or useful
- Make the collections and their purpose easy to understand
- Make dealing with both types the same where possible
- Make the differences obvious and easy to understand
- Allow collections to act as persistent collections without any change


Forces
------

- Top-level persistent collections have to be unordered and use an embedded key
- Persistent collections can be difficult to give a natural order
- In-memory maps can easily keep insertion order, but not necessarily sortable 
- Query, Sort, Add can be the same for all collections
- Uses of maps without an embedded key are rare and could be left for later
- Get, Remove, Update, Set can be index or id
- Insert(at), Move can only apply to List
- Indexes and keys are very similar


Possibilities
-------------

- One sort of Collection, different characteristics
- Collection and List, maybe Map in the future
- Only Collection can be persistent
- Use the same functions with index or id where appropriate


Initial decision 4 May 22
-------------------------

- Start with Collection only
- Start with in-memory only, but consider future persistence
- Items can be simple values or objects
- If items have an Id or id property, that is used as the id
- If an item is a simple value, the value is used as the id
- If an item is an object without an id property, a unique id is generated
- Initial values can come from an array or an object
- Add(collection, item)
- Get(collection, id)
- GetAll(collection)
- Remove(collection, id)
- Update(collection, id, changes) - not allowed on simple value
- Future functions: GetWhere, Sort, AddWithId(collection, item, id)