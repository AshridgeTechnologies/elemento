Server app deployment and authorization
=======================================

09 Dec 2023

Aims
----

- Clearer UX for setting up Firebase and authorizing with Google
- Make passing Google app verification easier
- Simplify interactions between studio and Firebase Deploy tool
- Make alternative deploy plugins possible/easier

Needs
-----

- One place to authorize with Google
- OR each place acts on a shared authorization
- Clear warning and fix if preview server not available
- Errors on calls from app to preview server handled clearly and cleanly
- Clear prompt and explanation for authorize with Google
- Authorize with Google not shown if not needed eg client only app, different deployment
- Use server side token checking
- Have an easy route to alternative deployment mechanisms and/or preview servers

Forces
------

- Need to set up Firebase project generally as well as authorize to work with server apps
- May want a Firebase project to deploy a client-only app
- Want to handle errors cleanly in app anyway
- Need a clear/better error handling and warning mechanism for Studio
- Google recommends getting a code on the client and exchanging for an access token on the server
- BUT this requires a client secret available on the server, and server cannot be tested except from a browser

Preview-specific forces
-----------------------

- Google authorization in Studio is only needed for preview
- Cloud storage scope is only needed for preview
- If Google auth not needed in studio, only in FB deploy tool, would simplify UX and make app verification easier
- Preview server is being regularly updated anyway, so a persistent cache is less necessary
- Storing preview cache with deploy cache complicates code
- A shared password would be about as effective and secure as a Google login
- A shared password would give possibility of another browser accessing the preview
- Shared password is slightly more trouble to set up when installing the extension

Possibilities
-------------

- Studio sends preview updates via Firebase deploy tool window (so not via service worker)
- Google auth only in Firebase deploy tool
- Firebase deploy tool opened auto and cannot be closed if have Server App in project
- Dummy result for errors returned from server
- Ping on server preview
- Use shared password for preview server update and also calling functions
- Hold preview apps only in local files
- Return special error if app not found, studio sends updates, retries
- Preview cache has separate root to deploy cache so can wipe completely

Decisions
---------

- Use password in extension config for preview authorization
- Keep current mechanism for caching preview in storage, but use firebase-admin to access
- Different root for preview cache, simplify clear cache mechanism
- Remove Google Login from Studio
- Return error object from failed calls that does not blow up React
- Report preview errors due to auth or unavailability to Studio errors
- Nice to have: Add password to get calls in service worker
- **Do not** use server-side token checking in admin server, as:
  - it is more complex to implement
  - it is difficult to test
  - offline access and automatic refresh are not needed
  - it is not clear what the extra security advantages are
