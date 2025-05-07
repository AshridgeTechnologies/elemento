Cloudflare Datastore
====================

Aims
----

- Provide a persistent datastore to Elemento standards in Cloudflare

Requirements
------------

- ✅ Conforms to interface expected by Elemento Collections
- Can set configuration required by Cloudflare Worker
- ✅ Allows free-form data like Firestore
- ✅ Works on server side only
- ✅ Stores dates as ISO string, converts ISO string to Date on read
- ✅ Stores and retrieves BigDecimals
- ✅ Stores and retrieves nulls

Further requirements
--------------------

- Works from client side via REST API with suitable authorization

Technical
---------

- Implement on D1
- Use a JSON data column
- Check and create tables and columns when start
