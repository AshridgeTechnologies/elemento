Persistent Data values
======================

Aims
----

- Simple way for developers to make Data values persistent and synchronized

Requirements
------------

- Data element can be linked to a Data Store
- Data elements can still be memory only if not linked to a Data Store
- Changes are automatically saved to the Data Store
- Values are automatically loaded from the Data Store 
- If the value in the Data Store changes, the Data element value is automatically updated
- If the data value is not found in the data store, the initial value is used and saved to the data store
- Data value is Pending until retrieved from Data Store
- Data elements with the same name on different pages are stored separately

Technical
---------

- Collection called _dataValues in each Data Store
- Each record has id and json_data
- Use the full element path as the id
