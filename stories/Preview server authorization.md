Preview server authorization
============================

Aims
----

- Simplify use of Google authorization
- Improve handling of errors in server app preview


Requirements
------------

- ✅ Use password in extension config for preview authorization
- ✅ Firebase deploy tool sets password in settings
- ✅ Studio sends the password to preview server
- ✅ Keep current mechanism for caching preview in storage, but use firebase-admin to access
- ✅ Different root for preview cache, simplify clear cache mechanism
- ✅ Remove Google Login from Studio
- Return error object from failed calls that does not blow up React
- Report preview errors due to auth or unavailability to Studio errors
- Nice to have: Add password to get calls in service worker
- Nice to have: Use server-side token checking in admin server