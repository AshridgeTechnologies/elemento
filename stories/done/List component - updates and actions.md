List component - updates and actions
====================================

Aims
----

- User can update the items in a List
- User can do actions involving the items in a List

Requirements
------------

- ✅ List item can contain stateful components
- ✅ List item can contain action components
- ✅ Actions can act on item or whole list
- ✅ Expressions in list item can use other components in the list item
- ✅ Expressions in list item can access components in the page

Implementation notes
--------------------

- ✅ Fix naming bug by prepending page name to the list item name
- ✅ Exclude the stateful objects from parent (page) useObjectState calls
- ✅ Include the stateful objects in the list item useObjectState calls
- ✅ Names from the page are available in the list item
- ✅ Remove BaseElement.allElements()

