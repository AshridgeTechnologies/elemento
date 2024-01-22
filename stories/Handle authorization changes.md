Handle authorization changes
============================

Aims
----

- Simplify development handling of logged in and logged out users
- Ensure data not left on screen or in memory when log out
- Avoid errors while persistent logins are checked


Requirements
------------

- ✅ Add Not Logged In Page property to Page
- ✅ Display alternative page if not logged in
- ✅ Redisplay app when login state changes
- ✅ Clear all Server App Connector and Collection caches when auth state changes
- ✅ Fix popover position in UserLogon


Technical
---------

- Subscribe to onAuthChange in init and store in state, in both Collection and Server App Connector
- ~~Ensure isSignedIn hook works~~
- ~~Ensure notLoggedInPage is generated into props~~
- Ensure using correct useSignedInState
- Do _not_ put notLoggedInPage into props
- ~~Generate a line in Page code to call useSignedInState and return not logged in page if false~~
  - doesn't work because call different hooks on different renders
- Undo changes to Page component
- Generate line in Page code to add notLoggedInPage name to Page component
- Check logged in state in App and display alternative
- Change authentication to export individual functions like firebaseApp
- useSignedInState appears to be incorrect on first load and after logout
