Data and storage - programmer view
----------------------------------

Needs
-----

- Storing data is simple and intuitive
- Single instance for simple vars and objects treated as a unit, like documents
- Collections where need to get and use individual objects
- Single instance have set and partial update
- Collections have lookup, query, add, update
- In-memory and persistent stores are consistent
- Single instance and collections can both be in-memory or persistent
- Groups of collections (ie a database) can share a persistent store
- Variety of persistent stores supported
- Persistent stores for single instance and collections will have different characteristics eg blob vs DB
- Persistent stores can be swapped easily - maybe even at runtime
- Delays and errors in obtaining data must be available to the app to show in the UI
- Where stores can provide live updates, the app responds to these
- It must be easy to debug the state of stored data while the app is running

Forces
------

- Persistent stores for single instance are like blob stores
- Persistent stores for collections are like databases
- Need for simplicity and consistency
- Some data stores do not support all operations easily
- Queries are done differently by different data stores
- Configuration is different for different data stores
- Some data stores require authorization

Provisional decision - 4 Mar 22
-------------------------------

- Data control for single instance
- Collection control for collections
- Both are in-memory by default
- Both can be changed to persistent by connecting them to a persistent store
- Persistent stores are components - different for each implementation
- Each type of persistent store component has its own properties for configuration
- Authorization may need another component
- Could have a Persistent store manager component that can switch between implementations