Styling
=======

Aims
----

- Common styling properties can be set easily
- Any property on the underlying component can be set by advanced users

Requirements
------------

- ✅ All ~~the MUI sx~~ standard CSS properties are available under advanced view
- ✅ Styling props can be formulas
- ✅ Errors in styling prop formulas are shown
- ✅ Styling props without errors are still applied
- ✅ Easy to add the advanced properties to any new component
- ✅ Existing styling properties removed
- ✅ Tech debt: remove actionDefs if no longer used
- ✅ All components have a show property, replaces old display


Further requirements
--------------------
- Any additional properties can be supplied for the underlying component via a free-form Record
- Any additional CSS settings can be included in the sx via a free-form Record
- Styles in a Collapse container
- Styles work better on select

Technical
---------

- ✅ List of styling prop names, with type derived from
- ✅ All visual model objects have an additional styles property, which is an object keyed by styling prop names - common base component
- ✅ Additional property def type of styles
- ✅ Property editor shows styles property as another property editor
- ✅ Generator generates styles prop
- ✅ All runtime components pass through the styles to sx props - _or where they take effect_
- ✅ Remove project from PropertyEditor
- ✅ Refactor input props to include styles and required/info, put in function shared by input components, remove InputWithInfo
- Refactor other generators to match

Components to add styles
------------------------

- ✅ Text
- ✅ AppBar
- ✅ Calculation
- ✅ Form
- ✅ List
- ✅ Page
- ✅ Button
- ✅ Icon
- ✅ Image
- ✅ Layout
- ✅ Menu
- ✅ MenuItem


To do
-----

- Check slow timings on PropertyInput for TextInput
