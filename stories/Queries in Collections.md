Queries in Collections
======================

Aims
----

- Users can define queries that automatically update as data changes
- Queries are cached and efficient

Requirements
------------

- Query function on Collection, takes a record of property names and values
- Query logic is done by the backing data store
- Queries to the backing store are only done when needed
- Pending queries return the placeholder
- Objects in query results update automatically if the underlying object changes
- Query result sets update automatically as the objects in them change
- Queries work in the same way for collections without a backing datastore


Technical 
---------

See Collections and Data Stores design doc
