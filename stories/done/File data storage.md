File data storage
=================

Aims
----

- A user can keep data used by the app in a disk file that acts like a mini-database

Requirements
------------

- ✅ File data store control
- ✅ Can insert under App
- ✅ Not visible on page
- ✅ Open(data store) function - displays file picker
- ~~Automatically asks to open file when first needed~~
- ✅ New(data store) function
- ✅ Collection has a data store property that can be set to a data store
- ✅ Collections can be under the app
- ✅ Collections automatically load and save from the data store
- ✅ Data store can contain data from multiple collections
- ✅ Saves data as single JSON object, collections under top level

Future needs
------------

- Compatible with other types of store - Google Sheet, database
- Collections hava a consistent interface to a data store

Issues
------

- How the Initial values property of Collection fits with a backing data store
- How to deal with inconsistent data files eg not having collections expected or not even being data