Collections and Data Stores
===========================

Needs
-----

- Collections can have a backing data store
- Default is a simple in-memory store
- Many different types of data store are possible
- Implementations must be able to be added easily
- Must be possible to receive updates from the data store
- The UI must update auto for any change in the data store
- NTH: Switchable data stores

Forces
------

- Keeping the Zustand state correct
- Catering for multiple types of store
- Data sizes too big to keep locally - memory size or bandwidth
- Data stores usually async
- Caching is needed somewhere - for individual objects and queries
- Updates from the server need to update the app state
- Avoid multiple copies of data
- Avoid copying lareg amounts of data
- Projections
- Selections
- Knowing whether a projection is a full object
- Updating full objects from queries - like Apollo
- Error handling
- Refresh


Possibilities
-------------

- Collection is the cache
- Data store just needs to get and update, maybe subscribe to updates
- Subscribe and update the collection cache
- Copy data into app store when received - share as much as poss
- Partial projection queries also go into the store
- Queries have a cache of parameters, id list and projection
- Recreate the query results from the projection each time used
- Have different levels of query invalidation - result set and individual object data

Initial design 13 May 22
--------------------------

- Start with basic in-memory data store
- Return promises for all ops

### Collection implementation


#### Get method
- If data in cache, return it
- If placeholder in cache, return it
- Else request data, put placeholder in cache
- Request result updates the cache

#### Query
- Collection has a cache of queries, "keyed" by the criteria objects
- If query in cache with same criteria, use it
- If placeholder, return it
- Else request data, put placeholder in cache
- On request result, store the ids as the query result, use the objects to update the object cache
- On Add, invalidate all queries
- On Remove, invalidate all queries
- On Update, invalidate all queries 
- Later: On Update, invalidate if criteria uses a property that has changed

#### Update
- Apply update to the object cache
- Request update on server
- Updated data will be sent via subscribe channels
- Mark some or all queries as invalid

#### Add
- As Update

#### Remove
- As Update
- May be different approach to marking queries as invalid

#### Errors
- Store error placeholder in cache
- May auto retry after interval
- May leave until refresh

#### Refresh
- Update the cache to have a refresh placeholder
- On Get, request data as if not there

#### Subscribe
- Request updates for a collection
- Return an observable
- Updates are an object with ids as keys, changes as values OR Invalidate All


Update 27 May 22
----------------

### Using in-memory backing store for all Collections

#### Yes
- Will simplify code in Collection functions
- Query code only needs to be in the in-memory store

#### No
- Will complicate code in setting up the in memory data store and keeping it in state
- Query code will be easily shared between Collection and MemoryDataStore as a filter predicate generator

#### Decision at this point: NO

