Complex properties
==================

03 Nov 2025

Aims
----

- Make repeating properties or groups of properties for an element easy to configure
- Make code generation for such properties standardised

Needs
-----

- Studio can configure complex properties in a simple and intuitive way
- Complex properties can include arrays and/or objects
- Component can define these properties in its schema
- Editor can display and update these properties
- Code generator can generate code without any special component-specific processing
- Component can use the properties as required
- Basic properties within the complex props can be expressions
- Expressions can use values supplied by the component eg $item, $index
- Expressions can use values from the container as in normal properties

Forces
------

- Writing Records or object expressions within a single property is not very good

Use cases
---------

- Column definitions for Tables

Possibilities
-------------

- Carry on with Records for now
- Have property sub-elements with that can only belong to the main component
- Schema defines these as property sub-elements
- The sub-elements each define a named element of a repeating property group
- Editor can create/delete/update/reorder these sub-elements like components
- Code generator uses property sub-elements differently
- Property sub-element values are provided as properties to the main component, not children
- Sub-element values can be functions that are called with arguments supplied by the component eg $item, $index

Decisions
---------

- Use records for now
- With experience, decide when to introduce complex properties 
