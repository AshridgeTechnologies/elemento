Data Stores UI interactions
===========================

Aims
----

- Users can control and use the status of app level data stores throughout the app

Background
----------

- See previous decision on App level data sharing

Needs
-----

- Data store status is available anywhere to show or control other components
- Data store status will vary according to the store
- Data store status may include open/closed, filename, database name, saved/saving, etc
- Data store status must update like any other app state
- Some data stores will need to be opened or connected explicitly
- Some will need UI interaction eg file store, others depend on settings

Forces
------

- App-level UI eg a header bar may be useful at some stage
- Keep it easy to implement the DataStore interface - minimum responsibilities
- Various things _might_ be used later eg on load actions, observable data, but they also may be YAGNI
- File data store could be used in various ways for different kinds of app, loading and saving at different times
- File data store is just a first step - database more useful
- But file data store useful in many ways as it could represent a document
- May have multiple file data stores at once, below app level, and create/destroy them dynamically eg in tabbed documents
- Being able to work with a new empty db as well as existing data is important
- Opening different files means data will change underneath controls, so need data subscribe to update app state
- Don't want two components to create a data store - hard for user

Possibilities
-------------
- Data stores could open or connect when first used
- General "on load" actions for app and pages could be useful
- Could have auto open for store when first needed
- Stateful UI controllers for backgroundFixed objects
- Stateful controllers have a DataStore as their own React state
- Stateful controllers have a DataStore as their app state

Spike 1 - 23 May 22
-------------------

- Avoid the need for controlling the store by automatically opening when needed
- Outcome: could work for opening when add first object and saving auto after that, but no way to load existing data

Spike 2 - 24 May 22
-------------------

- Stateful UI component with a DataStore in app state
- Move FDS to FDSImpl
- Move FDS back to stateful UI version
- Add FileDataStoreImpl to properties of FileDataStore
- Init in Generator to start
- Delegate all FDS.State methods to the FDSImpl
- Try to let state objects add their own properties
- Look for solution to the 'only set on startup' problem
- Outcome: With this combination, can open a data file and update it as expected.  
- Startup state: Added an 'init()' hook called on state objects if it exists, and use it to return an update with the initial Data Store



