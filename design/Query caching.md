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