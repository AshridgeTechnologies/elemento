Form generation
===============

Aims
----

- Forms can be generated automatically from Types
- Flexibility to adjust the UI is straightforward

Requirements - Basic forms
--------------------------

- ✅ Form element similar to Layout that can contain most other UI elements
- ✅ Forms can contain other sub-forms
- ✅ Sub-forms have their corresponding object field in the main form as their value
- ✅ Form can have an original and current value of an object type
- ✅ Fields of the form object automatically applied to the values of the contained objects
- ✅ Form has a Reset that is applied to all contained items
- ✅ Form can react to keystrokes, including Enter
- ✅ Form has an Updates function to get changed values

Requirements - Typed forms
--------------------------

- ✅ Form can have a Record Type
- ✅ Input elements of the appropriate type are generated for all single-value sub-fields of the Record Type
- ✅ Object fields create sub-forms
- ✅ Types of the Record Types are applied to the input elements
- ✅ Names of the input elements are the names of the fields
- ✅ Where an element with the same name exists, it overrides the one that would have been generated
- ✅ Where an element with a different name exists, it creates a field at the end of the Form fields
- ✅ Help for the whole form is shown from the Record Type description

Further requirements
--------------------

- List fields create editable ListElements with correct values



Technical
---------

- ✅ Form model class - similar to Layout, will have same properties
- ✅ Form runtime React class - similar to Page and Layout but gets its own state like Input component
- ✅ Generator generates a component for a Form, as with Page, List Item, using the Form runtime class
- ✅ Generator also generates a Form State class
- ✅ BaseFormComponent has common functionality:
  - Reset, ShowErrors functions apply to fields
  - Valid, modified, errors properties based on fields
- ✅ Forms have titles and separator space or borders
- ✅ Change in form element must trigger re-render
- ✅ Form state is usable inside with $form
- ✅ Form state must be usable outside form
- ✅ Keystroke on Form can do default action
- ~~Must ensure Enter in multiline or select does not trigger default action~~ How?
- ✅ Initial value PropertyInput for form must be a formula

- ✅ Add data type property to Form
- ✅ Form element creates input elements in Forms with Types, merges with those supplied
- ✅ Review whether to generate a specific form component for each instance
- ✅ Large i icon next to form label (even if not present) for help

Enter key
---------

- ✅ Form model has keyAction property, holds Action formula
- ✅ Form model has submitAction property, holds Action formula
- ✅ keyAction formula can use $key and $event
- ✅ Submit action can use $form and $data
- ✅ Key event handler on UI component if have KeyAction action
- ✅ $key is assigned from event inside the function
- ✅ Elements inside a form can use $form
- ✅ Form state object has a Submit function
- ✅ Submit function can have an argument passed to it, appears in $data
- ✅ Form React component has keyAction
- ✅ keyAction is called with key events within the form


Form element vs Form component
------------------------------

- With a Form element, there are two things:
  - The Form _component_, that has its own isolated set of identifiers used, and generates a separate item
  - The Form _element_, that is a usage of the component, as  child element of the page (or another form)
- So you actually need _two_ sets of identifiers: those used in the element in the Page, and those used within the component
- ✅ Solution: store element identifiers and component identifiers separately


Issues
------

- Formulas in forms need to be able to see all items in Page - or do they? - No
- Formulas in Forms need to be able to refer to sub-forms and their contents - or do they? - No
- Forms states need to know all the objects that belong to them - immediate objects only
