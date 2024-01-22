Authorization change handling
=============================

Aims
----

- Simplify development handling of logged in and logged out users
- Ensure data not left on screen or in memory when log out
- Avoid errors while persistent logins are checked

Needs
-----

- Do not call Server App functions that require a current user while not logged in
- Update results of Server App Functions when log in
- Clear results of Server App Functions when log out
- Hide/Show certain elements depending on whether logged in
- Don't show certain options, including page links, if not logged in
- Prevent showing some pages via deep link if not logged in
- Simple consistent mechanism to show alternative page(s)/content to not logged-in users looking for a page eg a 'please log in' message
- Show desired content automatically when user logs in
- Some pages can be shown whether logged in or not

Forces
------

- If a Page needs login, not usually much to show if not logged in, and tends to be all the same
- Will introduce App-wide components at some stage, being able to have a common Not Logged In component would be good

Possibilities
-------------

- Use CurrentUser in Display prop of any element to show/hide stuff
- Have two layouts in pages that are login only
- Not logged in element that suppresses all others in page
- Page has Not logged in message attribute - not very flexible
- Page has a Not Logged In Page attribute, displays that instead if not logged in
- Don't call all state init in page if returning NotLoggedIn
- Clear all collection and server app connector caches on logout
- Make above available as a general RefreshAllData function
- Mark Server app functions to say whether need a user or not - error prone
- Detect whether a Server App function uses CurrentUser - but may just be testing it to affect results
- Just make sure not to call Server App functions that need a user if not logged in, by not showing the page

Decision
--------

- Add Not Logged In Page property to Page
- Display alternative if not logged in
- Redisplay any page when login state changes
- Create a RefreshAllData function - clears all Server App Connector and Collection caches
- Call RefreshAllData when login state changes
- OR some other way of arranging for each connector and collection to Reset on auth change
