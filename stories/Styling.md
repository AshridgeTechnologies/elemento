Styling
=======

Aims
----

- Common styling properties can be set easily
- Any property on the underlying component can be set by advanced users

Requirements
------------

- Property Editor has two views, basic only and advanced
- Advanced view includes the basic properties as well
- All the MUI sx properties are available under advanced view
- Any additional properties can be supplied for the underlying component via a free-form Record
- Any additional CSS settings can be included in the sx via a free-form Record
- Easy to add the advanced properties to any new component


Technical
---------

- Add properties for all sx props via a common base component or mixin
- Mark properties as sx and/or advanced in the property def
- Standard way of including all sx props in Generator
- All runtime components pass through the sx props
- Also have an additionalProps on all components, which is fed through to the component
- And have an additionalSxProps which is added to the sx prop eg for cursor