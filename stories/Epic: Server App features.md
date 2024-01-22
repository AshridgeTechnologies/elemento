Epic: Server App features
=========================

Aims
----

- Improve various client and server app features
- Remove sticking points in developing server apps
- Remove poor UX problems in using server apps

Requirements
------------

- ✅ Collection's Collection Name defaults to model object formula name
- ✅ Can use Current User in Server App functions
- ✅ Decode ISO dates in JSON into JS Dates
- ✅ Store JS Dates in Firestore as Timestamps
- ✅ Record manipulation functions - Merge, Pick
- ✅ Better record construction
- ✅ Check function
- ✅ Comparison functions work with dates and strings
- ✅ CurrentUser() is allowed in server app functions
- ✅ CurrentUser has Id property from uid
- Editor Service Worker keeps losing the preview server
- ✅ Server App Caching changes
- ✅ Form behaviour changes
- Page authorization and error handling and logout action
- Refresh data when auth changes - either log in or out, don't show errors while waiting
- Sort out id vs Id
- ✅ Components whose value is an object do not expose sub-props on top-level - very confusing
- ✅ Confusing how to access form values, such as data given to form, within the form
- ✅ How to use form values if not in fields - Calculation, Data
- ✅ Auto form reset after submit action
- Don't cache error results from Server Apps - or only for a short time
- ✅ Read only Date component is not read only
- Pending value should show loading spinner
- Better argument type checking on runtime functions eg Update
- Server Error management on client - expected/unexpected, link to fields
- User management - creation, approval, permissions
- GetOrCreate, UpdateOrCreate functions - good idea?
- Intermediate values in actions, including from async functions
- Separate validation conditions for Server App functions - can be used in docs, return better error codes, catch all errors together
- DataType validation for function inputs
- Function input validation against other function inputs
- DataType validation for Collections on Add and Update
- Validation using queries eg to check no two holiday bookings overlap
- Document ShowPage and CurrentUrl, check other App functions
- Find Data Store collection names from Project - or document
- Enable Firestore in setup - or document
- Check Server App functions only called from app unless marked as API? How?
- Investigate why and fix: This project is set up to use Cloud Firestore in Datastore mode.
- Find a better way of setting permissions
- Find a way round this: https://cloud.google.com/identity-platform/docs/admin/email-enumeration-protection#disable


