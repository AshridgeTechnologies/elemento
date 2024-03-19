User defined components approach
================================

Aims
----

- Developers can easily define reusable components in a Project and/or App
  - for all the usual reasons why this is desirable

Needs
-----

- Can define a component with children
- Can have inputs to the component
- Insert the component easily into a Page
- Configure the inputs easily - as component properties
- Generally - use the component as if it were a built-in one
- A way to organise components within the Project/App
- Generate code for the component
- Include the components in the generated code where they are used
- If possible: include the components in the normal Insert list 
- Later: Components can have children as properties and insert them in the output
- Prepare a way to import third-party React components and adapt them to Elemento

Issues
------

- How isolated and standalone are components - can they access an app for example?
- How should user-defined components be represented in the in-memory model?
- How should user-defined components be represented in the JSON project file?

Forces
------

- Using React, so aligning with React components will be easier
- Pages already generate components - may be able to use the same approach
- Could make the fixed ElementTypes unusable
- Element types will have to be a flexible set determined at runtime
- There will have to be model objects for the components themselves AND their instances - these are different things
  - cf user defined Functions where the usage is in a formula
- Component instances will have to behave like other model objects
- Most things in BaseElement will just work for a component instance if can link to the Component definition
- When loading from JSON, will have only the built-in classes available - unless do two passes
- User-defined components can change while you are editing, built in do not, third party may change occasionally
- Would be good to move towards separate definitions to make importing third-party components easier

Possibilities
-------------

- Set number of named inputs like with function defs
- Named inputs become properties
- $props or just props can be used in expressions inside the component
- Generate component like a Page
- Have a Components section at top level of Project
- Generate all components into each App
- Or - Components are specific to an app, included like Pages
- ComponentType and ComponentInstance linked to it
- Generate component class from ComponentType
- !!! Restrict to stateless UI components with no children to start with
- Placeholder elements for children properties
- Have a single class for user-defined component instances that uses the definition
- Generate classes that implement what necessary based on the component instances
- Generate classes that just extend the user-defined component class and pass in its name/reference
- Regard existing model classes as special cases, standard way is to have a definition and one element class


Spike 1
-------

- Model object for component definition
- Model object for component instance
- Generate component code
- Generate instance code


