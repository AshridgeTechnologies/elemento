Google Sign In
==============

Shelved because
---------------
- It's complicated
- It doesn't buy you much, as anything interesting in Google APIs needs approval, which would be unlikely for Elemento as a whole

Aims
----

- App users can log on to authenticate themselves 
- Google services other than Firebase can use the authentication
- Devs can use the logon state in formulas


Requirements
------------

- Google Sign In control
- Shows standard Google controls before and after sign in
- Click initiates Google authentication procedure
- Can see logged on name and Logout
- Google services that need auth can use it
- Firebase services that need auth can use it
- CurrentUser() function is available throughout the app => User or null
- User has Name property

Desirable
---------

- App has Login and Logout functions available

