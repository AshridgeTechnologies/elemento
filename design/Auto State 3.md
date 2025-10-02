Auto State 3
============

25 Oct 2025

Aims
----

- Sort out issues around using auto state in Elemento

Needs
-----

- Approach for using the App throughout the application
- Approach for user-defined components that "extend" built-in components
- Approach for user-defined components that "extend" other user-defined components

Forces
------

- Function components can extend by wrapping the extended component - they are _above_ it
- State classes can extend the state class of the extended component - whether built-in or user-defined
- Either the base or extended component can set the state object - but not both
- A component may be used both as itself and extended
- Is composition better than extends?
- Need a concept of a global state object available throughout the application
- The app could be the global state object - or one of multiple global state objects
- If use composition, another level, concept of child components becomes muddy
- If you extend a component that can have children, you need to look > 1 level down for the children
- It may be multiple levels down, if extend an already extended component
- May want fixed and dynamic children at same level in id hierarchy
- A template page is a common example of fixed with dynamic children
- When you use a template page, it is below the actual page
- When you create a specialized input, the normal input is inside it
- Template page may want to know about its children
- The final page that uses the template will want to use the same children
- Components used for layout only (eg Block) need to allow reference from parent to children as if they were direct descendants
- The isLayoutOnly prop would be calculated from the id - or may not be needed


Possibilities
-------------

- Designate a particular object in the store as global
- Set up aliases for objects in the store
- Extending components pass same path in to extended component
- Component knows whether it is being extended or not - how? 
- Pass a prop to component to tell it it is being extended
- You don't extend - you can only compose - the OO types would be proud of you
- So the specific app and the standard App wrapper are separate components, separate state
- Component allows itself to be extended by using state object if there, otherwise creating
- Both the extended part and the children are at same level in id hierarchy
- Can look within extended component for child state objects
- Use a convention to extend ids, so _name is extended by _name_ext and _name_ext_sub
- Remove (or don't use) extensions when using path to form child paths
- Or just keep all on same level, ensure extended components have non-conflicting ids eg with prefix
- Both fixed and dynamic children may require parent to re-render



Decisions
---------

- Any component that uses the app gets it with useComponentState('<app name>')
- Any component that uses the app also passes it to its state object
- ElementoComponentState accepts an app property and exposes it as this.app
- All components use the dot notation hierarchy
- A component may have fixed elements and dynamic elements (children)
- The id hierarchy reflects the component that created them, not necessarily the DOM hierarchy
- If a custom component uses a standard component and puts its children inside that, all their ids are at the same level
- The fixed element will have a separate state object
- State objects are composed, not inherited

App - a special case?
=====================

Forces
------

- Should App follow the rule that state object classes do not inherit?
- AppData (the App's state object) has a lot of functions needed throughout the app
- A custom App will also have functions needed throughout the app
- If the custom App inherited the standard one, the functions would all be available together on the one app object
- But this is non-standard and will lead to complications

Possibilities
-------------

- Custom app exposes all the standard app functions, just delegates
- Custom app extends standard app, deal with the special cases that will require
- Have a BaseAppState class that custom app state can extend
- Standard app gets the well known app via the alias
