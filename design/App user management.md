App user management
===================

11 Jan 24

Aims
----

- Developers can build authentication and authorization into their apps
- Data can be linked to user accounts
- App users find creating accounts and logging on easy

Needs
-----

- Can control how user accounts are created - self-service or by admin
- Self-service accounts may need to be approved by an admin
- Way of creating admin users outside the app
- Link data to a user account
- User data items may have different permissions - user or admin
- Authorize server app functions based on user data (eg role or permissions)
- Authorize things or change UI on client side based on user data
- Authorize page display on client based on user data



Forces
------

- Use a robust logon solution - don't want to hold user credentials or code logon screens in Elemento or the app itself
- Firebase authorization is a strong contender for logon
- Some user management things may be common BUT don't know which they are yet and need to keep flexibility
- Inconvenient for developer to get CurrentUser() and then Get(Users, CurrentUser().Id)
- But Users collection may not always exist
