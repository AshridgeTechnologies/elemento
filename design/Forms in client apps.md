Forms in client apps
====================

13 Jun 2023

Aims
----

- Make developing apps with forms easy and intuitive

Needs
-----

- Developer can use generated and manually arranged forms easily
- As many things as possible just work
- Still have full flexibility to use multiple forms on a page
- Different forms can contain elements with the same names (eg Billing/Delivery address)
- Referring to form elements, including nested, _and_ their values is easy and intuitive
- Keep down the number of elements needed eg Page, Form, Layout
- Allow for Forms being in components defined within the app in the future
- Allow for Forms being in components imported into the app in the future

Forces
------

- A Form could be an extra complication on a simple page
- Don't _need_ forms, but they can simplify many common use cases
- A Form will focus attention on the relevant elements, without titles, menus etc
- Many pages will have multiple forms
- Forms will often be nested, eg Address within order
- Forms will often have multiples of the same kind eg Billing Delivery address
- Will be common to define things like an Address form and reuse them in several places in an app
- May have Lists where each element contains a Form
- For formulas used inside a Form, want to refer to elements by their plain name in that form
- May also want to refer to elements in a peer or parent Form, and page elements
- This would introduce a new concept - nested naming contexts within a Page
- May be better not to allow referring to elements in peer or parent elements, as complex and limits reusability
- Forms will have functions/properties affecting/derived from their child elements
- _May_ be possible for Forms to have no stored state of their own, just effective combined state of their children
- _But_ a state object is still needed to refer to the Form in formulas
- Forms defined in the page or elsewhere must behave the same way
- List elements already have separate components defined
- There is a parallel hierarchy of UI components and state components
- May want to have things like keystroke events being used by Forms in the future
- Will be cumbersome to have a Form and a Layout used together to position components
- 

Possibilities
-------------

- Forms generate their components dynamically
- Forms are just containers and have components added to them
- Forms are generated code, within the page
- Forms are generated code, outside the page
- Forms are regarded as opaque components within the page, like low-level inputs
- Any initial state or props a Form needs are passed in
- Forms are regarded as a bit like mini-Pages within a Page
- Forms act as layouts, and have Horizontal and Wrap properties
- Forms have width and other styling, like other input components

Form actions 24 Jun 23
------------

Forces
------

- Natural to include buttons inside form
- BUT if the form is isolated, button can't do anything
- Helps reuse of forms and also debugging if they are isolated
- Can add ability to use stuff outside the form later - harder to take away if people already using it
- More complicated if have to pass action out of form
- Want to be able to submit forms with Enter in special cases
- Want to be able to submit from multiple buttons
- Want to be able to submit with different actions from different buttons
- HTML support for submit on Enter is not useful
- Defining action outside the form, but letting form buttons supply a parameter gives best of both approaches

Possibilities
-------------

- Property submitAction on Form, supplied from outside
- Form state has a Submit function, takes a parameter
- Parameter is supplied to Submit action
- $form is available inside the Submit action
- Button actions can call Submit, with a parameter
- Can also call Submit from outside the form
- Form can have keyAction like other elements
- If keyAction function can access the target state (or $form), it can call Submit on it, so submit by Enter can be done
- Could use the submit event on the form to call the submit action?
- Could memoize the function based on things used in it?  Hard to generate?

Problems
--------

- Having a function in the state is tricky - if it is generated in every render, it will cause continuous updates, if it is not it will not be able to use other state
- So - can wrap in useCallback, need to know its dependencies, but those are picked up by parsing already

Decisions
---------

- Form has keyAction (like other elements) and also submitAction
- Key action can use $event
- Elements inside a form can use $form
- Form state object has a Submit function
- Submit function can have an argument passed to it, appears in $data
- Submit action can use $form and $data
- Generate ALL actions with useCallback, which should help rendering generally


