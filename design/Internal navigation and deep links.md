Internal navigation and deep links
==================================

Aims
----

- Can move around in app using links and browser controls
- Can save/follow external link direct to a particular page and maybe state eg an item selected from a list

Needs
-----

- Link in a page to a different page/state in the app
- Action can set the page/state
- Can also navigate to different parts of the page with anchors
- Navigate backwards and forwards using browser controls
- Action can go back/forward
- Can copy or bookmark URL to link to a page/state
- Can navigate to a saved URL to get back to the same page/state
- Intuitive, easy to understand programming with few moving parts
- Not compulsory - you don't have to use routing if you don't want to
- Does not prevent using multiple apps in a page
- Link scheme works even if the top-level of the app is not directly under the domain name
- Works in preview

Forces
------

- Slight concern about exposing internal workings or tying links to implementation
- State would include selecting an item in a list/detail page
- Setting link and history needs to be at clearly defined points, not every keystroke
- Link could include state of values in search fields
- Binding vs functional vs actions
- May access the app not on the top level of a domain
- May have a deep link to an app not under the top level


Possibilities
-------------

- First segment of path is the page name
- URL and/or query can have values for page elements
- Format could be ?<control-path>=value&...
- URL and/or query is like a built-in data element that can be set and queried
- Internal link element with page and params and external link element with just a URL
- Link like button with action
- Show or a new function can set the page and params
- Can isolate the browser location/history in an interface and pass in dummy
- Can pass in a location interface that hides any fixed path segments
- App does not use the browser directly, just a context


Initial design - 10 Nov 22
--------------------------

- First segment of path is always the page
- Default page is the first one
- URL can have multiple segments after the page, query params and an anchor
- The URL() function returns an object with page, path array, query, anchor
- URL().query is an object with property for each param, best guess type conversion, plus anchor
- Show() function can take page, multiple path segments, query record including anchor
- Query anchor should be a full id including page
- Show() updates the URL, setting a history point
- Show(URL.Previous) does back operation, undoing history
- Page elements can reference the URL properties if they want, eg to get initial values
- URL has text property to get as a string
- Option to style a button as a link
- Runner can supply an optional app context that finds/adjusts the page and other params in the URL
- Path prefix supplied in context settings is used to create the app context
- App context subscribes to browser history
- App can subscribe to app context for history changes, update currentUrl in state to cause an update


Desirable
---------

- URL can take arguments as for show to construct a URL
- Can pass element name to Show() query for anchor  BUT how deal with stateless elements?


Linking list selected item to URL
=================================

Aims
----

- Can link (both ways) selected item in a list to the URL

Needs
-----

- When page is loaded, can set the selected item from the URL
- When URL is updated by any means, the selected item changes
- When an item in the list is selected, the URL is updated

Forces
------

- Keep it simple, intuitive, easy to reason about
- No combinations of settings that are easy to forget or get wrong
- A selectable list must still work if not linked to the URL
- Selected item property must still be available even if set from URL
- May still want to do action on list selection even if not linked to URL
- Setting selected item is an advanced usage, may be OK to take longer to understand

Possibilities
-------------

- List selected item is controlled from the URL, not held in state
- OnSelected action, use to set URL
- URL initially sets the URL, then tracks the selection - BUT how URL change affect selected?
- Specific URL tracking

Decision 5 Dec 22
-----------------

- OnItemSelected action - can use to update URL
- Can have OnItemSelected action even if not Selectable
- To control from URL, use not selectable and set URL from OnItemSelected
- Maybe: rename Selectable to StoreSelection, HoldSelection
