ExpressUtils
============

12 Jan 2024


Aims
----

- Avoid duplication of expressUtils in elemento and elemento-app-server

Needs
-----

- Don't have two nearly-identical files so don't change wrong one to fix a bug (!)
- Maintain flexibility to easily deploy generated code in another environment

Forces
------

- There are slightly different but still very similar versions of expressUtils.ts in elemento serverRuntime and elemento-app-server
- The generated server app has a static import of expressApp from ./serverRuntime.cjs
- In elemento-app-server, all three cloud functions import errorHandler and logCall
- Also, previewServer and appServer import requestHandler and its param type AppFactory
- expressApp and requestHandler are the top-level functions in expressUtils
- ~~serverRuntime is used as a dynamic import in appServer and previewServer~~
- serverRuntime is used as a static import within a dynamic import of the generated code
- serverRuntime already exports some expressUtils functions
- but express stuff is a different area of responsibility to other server runtime functions
- expressUtils code would be useful to other hosting implementations
- Updating serverRuntime is much easier than updating the extension
- But would be good to update the extension code dynamically in the future
- And want to publish the elemento runtimes as npm modules in the future
- Note: elemento-app-server tests currently expect to get server runtime from elemento project dev server

Possibilities
-------------

- One version of expressUtils in elemento
- One version of expressUtils in elemento-app-server
- Export expressUtils from serverRuntime
- Dynamic import of serverRuntime at suitable point in appServer and previewServer
- Maybe keep logCall and errorHandler local to each project

Spike 1
-------

- Merge elemento-app-server expressUtils changes back into elemento
- Export everything needed from serverRuntime
- Import serverRuntime dynamically
- Result: quickly started to look quite complicated

Decision
--------

- Tactical retreat - keep two identical copies of expressUtils
- Backlog item to sort the situation out
