Asyncery
========

24 May 2024

Aims
----

- Design a coherent and consistent approach to handling async calls
- Minimize the number of different components and approaches
- Developers do not have to worry about async calls

Needs
-----

- Handle standalone async functions eg fetch
- Handle objects with async functions eg Editor and Preview Controllers
- Handle promises and observables
- Avoid creating a new component for every async situation eg reading a text file
- Developer does not need generally need to know whether a function is async or not

Forces
------

- Most things are not async
- Don't want to make generated code unreadable and maybe inefficient by scattering awaits and wrappers everywhere
- Developers expect functions to "just work" and update their results when necessary
- Expect a function to work in any property, not just in certain places like Calculation
- Eg If have a GetFileText() function, should be able to call it in the content property of a Text element
- So don't want any built-in functions to be async
- Data functions are async in a way, but they are like the functions of an Adapter
- Having a component just to make a function call is heavyweight
- Can put the call in a Calculation if want to share it
- Importing external components and functions is a reasonable place to introduce an async wrapper
- Maybe reading files is a common case that deserves its own component
- The fetch function is too complex to use directly anyway
- Want to know whether async calls are pending to show spinners etc

Possibilities
-------------

(Some of these are from the Expectations design note)

- Have live expressions that update for observables and promises
- Calculation elements can include functions with observables and promises
- Elemento functions all handle observables and promises
- Replace binary expressions with calls to functions that can handle async
- Make it possible for any expression to include an async value (promise or observable), and update component when they arrive
- Calls to defined Functions update for async values
- Function and component imports are wrapped in Adapter
- Adapter is extended to handle single functions
- Have built-in functions that use Adapter internally and force an update

Decision
--------

- Clever stuff in expressions or built-in functions will lead to unforeseen complications and be difficult to debug
- Don't create any built-in functions that return async values and don't force an update automatically
- The fetch function is too complicated for Elemento devs to use directly anyway
- Getting a file is an important enough case to have a component, or an auto-update function
- Extend Adapter to handle single functions
- Create a GetFile function that uses an Adapter internally




