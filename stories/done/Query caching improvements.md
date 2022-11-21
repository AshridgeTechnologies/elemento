Query caching improvements
==========================

Aims
----

- Better performance
- Lower costs
- Smoother user experience
- A generally better world...

Requirements
------------

(From design note on Query caching)
 
- ✅ Subscription updates send the actual changes
- ✅ If Collection has data store, apply updates from subscriptions
- ✅ Apply updates to items in query caches as well as item cache
- ✅ Remove deleted items from query caches
- ✅ For added and updated items, apply the query criteria to it
- ✅ If a changed item is now in a query, add it
- ✅ If a changed item is not in a query, remove it