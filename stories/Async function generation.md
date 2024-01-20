Async function generation
=========================

Aims
----

- Allow client side actions to use and await async function calls
- Improve client side form action handling
- Refactor and align client and server side code generation

Requirements
------------

- ✅ Generate all client side actions as an async function, awaiting all statements in sequence
- ✅ Ensure when one action calls another it is awaited eg Button calling Form submit
- ✅ React does not emit errors about async functions in useCallback
- ✅ Form.Submit returns a Promise
- ✅ When a form submit action completes, Reset the form
- ✅ When the submit action gets an error result, add the error message as a general form error
- (Check) Validation errors thrown in Server app functions are shown on client
- ✅ async (or any) function calls can be used as arguments to If and not called until needed
- ✅ Server side JavaScript function bodies are generated correctly and are async
- ✅ Server side JavaScript query functions can be multiline
- ✅ Generator and ServerAppGenerator getExpr functions are as similar as poss

Further requirements
--------------------

- Maybe: When the submit action throws, add any exception message as a general form error
