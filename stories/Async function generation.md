Async function generation
=========================

Aims
----

- Allow client side actions to use and await async function calls
- Improve client side form action handling
- Refactor and align client and server side code generation

Requirements
------------

- Generate all cliebnt side actions as an async function, awaiting all statements in sequence
- Ensure when one action calls another it is awaited eg Button calling Form submit
- When a form submit action completes, Reset the form
- When the submit action fails, add any exception message as a general form error
- Generator and ServerAppGenerator getExpr functions are as similar as poss
- Server side JavaScript function bodies are generated correctly is use await
