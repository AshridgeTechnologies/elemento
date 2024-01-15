Firestore security rules
========================

15 Jan 2024

Aims
----

- Developers can easily set Firestore security rules for access from clients
- This will avoid the need for Server Apps in some cases

Needs
-----

- Can set Firestore security rules for an app running from GitHub, so without deploy to hosting
- Separate read and write permissions on each collection
- Different permissions for different user types
- Write permissions at field level
- Defined in model by rules
- Rules not tied specifically to Firestore

Forces
------

- Firestore rules could be generated from rules, but it would be complex
- Developer would have to learn another rules language
- Can't prevent reading certain fields
- Can't validate data values or complex rules
- Reading or updating a selection of fields is easy with server apps
- Only need to have one requirement that security rules can't do, and you need a server app
- Very product-specific
- Only saves some dev time and running cost in a few cases - doesn't make anything new possible

Decision
--------

- Don't proceed at the moment
