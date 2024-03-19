User defined components
=======================

Aims
----

- Developers can define components to use throughout an app

Requirements
------------

- ✅ Component (Definition) model object
- ✅ Component can have named properties
- ✅ Component can have child elements
- ✅ Child element formulas can refer to the component properties by $props.name
- ✅ Instances can be inserted using the normal insert menu
- ✅ Instance has a property editor using the property names in the definition
- ✅ Instance property editor also has styles
- ✅ Instance renders a containing box (div?) to which the styles are applied
- ✅ Hold user defined and imported under a fixed Components folder under Project
- ✅ Cannot delete Components folder
- ✅ Cannot delete a Component that is being used

Further requirements
--------------------
- User defined components are in a separate section of the menu

Technical
---------

- ✅ Generate code for the component function similar to Page
- ✅ Project knows what Element types are available
- ✅ Project creates new Element of a given type
- ✅ Project has to be available to resolve ComponentDefs where needed - in create new or getting property defs, icon class
