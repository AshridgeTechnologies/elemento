Server App Result Caching
=========================

18 Jan 22

Aims
----

- Simplify development
- Reduce the number of times out of date data is shown to the user

Needs
-----

- Results of Server App query functions are updated automatically whenever necessary
- Server App query functions are not called more than they need to be
- Manual refresh is still possible to allow for changes by other users 
- Server App query functions are not called until all local update functions have completed

Forces
------

- Hard for developers to know or to remember to call Refresh on the correct functions after updates
- Refreshing everything after every update may be expensive
- Refresh cheaper if just remove cached result so that it is called when next needed
- With stateless architecture on server side, server side result caching unlikely to be useful
- With eventual consistency, it is possible that refreshing after update will still not get correct data
- Usually only one update function called/in progress at any one time

Possibilities
-------------

- Auto refresh all results after an update
- Keep old cached result until replaced
- Option to turn off auto-refresh either for whole app or individual functions
- Option to specify which functions should be refreshed after an update

Decision
--------

- Start with auto refresh of all query results after ~~all updates have completed~~ each update completes usually only one in progress
- ~~Server App Connector tracks updates in progress and waits for all~~
- Keep manual refresh
