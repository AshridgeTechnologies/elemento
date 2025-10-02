Auto State 2
============

20 Oct 2025

Aim
---

- To go even further in making using auto state easier.
- Support the Elemento code-generation style with destructuring
- Help with debugging

Needs
-----

- Avoid needing to use latest() in lots of places
- Enable functions to be pulled out in destructuring and still work
- Ensure React works correctly when state objects are passed as properties (treated as value objects)
  - which means each version is a new object, but the same object until the version changes
- Ensure React works correctly when state object functions are passed as properties (eg for action functions)
  - which means each version gives a new function, but the same function until the version changes
- Make state objects easier to write
- Acceptable performance in browsers

Forces
------

- Quick timing tests show overhead of proxy getter is ~20ns per call - so probably ok, esp if destructure at start of function
- State objects may still need to init instance and/or version
- Desired usage is to destructure properties and functions into local vars at top of component function
- The functions need to be bound to the state object
- Will pass action functions to other components as props
- Will destructure child state objects as properties of the state object
- When rendering will always have the latest version
- Functions obtained in render function may be passed directly as action props OR possibly in closures
- Functions called later must always act on the latest version
- BUT will the component always have been re-rendered if the version has changed?
- May have passed the function to something outside React
- State object functions may reference child objects
- SO they must always be called with the proxy as this
- In Elemento generated code for user-defined components, state objects don't have state - must use Data elements
- But in built-in state objects there is state - and want to unify components
- Could have non-immutable state objects if notified their associated element when changed,
- BUT if the state object was passed as a property, the instance needs to change to ensure a re-render
- Immutables may give other advantages like time travel debugging
- For low-code users, Set(MyData, newValue) may be clearer - and reinforces the no-assignments principle

Possibilities
-------------

- Use the proxy to get the latest version for any function call?  How work in actions, other functions, etc?
- Getting proxy via a function on any state object, not in the init?
- Bound methods come from proxy
- Get all the props and functions you need from a call to state.proxy()
- If init not returning proxy, do everything in ctor
- Store proxy in state object?
- Always return proxy from either app state store OR the app state hook, or a choice of plain or proxy
- If proxy is always the same instance for each version, would work like underlying object in property comparison
- If bound functions were always the same instance for each version, would work in action properties
- Proxy could wrap functions for debugging
- Proxy does most of what BaseComponentState does
- AppStateObject interface is in proxy, not state object
- The state object doesn't need to be immutable, but the Proxy must be a new instance every time it is updated

Plan
----

- Go back to always using a proxy
- Proxy created by app state store
- Proxy stored in each version of the state object, so always the same instance
- Proxy gets child state objects direct from the store
- Proxy gets functions and binds them to work with the proxy as this
- Proxy caches bound functions for each version
- Proxy always calls the function on the latest version in the store
- The getChildState and _boundMethods functions go from BaseComponentState
- BaseComponentState no longer has the App State Object
- Can get original from Proxy - should store or state object do this when calling init?
- May no longer need AppState Object
