User Logon
==========

Aims
----

- App users can log on to authenticate themselves 
- Services can use the authentication
- Devs can use the logon state in formulas


Requirements
------------

- ✅ User Logon control
- ✅ Shows Login button if not logged on
- ✅ Click initiates Google authentication procedure
- ✅ Shows user icon when logged on
- ✅ Click shows logged on name and Logout
- ✅ Services that need auth can use it
- ✅ CurrentUser() function is available throughout the app => User or null
- ✅ User has Name property

Desirable
---------

- App has Login and Logout functions available

Implementation
--------------

- ✅ Refactor all element classes to have static iconClass
- ✅ Try to remove separate constructors
- ✅ Refactor createElement
