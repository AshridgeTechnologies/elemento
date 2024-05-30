App context propagation
=======================

30 May 2024

Aims
----

- Rationalise the parallel passing down of resource url and browser history
- Allow use of file urls in formulas eg for background image

Needs
-----

- Enable a FileUrl() function to turn respurce file name into non-relative url (as css relative paths are confusing)
- Keep code simple
- Keep tests simple
- Keep React out of state classes

Forces
------

- AppContext and AppUtils created in similar places
- AppContext passed down as property, only used in App state class
- AppUtils (resourceUrl) passed as a context, use in Image, now Frame, needed for FileUrl function
- AppContext saved in a global cache - in some cases
- App state stores a subscription to the AppContext's url change to force it's own state change
- Having it as prop makes it easier to test App
- 

From previous design decision - Image src URL adjustments
-------------------------

- Problem: To allow use of simple asset names, need to adjust for path to app root eg when run from GitHub
- Decision: place AppContext in a context provider in AppRunner, reference in Image to get adjusted URL
- Reasons:
    - avoid generating deployment-specific code
    - avoid prop passing
    - keep knowledge of path prefix in one place

Possibilities
-------------

- Pass AppContext down in a React context, generated app gets it from there to pass to App State

Spike 1
-------

- Change AppContext to be created in AppRunner and passed down in React context
- Then combine with Resource Url
- Then give AppData a FileUrl() function and test
