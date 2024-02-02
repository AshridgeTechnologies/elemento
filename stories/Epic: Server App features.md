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
- ✅ Server App Caching changes
- ✅ Form behaviour changes
- ✅ Page authorization and error handling and logout action
- ✅ Refresh data when auth changes - either log in or out, don't show errors while waiting
- ✅ Components whose value is an object do not expose sub-props on top-level - very confusing
- ✅ Confusing how to access form values, such as data given to form, within the form
- ✅ How to use form values if not in fields - Calculation, Data
- ✅ Auto form reset after submit action
- ✅ Read only Date component is not read only
- ✅ User management - creation, approval, permissions
- ✅ Intermediate values in actions, including from async functions
- ❓ - Server FirestoreDataImpl chokes on nulls in convertValue
- ✅ Create User: Credential implementation provided to initializeApp() via the "credential" property has insufficient permission to access the requested resource
- ❓ - Data functions has Query, not GetAll
- Editor Service Worker keeps losing the preview server - Activates again and creates new ESW
- Preview page can be reloaded even with a page name
- Errors from server while editing formula really interrupting eg below
- ❓ - Should be able to write If(CurrentUser(), Get(Users, CurrentUser().Id), null) - server runtime up to date?
- Sort out id vs Id
- Better argument type checking on runtime functions eg Update
- Description/Comments on every model object
- Change User management to object, because can't have function called CreateUser
- Pending value should show loading spinner
- DataTypes folder can't be called DataTypes
- Ensure go to Home Page after log out
- GetOwnUser error when logout - either don't call or make safe
- Editor Service worker not always loaded correctly the first time
- No caching on Server get functions if many requested together
- Very chatty if get joined entities on client eg Booking - User
- Refreshing Bookings also refreshes Users - limited refresh on wildcard?
- Intermediate vars in client side calculation formulas
- Don't cache error results from Server Apps - or only for a short time
- Logged in as is often missing the name
- Generally - prevent component names being any system name
- Password field with a show button
- GetOrCreate, UpdateOrCreate functions - good idea?
- Document ShowPage and CurrentUrl, check other App functions
- Find Data Store collection names from Project - or document
- Enable Firestore in setup - or document
- Check Server App functions only called from app unless marked as API? How?
- Investigate why and fix: This project is set up to use Cloud Firestore in Datastore mode.
- Find a better way of setting permissions
- Find a way round this: https://cloud.google.com/identity-platform/docs/admin/email-enumeration-protection#disable
- How do you get the GitHub URL to deploy?


