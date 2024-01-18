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

Forces
------

- Submit actions should work like Button actions
- Sequence with await allows two things: guard conditions and fetching async values to use later in the action
- If Reset a form then change page, not important

Possibilities
-------------

- In submit action, await each step and jump out if error
- Submit error action in form
- Auto add submit errors to form errors
- Submit success action
- Auto reset on success of submit
- All steps in any action are done in parallel
- All steps in any action are done in sequence with await
- Actions return a promise
- Have a special mechanism later for doing in parallel if really important

Decision - first stage
----------------------

- Generate submit action as an async action, awaiting all statements in sequence
- Extend this to all actions
- When the submit action completes, Reset the form
- When the submit action fails, add any exception message as a general form error
