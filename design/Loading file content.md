Loading file content
====================

9 Sep 2024

Aims
----

- A simple and flexible way of using the content of a file in an app
- Support things like including HTML, reading lists of words

Needs
-----

- Get the content of a file on the web as a string
- Refresh the content when required
- Maybe later: get the content as a byte array

Forces
------

- Text content is very often static, only needs to be read once
- Simple needs - just one thing, getting the text
- Good to not have another model object
- No other functions have state
- Need a mechanism to re-render when the content arrives
- An element would fit with the model of ServerAppConnector and WebFileDataStore, and be more flexible
- An element could get a JSON object, or text, or bytes, and a Refresh function

Possibilities
-------------

- Use a cache-buster in the URL if need to refresh
- Could have a simple FileText function
- BUT would need a one-off mechanism to trigger an update
- Could wrap it in a Calculation BUT not intuitive

Decision
--------

- ~~Start with a FileText() function, cached after first read, see how useful it is~~
- Have a WebFile object - more flexible, consistent with WebFileDataStore
