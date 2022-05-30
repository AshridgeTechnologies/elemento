Horizontal layouts
==================

Aims
----

- Users can arrange UI components across the page instead of always top to bottom

Requirements
------------

- ✅ Single rows of small items can be arranged horizontally eg first name and last name
- ✅ Responsive wrapping happens automatically on screen size changes
- ✅ Whole page can be split horizontally eg for list and selected item
- ✅ Widths of items can be adjusted esp List
- ✅ No additional wrapping elements are required on items in a horizontal layout
- ✅ Also need component to wrap vertical groups of items within the horizontal layout
- ~~Ids and selection are correct for nested items~~ => new story

Technical
---------

- Use MUI Stack rather than Grid as it does not require Grid item elements
- May need a general width property on all components
- May also need several other layout (and other styling props) on all components
- Would be good to have a general way of doing this rather than adding them to all models and implementations
- Keep in mind the goal of easily adding any React component
- BUT that is another story
- SO:
  - Add a Layout component, with width
  - Add width to List
