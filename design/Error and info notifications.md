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
- Only actions can be async
- In server side apps, may want async expressions too
- Error handling is complex for users
- Error handling is pretty standard - catch and notify
- Errors may happen in actions
- Programming errors may happen in calculations
- Don't want to wrap every simple expression in an error catcher
- Don't make it hard to implement new components by adding responsibilities
- Success notifications should only be sent after async steps have succeeded
- Pending returned from Get collection, not a promise
- Other Collection functions could be async, currently return void
- Need a way of knowing which functions are async
- Need to decide where to insert await and async during code gen
- 


Possibilities
-------------

- Change AST during parsing to insert async and await
- Insert as text during generation
- Move to using builders for generation
- Pending value could be a promise as well
- Wrap all actions
- Have a React error trap that notifies errors
- Return a Working... message from an action, in the Promise object wrapper
