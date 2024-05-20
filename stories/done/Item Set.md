Item Set usable with any container

Aims
-----------------------------------------

- Item Set usable with any container
- Cover multiple needs for lists, free-form layouts, etc

Requirements
------------

- ✅ Produce a fragment with a list of elements
- ✅ Still need a generated component to map the data onto
- ✅ Deal with selected item(s) in a flexible way
- ✅ Item Set State knows the selected items and handles the select action
- ✅ Item Set knows the data
- ✅ Container may want to know if an item is selected to display it differently eg MUI List -> ListItem
- ✅ Item generated by the Item Set could display differently and may want to in a custom way eg by a tick
- ✅ Item Set items have a wrapper element around the parts of each item
- ✅ Item Set has Item styles that are applied to each item to save another wrapper inside the wrapper
- List becomes just one of the containers that you can use with ItemSet, but wraps them in Mui list item

Item Set selections
-------------------

- ✅ Multiple selections need to be possible
- ✅ Need to work with plain data (like strings) or objects with or without an id
- ✅ Need to work with multiple identical items in the set (eg for memory game)
- ✅ Change Selectable to be a choice of Not selectable, Single, Multiple, Multiple Auto
- ✅ Multiple selections can be done with Ctrl/Cmd to add one and Shift to add a block
- ✅ Multiple Auto toggles selection of an item when clicked
- ✅ Click on selected does nothing if single, removes if multiple auto
- ✅ Selections via UI store id if item has one, index otherwise
- ✅ Selected Item state property - always the most recently selected item
- ✅ Selected Items state property - all selected items, always an array, even if single select, in the order they were selected
- ✅ Selected Item Ids state property - as often want id, and in some cases have items the same (eg letter puzzle)
- ✅ Selected Item Ids uses indexes if the items do not have ids
- ✅ Change Selected Item input property to be Selected Items, with single, multiple or array arguments - just flatten
- ✅ Selected Item input arguments matched to item first, then item id, then to index
- ✅ Set and Select work the same way
- ✅ Selected item inputs appear in state selected items
- ✅ SelectAction is given the new selected item id(s) or indexes
- ✅ Select function on state takes single or array of items, item ids or indexes and adds them to the selection
- ✅ Set replaces the selection
- ✅ Selected items does not include removed items if items changes

Technical
---------

- ✅ Create Item Set based on List - but no styling/show
- ✅ Generate ItemSet component
- ✅ Has same selectable selectedItem as List
- ✅ $selected is sent through to the item component
- ✅ Try on its own in page
- ✅ List becomes a layout only component
- ✅ Keep list state class to store scroll position
- ✅ Generate List children normally
- ✅ Need to upgrade MUI to get wrapped Stack working
- ✅ BUT this stops tutorials working because of the slotprops backdrop issue
- ✅ Check CSS on List and Items manually