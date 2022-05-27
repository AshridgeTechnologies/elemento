Queries in Collections
======================

Aims
----

- Users can define queries that automatically update as data changes
- Queries are cached and efficient

Requirements
------------

- ✅ Collection has a cache of queries, "keyed" by the criteria objects
- ✅ If query in cache with same criteria, use it
- ✅ If placeholder, return it
- ✅ Else request data, put placeholder in cache
- ✅ On Add, invalidate all queries
- ✅ On Remove, invalidate all queries
- ✅ On Update, invalidate all queries

Later requirements
------------------
- On Update, invalidate if criteria uses a property that has changed
- On request result, store the ids as the query result, use the objects to update the object cache


Technical 
---------

See Collections and Data Stores design doc
