Validation improvements
=======================

1 Feb 24

Aims
----

- Easier and more effective validation for developers
- Better experience for users

Needs
-----

- DataType validation for function inputs
- DataType validation for Collections on Add and Update
- Validation using queries eg to check no two holiday bookings overlap
- Validation using other values in record - eg minimum is value of another field, like start/finish date
- Function input validation against other function inputs
- Separate validation conditions for Server App functions - can be used in docs, return better error codes, catch all errors together
- Server Error management on client - expected/unexpected, link to fields

Forces
------

- A declarative definition of data is always going to be easier than checking inputs etc
- BUT trying to calculate, on the client, what data will be like on the server after an update is very difficult
- Data types formulas need to work in both built-in rules (eg max, min) and ad-hoc rules
- Authorisation checks are a different aspect to data validation
- Some rules can only be checked server side - but they are rare eg overlap between holiday bookings
- Declarative rules on data at rest cover many of the things input validation used for
- But may also have additional function input rules that cannot be expressed as data state rules
- Creating an "as updated" copy of a record is more expensive and slower as need to read first
- Checks on server functions may want to use intermediate values
- Some intermediate values may only be available if data supplied is correct
- Server function validation also needs to cope with usage in API where may get any crazy inputs


Possibilities
-------------

- Treat all of a functions inputs as a record
- Supply record to all validation calculations
- Supply null OR empty object OR null-safe proxy if not in a record
- Collection-level rules
- Supply collection to record-level rules
- Mark rules as record-level or collection-level
- Detect whether a rule needs record or collection and only test the rule if we have parent record or collection available
- Create an updated record and apply rules to it
- Only create an "as updated" copy if a rule requires it
- Have separate 
