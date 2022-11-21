Internal navigation and deep links
==================================

Internal navigation and deep links
==================================

Aims
----

- Can move around in app using links and browser controls
- Can save/follow external link direct to a particular page and maybe state eg an item selected from a list

Requirements
------------

- ✅ First segment of path is always the page
- ✅ Default page is the first one
- ✅ URL can have multiple segments after the page, query params and an anchor
- ✅ The CurrentUrl() function returns an object with page, path array, query, anchor
- ✅ CurrentUrl().query is an object with property for each param, best guess type conversion
- ✅ Show() function can take page, multiple path segments, query record, anchor
- ✅ Query anchor should be a full id including page
- ✅ Show() updates the URL, setting a history point
- ✅ Show(URL.previous) does back operation, undoing history
- ✅ Page elements can reference the URL properties if they want, eg to get initial values
- ✅ URL has text property to get as a string
- ✅ Option to style a button as a link
- ✅ Use app setting for pathPrefix to create app context that adjusts/find the URL
- ✅ Links work in editor preview
- ✅ Links work in firebase deployed
- ✅ Can enter URL or follow link direct to deployed Firebase app
- ✅ Keep scroll position on list pages when go back and forth


Desirable
---------

- Links work in apps site
- Links work in app loaded from other web url in apps (_and consider if this is needed_)
- URL can take arguments as for show to construct a URL
- Can pass element name to Show() query for anchor  BUT how deal with stateless elements?

Implementation/Tasks
--------------------

- ✅ AppContext interface
- ✅ URL object
- ✅ URL function/getter on App state
- ✅ ShowPage reimplementation
- ✅ ShowPage(URL.previous)
- ✅ AppContext implementation
- ✅ AppContext used in generated code
- ✅ AppContext supplied to editor preview
- ✅ AppContext listens to browser history changes
- ✅ AppContext supplied to Firebase deployed app

Reacting to browser history
---------------------------

- ✅ App context has a browser history object passed in, default to standard one from history package
- ✅ App context gets URL from browser history and caches it
- ✅ App context uses browser history when updated, invalidates url
- ✅ App context has subscriptions to URL change, updates cached URL
- ✅ App stores URL in its state, instead of page
- ✅ App gets current page from URL, defaults to first if no path
- ✅ App subscribes to App context for URL changes, updates state on change
- ✅ App.ShowPage just sets new URL in app context, listener updates state


Keep scroll position
--------------------
- Start with just List - may want other things later
