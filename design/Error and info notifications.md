Error and info notifications
============================

Aims
----

- End users know what errors and successes are happening in the app
- No confusing blow-ups or error messages
- Developers don't need to worry too much about error handling or async

Needs
-----

- Errors are handled cleanly and automatically
- Errors are notified to the user automatically
- Errors are handled in async and sync actions
- Dev can choose to notify success and other info messages
- Info messages are sent after async actions have succeeded
- UI notification mechanism is modern, non-blocking, controllable by the user
- UI notifications can handle multiple outstanding messages

Forces
------

- Many standard functions are async
- In multi-step actions, async steps may be in the middle
- May want to assign the result of an async function to an intermediate var and use later eg Get result used in update
- Only actions can be async on client side
- In server side apps, may want async expressions as well as actions
- Error handling is complex for users
- Error handling is pretty standard - catch and notify
- Errors may happen in actions
- Programming errors may happen in calculations
- Don't want to wrap every simple expression in an error catcher
- Don't make it hard to implement new components by adding responsibilities
- Success notifications should only be sent after async steps have succeeded
- Pending returned from Get on collection, not a promise
- Other Collection functions could be async, currently return void
- Need a way of knowing which functions are async
- Need to decide where to insert await and async during code gen
- User-defined functions could also be async


Possibilities
-------------

- Change AST during parsing to insert async and await
- Insert as text during generation
- Move to using builders for generation
- Pending value could be a promise as well
- Wrap all actions
- Have a React error trap that notifies errors
- Return a Working... message from an action, in the Promise object wrapper
- Have a second pass to add async/await

Initial design - 21 Jul 22
--------------------------

- Detect async functions by AsyncFunction constructor
- Mark other functions returning a Promise by adding an async property - may use a decorator
- Transform call expressions using these functions to await expressions while parsing the AST
- Make user defined functions async if they include any awaits
- Make action functions async if they call any awaits
- Wrap actions in handleResult function, which:
    - shows working indicator if gets a promise
    - shows success indicator when the promise resolves
    - shows error message when the promise rejects
    - shows success indicator if gets immediate result
    - shows error message if catches error
- App has a notification slot in its state, with message and type
- Use Snackbars at bottom left, containing Alerts, to show messages


Possible later improvements
---------------------------

- Pending object acts as a Promise, functions that return it eg Collection.Get are marked as async, can be used in actions
- Pending object has a description of the work in progress
- Error boundary around each page to avoid blowing up whole app
- Reset state of everything on that page to continue
