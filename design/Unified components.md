Unified components
==================

30 Sep 2025

Aims
----

- Make built-in components, user-defined components and third-party components all usable in the same way
- Elemento components can be exported and used in any other app
- Elemento projects can be built and served by Vite using a plugin

Needs
-----

- A Project contains a set of components
- App and Page are just components
- User-defined components are also just components
- User defined components can have child elements if appropriate
- Each component produces one code file
- Each component is edited separately
- Any component can be previewed individually
- Component input properties can be set for the preview
- Mechanism to run a component as a top-level app
- Existing page routing still works
- Elemento standard components can be imported
- Third-party components can be imported
- Components can be exported
- Code generation available as an API
- Vite plugin to transform Elemento components into code files during build
- User-defined components can have out props and functions like built-in

Forces
------

- Use case: a group of components together eg Address, Full name
- Use case: enhancing or fixing properties eg Big Red Button, Large Text Input
- Use case: Wrapper for other components eg a yellow background box
- Use case: template to slot other components into eg a page template
- So there may be fixed and dynamic elements inside a component
- Want to keep things simple
- The isLayoutOnly thing is messy, good to get rid of it
- All the elements created inside a component are visible, even if there are multiple nested levels
- Access to fixed elements from outside the component is unwise - like accessing private fields
- A specific page component would create a standard Page element, but also create the elements on the Page, so all at same level
- In the enhance/fix props use case, you want to use the result like the base component, including all its functions and props
- SO for that case you do want the state to inherit the base
- App is another case where you want to keep the standard app functionality but extend it
- But you will also want to add components like headers, footers, sidebars etc
- Some components need a state object, others don't
- But anything with functions needs one - so most Pages will need one
- If extend a component that uses a state object, must use the same state object in extender and extended
- And - still need to use the base component on its own, so it may need to create its own state object
- If you extend a component for re-use you may want to still have all its properties in the extended component
- If you extend a component for one specific use, you may not want to expose its properties in the extended component
-

Possibilities
-------------

- Say that all elements defined within a component are accessible in that component
- Choice about whether to extend another component or not (based on)
- Extending state objects may be a reason to use dom-only id extensions, removed to access the state object
- If a component finds an existing state of a subclass of its own, use it 
