Form Submit behaviour
=====================

Aims
----

- Simplify development of expected form behaviour

Needs
-----

- Know whether a form can be submitted
- Wait for an async submit action
- Reset the form if submit OK and staying on that form
- Go back or to another page if submit OK and not staying on that form
- Stay on the form without reset if the submit is not ok
- Show errors from the submit action in the form
- BUT is there a standard way of returning errors?
- AND should catch as many errors as possible on client side
- Errors from submit action may be general or for specific fields
- Keep flexibility in use of forms

Possibilities
-------------

- In submit action, await each step and jump out if error
- Submit error action in form
- Auto add submit errors to form errors
- Submit success action

Decision - first stage
----------------------

- Generate submit action as an async action, awaiting all statements in parallel with Promise.all
- Consider extending this to all actions
- When the submit action completes, do Submit Success action
- When the submit action fails, add any exception message as a general form error
