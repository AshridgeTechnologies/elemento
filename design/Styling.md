Styling
=======

Aims
----

- Allow fully flexible styling for advanced users
- Keep things simple for novice users
- Avoid complex and repetitive additions to all elements
- Lay groundwork for free-form positioning and animation

Needs
-----

- In design, apply styles in a uniform way for all elements
- Styles are set like other properties
- Properties other than styles can also be set
- Basic styles and advanced styles
- Code to allow styling is reusable across all elements
- Styles can be computed by expressions
- All styles applicable to an element can be set

Forces
------

- There are a great many styles and properties
- Many properties are within the style property
- Different set of styles and properties for different elements
- MUI or other React components makes it more difficult to directly access the properties of the underlying element
- What you can set is really down to what properties the React component can use, not the HTML element
- MUI has a competing way of setting styles with its sx properties and specific style properties eg margin='dense'
- Deciding what is basic and advanced is hard
- It is quite unclear what will be useful here
- May want to bring in many new components - even the full MUI set is extensive
- Users may want to bring in other third-party components and use them like built-in ones
- MUI sx system would cater for most needs
- *** This is linked with the problem of easily importing new components

Possibilities
-------------

- Start with something basic
- Have an additionalProps on every element, for adding arbitrary props to an element from a Record type
- Read Typescript types and generate possible props
- Read JSDocs and generate help
- Two property views - advanced includes basic
- Just use MUI sx styles
- BaseElement adds properties and propertyDefs to model for all sx properties
- Generator passes all sx props through in the generated code
- All runtime components pass sx props through to the relevant underlying component

Decisions - 4 Jul 2023
----------------------

- Add properties for all sx props via a common base component or mixin
- Mark properties as sx and/or advanced in the property def
- Have two views on Property Editor, with and without advanced
- Standard way of including all sx props in Generator
- All runtime components pass through the sx props
- Also have an additionalProps on all components, which is fed through to the component
- And have an additionalSxProps which is added to the sx prop eg for cursor
