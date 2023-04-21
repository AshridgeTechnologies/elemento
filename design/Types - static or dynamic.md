Types - static or dynamic
=========================

Aims
----

- Ensure types can be used flexibly and intuitively now and in the future

Issues
-----

- Whether types are only available for code generation, or also at runtime
- Whether types are first-class objects that are created at runtime
- Whether types can be created dynamically using values not known at design time
- Whether types can be the result of expressions where they are needed, rather than defined separately

Forces
------

- In situations like forms based on types, code generation _may_ be clearer than doing it in code
- If types are attached to input components, a simple inline expression to create a type may be easier than defining separately
- Types as first class objects fits with Zod
- Validation based on other data values (eg a set of names entered elsewhere) can _only_ be done at runtime