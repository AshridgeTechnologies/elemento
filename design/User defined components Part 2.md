User defined components Part 2
==============================

11 Jan 2025

Aims
----

- Solve the specific problem of puzzle apps where the definitions are about 50% shared, 50% specific to the app
- Enable component re-use across apps
- Enable components to extend others (maybe)
- Enable components to have state and actions

Use cases
---------

- Page title definition to keep styles the same on each page
- Template for a page, add specific content
- Reuse a block to get styling


**Note**: two approaches, basically inheritance or composition

Approach 1 - Inheritance
========================

Needs
-----

- Fit with or supersede current component definitions
- Component can "pull in" another component
- Can add its own children
- Can insert children at specific places
- Can insert children inside other subcomponents eg a layout block
- Can override properties of a subcomponent
- Can override properties
- Can replace children
- Can use components in other projects
- Maybe: be the way to reuse styles
- Easy to see what is going on in the editor

Forces
------

- To override a property to remove it, need to store null or empty string
- Will have to prevent any duplicate sub-element names, even for stateless

Possibilities
-------------

- Have a template component area in the project that can contain any component
- More like the JS prototype idea than an encapsulated component
- Any component can have a Based On - probably only of same type
- Could have multiple levels
- Maybe have multiple Based On
- Properties are copied in
- Children are cloned and added in
- Good if no changes to runtime components
- Good if no changes to Generator - just takes effective view of model element
- Model element combines its based on and own props/children to provide effective view
- Maybe can only be based on components in special area to avoid confusion
- Based On is by name to be consistent with other references
- Effective props is Own Props merged with the Based On props
- Effective elements start with a deep clone of the Based On elements
- Own child elements are added to the end of the elements
- If want child elements in specific place, provide an empty Block to which they are added
  - then can have multiple positions by providing multiple insertion Blocks
- Elements array holds elements with multi-segment paths to show they are inside a nested element
- OR could clone all the way down
- If an element path is the same as an existing path, replace it - or merge it?
- Property editor shows based on value with strikeout if overridden
- Editor doesn't know whether properties and elements are overridden or not
- Model sorts out all the effective properties and elements - for easy unit testing
- Model knows how to create and/or remove sub-elements in elements based on others


Issues
------

- How is this done in the model?
- How is this done in the generator and/or runtime?
- Based on by name?

Override scenarios
------------------

### Top-level property override
- new value in own props

### Sub-element property override
- element with same name as a based-on element overrides it and is automatically based on it
- overriding element has new value in own props
- effective based on is determined by looking up tree until find a root based-on, then working down again

### Additional sub-element
- Element with a different name to any based-on element is additional, added at the end
- An additional sub-element may be standalone or could have a root based-on


Approach 2 - Composition
========================

Needs
-----

- Component can have child elements
- Component can have multiple slots for child elements
- Component can have state properties
- Component can have events with actions
- Which means properties can be functions, not just plain values
- Component can have state update functions
- Moves towards a way to wrap existing components for use in Elemento
- Components can use state properties and state functions of child elements

Forces
------

- The old "prefer composition to inheritance" mantra
- Have already started down this road with existing user defined components
- Fits better with React and other component models
- To 

Possibilities
-------------

- Components have named slots for child elements with matching names
- Components can read state of children
- Components can have state themselves
- Calculations in components could create state properties
- Functions defined in the component could be called externally
- Could use any input property as child elements
- Could have $children prop auto available as child elements
- Could have child placeholder elements, with optional name
- Have a Block called $children

Providing Output properties
---------------------------

- Could be Calculation elements, maybe with a public marker
- Could be names in the model properties
- Could be special ComponentProperty elements
- Expressions will want to use the other state elements in the component
- So need a way to access those
- And need to have them available for expressions in generated code

Providing a state object
------------------------

- Could generate a specific class
- Only needed if has any state features
- Could use a general ComponentInstanceState

Providing actions
-----------------

- Component property definitions need to be like PropDefs, not just names
- Have a special InputProperty element for them
- Its properties are: type - most of the PropertyType values

Making a state object trigger an update if any child states update
------------------------------------------------------------------

- Component state has a child states object in its state
- Child state update triggers re-render of component
- Component render gets all child states anyway, compares with current child states, updates if different

Wrapping existing components
----------------------------

- Need to use some events to update a state object
- Need to use other events to call an action function
- Need to know the properties so can use them in editor
- They don't have state update functions

Decision - 14 Jan 2025
----------------------

- Try Approach 2 Composition first
- Spike embedding children first
- Spike OutputProperty elements
- Spike InputProperty elements, including actions

Providing state functions
=========================

Needs
-----
- Component functions could be private, but normally public to be accessed from container
- Component functions need to be called on the state object
- Component functions must be able to access child element state objects - including Data
- Component functions need to call other component functions
- Action functions or calculations need to call component functions
- Don't need to use this, self etc to call other component functions

Forces
------

- Functions inside a Page are created as React callbacks, and set as state objects so they can be accessed within that component
- Functions inside a Page can use all the other components - but the Page state? - doesn't have any
- Components are self-contained, so can't access container functions
- Don't want two kinds of functions - one for app/page, one for component
- If can access without own functions without this, names may shadow system functions
- Data objects are really like instance variables of the state object 

Possibilities
-------------

- All Functions are generated on the state object - each Page has a _generated_ state object too
- Functions are bound to the state object so can be called without this
- Child states become properties of the component - but would expose details
- Component is a proxy
- Use FunctionDefs inside the component in model, generate as state class methods
- Function Defs have a public/private option - start with all public on Component
- Get dependencies of each function and set consts like in output properties
- Change Page/App to work like a component later

