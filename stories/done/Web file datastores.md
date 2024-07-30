Web file datastores
===================

Aim
---

- Efficient and simple read-only datastore for web clients
- Can evolve to personal or shared updatable cloud datastore

Requirements
------------

- ✅ Client can read data
- ✅ All data downloaded in one request
- ✅ Data can be retrieved from any URL
- ✅ Multiple collections
- ✅ External systems can update data without redeploy

Further requirements
--------------------

- Server app can update data

Technical
---------

- JSON structure: map of arrays of objects with ids
- Store in Google Cloud with public read permissions

