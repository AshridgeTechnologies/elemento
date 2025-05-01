Cloudflare authentication
=========================

Aims
----

- Provide a user authentication solution for Elemento on Cloudflare

Requirements
------------

- ✅ Free or nearly free
- ✅ Low risk of hacking
- ✅ User logon component continues to work in a similar way
- ✅ Auth dialogs appear in a popup or iframe without leaving the current app page
- ✅ Current User continues to work
- ✅ Password (and other?) users are saved to permanent store
- ✅ Permanent store can be configured in project
- Remove Firebase auth

Later
-----
- Use upcoming openauth fix to allow basepath



Technical
---------

- ✅ Refactor test project to an auth manager class
- ✅ Send the password auth to a popup window
- ✅ Try out Google auth
- ✅ Move message listening to AuthManager
- ✅ Use Broadcast listener to update status
- ✅ Check where parts of init() are used
- ✅ Get auth calls under single root path of /_auth
- ✅ Work out how to deal with the user call
- ✅ Produce a cloudflare version of the authentication module
- ✅ Move App code to a UserLogin component
- Work out how to send codes by email
