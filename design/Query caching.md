Query caching
=============

Aims
----

- Developers can use queries without detailed configuration
- Apps perform well
- Data access costs are kept low

Needs
-----

- Can cache query results locally
- Can update an item in a query and see the effect locally without refreshing the query from the database
- Query results are maintained as closely as possible during updates and refreshes - no wiping all results
- Refresh action on a Collection
- Updating indicator on Collection

Forces
------

- Queries deliberately kept simple so cross-DB, so can reproduce locally
- Most of the time, an update only needs to be seen in queries immediately by the user who does it



Possibilities
-------------


- On Update, apply update to all cached queries
- When add or update an item, decide whether it should be in or out of any cached queries
- Keep updates in the item cache, even if not previously there
- Apply all item cache state to query results
- Move query results to item cache and just keep ids in query

Decision - 16 Aug 22
--------

- Use the simplest option for now
- Improve subscription updates to have items added, updated, deleted, rather than Invalidate All queries
- If have data store, apply updates via subscriptions
- Keep direct updates of local cache to avoid latency and flashing of old values
- Apply updates to items query caches as well as item cache
- Remove deleted items from query caches
- For added and updated items, apply the query criteria to it
- If a changed item is now in a query, add it
- If a changed item is not in a query, remove it


Part 2 - Refreshing cached data
===============================

Aims
-----

- End users should see up to date data when they expect to
- Developers should have control but not need to do too much to ensure this

Needs
-----

- Refresh everything OR individual call results
- Consistent way of doing the refresh
- Refresh could be done after an update in an action formula
- Refresh might be under user control

Forces
------

- Automatic caching of remote/expensive calls is necessary for functional apps
- The idea of refreshing a web page is fairly familiar
- Different places where refresh needed: Collections, Server App Connectors
- Refreshing one item in a Query result

Possibilities
-------------

- General Refresh function
- Refresh methods on appropriate objects
- Varying numbers of arguments to refresh all or part

Decision - 12 Oct 22
--------------------

- Collections have a Refresh method
- Collection refresh can have no arguments for all cached data, an id for one item, or 'Queries' to refresh just queries
- Leave the problem of refreshing one item in a query result for now
- Server App Connectors have a Refresh method
- It can have no arguments to refresh all data, a function name to clear data for one function, or a function name and arguments to clear one result
- May implement only the refresh all method to start