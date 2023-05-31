Form generation
===============

Aims
----

- Forms can be generated automatically from Types
- Flexibility to adjust the UI is straightforward

Requirements - Basic forms
--------------------------

- Form element similar to Layout that can contain most other UI elements
- Forms can contain other sub-forms
- Form can have an original and current value of an object type
- Fields of the form object automatically applied to the values of the contained objects
- Sub-forms have their corresponding object field in the main form as their value 
- Form has a Reset that is applied to all contained items
- Form can have a default action button name - Enter does that action

Requirements - Typed forms
--------------------------

- Form can have a Record Type
- Input elements of the appropriate type are generated for all sub-fields of the Record Type
- Object fields create sub-forms
- Types of the Record Types are applied to the input elements
- Names of the input elements are the names of the fields
- Where an element with the same name exists, it overrides the one that would have been generated
- Where an element with a different name exists, it creates a field at the end of the Form fields
