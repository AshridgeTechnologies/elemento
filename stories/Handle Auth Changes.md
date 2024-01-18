Handle Auth Changes
===================

Aims
----

- Simplify development where need to cater for logged in/not
- Smooth user experienced when logging in and logging out
- Implement decision in Authorization change handling design doc

Requirements
------------

- Add Not Logged In Page property to Page
- Display alternative if not logged in
- Redisplay any page when login state changes
- Create a RefreshAllData function - clears all Server App Connector and Collection caches
- Call RefreshAllData when login state changes

Technical
---------

- Need a way of detecting login changes - just useSignedInState?
- Look at doing NotLoggedIn Page in Page component, not generated code
- Need a way to find and/or notify all Collections and ServerAppConnectors in RefreshAllData
- Need a place to put an onAuthChange event handler to call RefreshAllData
Try:
- AppData (state for App) has a RefreshAllData function
- AppData subscribes to auth change in same way as it does to url change
- On auth change, AppData does two things - RefreshAllData and ui refresh
To get all Collections and ServerAppConnectors:
- AppState can find them
- You can get AppState, or a visitor function, in a context where there is an app state - so in AppData init?
