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
- Calculate element properties during dragging

Forces
------

- All DnD APIs and libraries are more complicated than this
- When drop, want data about what dropped, and only ItemSet elements are associated with data
- Few use cases for dragging elements not connected to data items
- Need to drop on empty container, and ItemSets do not show when empty
- Also need to drop on an ItemSetItem
- ItemSets are best placed to know the data for the elements
- Best library seems to be dnd-kit
- Need to ensure can be easily implemented with chosen library

Possibilities
-------------

- Mark a Block/Layout as a drag container
- Or Block/Layout is always Droppable - if nothing on the page is draggable, doesn't matter
- Have a Drag container element directly inside a block/layout
- Mark an Item Set as draggable
- Mark an Item Set Item as draggable - by formula
- So Layout/Block or List is droppable, ItemSet is draggable
- All items of an item set in a Block/Layout are automatically draggable
- Any elements in a drag container Layout are draggable
- Can Drop function on draggable
- Can Drop function on droppable
- Drop Action function on droppable
- Update Block or ItemSet Item appearance when drag over, and depending on whether can drop or not

How dnd-kit could be used
-------------------------

- Page has a DndContext
- Page could have DragOverlay - get item from another context holding a ref
- ItemSetItem uses useDraggable
- Item Set has a Draggable property - use to set disabled in the useDraggable
- Pass $item into ItemSetItem so it can put it in the data
- Constraint: drag events are handled by the DnDContext
- But: with useDndMonitor, seems like you can also handle them in a component
- Can Drop would be the first element function that needs to return something - treat as an action for now
- Pass $item into Can Drop, Drop Action, from event
- Layout/Block has Can Drop and Drop Action handlers
- AND really want to merge Layout and Block first
- Need to send drop to parent block if drop on item - check collisions

Calculations based on current drag and drop elements
====================================================

Needs
-----
- Needed to know whether can drop
- Need to know what item has been dropped (got already)
- Need to know which Block and also Item within the block you are dropping on
- Need to know while dragging and also when drop
- Need a simple intuitive way of referring to elements involved
- Need to know in formulas which apply to more than one element eg in Item Sets to set item background
- Dropping on a Block or an Item of an Item set in the block will have different rules and inputs
- Need to know: Block OR ItemSetItem dropped on, and item being dragged
- Use in formulas for properties of Block, Item Styles, possibly styles of dragged item
- Use in Can Drop and Drop Action
- Will want to know if being dropped on this element, or if this element is being dragged
- Will want to know if dragged item could be dropped on this Block or Item Set Item eg to highlight all drop locations even if not over
- Will also want to know if dragged item is over this one
- If could get drag item/id and drop item/id will be useful - drop item is null when dropping on a Block
- Why do we need Can Drop?  In Drop Action, ignore if cannot drop, and style property amendments provide UI feedback
- What if: you had $dragItem available in formulas of a Block?
- In ItemSet Item styles can use $item and $itemId
- Can provide drag info vars when needed inside a component by generating a call to a function in Elemento

What need to know in formulas
-----------------------------

- Dragged item and id - Elemento function
- Item Set Item's item and id - got already
- If over an Item Set Item - already have local vars within the component
- If over a Block
  - Need to know _outside_ the Block
  - Possible: IsOver(element_codename as string)

Block isOver
------------

- Block has a state, becomes statefulUI
- Block state has IsOver
- Block monitors isOver set/unset state
- Page gets DragIsOver function that just checks a Block

Item Set Item isOver
--------------------

- useDragIsOver returns function that can be used as DragIsOver
- generated component calls this
