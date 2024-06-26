Drag and drop
=============

25 Jun 2024

Aims
----

- Allow drag and drop functionality in an app

Needs
-----

- Make elements droppable
- Make elements draggable
- Control whether can drop
- Take an action when drop
- Know item(s) that have been dropped
- Know position where dropped 
  - x/y if absolute
  - Or existing item dropped on/before

Forces
------

- All DnD APIs and libraries are more complicated than this
- When drop, want data about what dropped, and only ItemSet elements are associated with data
- Few use cases for dragging elements not connected to data items
- Need to drop on empty container, and ItemSets do not show when empty
- ItemSets are best placed to know the data for the elements
- Best library seems to be dnd-kit
- Need to ensure can be easily implemented with chosen library

Possibilities
-------------

- Mark a Block/Layout as a drag container
- Or Block/Layout is always Droppable - if nothing on the page is draggable, doesn't matter
- Have a Drag container element directly inside a block/layout
- Mark an Item Set as draggable
- So Layout/Block or List is droppable, ItemSet is draggable
- All items of an item set in a Block/Layout are automatically draggable
- Any elements in a drag container Layout are draggable
- Can Drop function on draggable
- Can Drop function on droppable
- Drop Action function on droppable

How dnd-kit could be used
-------------------------

- Page has a DndContext
- Page could have DragOverlay - but where get item from?
- ItemSetItem uses useDraggable
- Item Set has a Draggable property - use to set disabled in the useDraggable
- Pass $item into ItemSetItem so it can put it in the data
- Constraint: drag events are handled by the DnDContext
- But: with useDndMonitor, seems like you can also handle them in a component
- Can Drop would be the first element function that needs to return something - treat as an action for now
- Pass $item into Can Drop, Drop Action, from event
- Layout/Block has Can Drop and Drop Action handlers
- AND really want to merge Layout and Block first
