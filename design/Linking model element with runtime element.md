Linking model element with runtime element
==========================================

Needs
-----

- Find all the elements on a page generated from an element in the model
- Find the element in the model that generated an element in the page

Forces
------

- Keep generated code simple
- Make few demands on new components
- Don't clutter the HTML
- Have only one way of identifying an element
- We are already passing the path through to use as the DOM element id
- A single model element may have different indexed paths if used in a repeating group
- Getting custom attributes into MUI elements is hard, whereas they all allow id
- Extra work will be needed to find model element paths and find them by a path
- CSS has native attribute selectors for starts-with

Possibilities
-------------

- Generate a data-elementid attribute in the HTML, then can match both ways
- Use the path, then have to allow for indexing in the path

Decision 8 Mar 22
-----------------

- Prefer simplicity of the generated code and less burden on new components
- SO: use the path
