Types - various issues
======================

Aims
----

- Ensure types can be used flexibly and intuitively now and in the future

Issues
-----

- Whether types are only available for code generation, or also at runtime
- Whether types are first-class objects that are created at runtime
- Whether types can be created dynamically using values not known at design time
- Whether types can be the result of expressions where they are needed, rather than defined separately
- How types can extend other types
- How types can reference other types, eg as record fields or list element types
- How optionality can be defined

Forces
------

- In situations like forms based on types, code generation _may_ be clearer than doing it in code
- If types are attached to input components, a simple inline expression to create a type may be easier than defining separately
- Types as first class objects fits with Zod
- Zod type structures are not easy to understand and use
- Cannot find any way to get messages for refinements out of Zod types
- Validation based on other data values (eg a set of names entered elsewhere) can _only_ be done at runtime
- Runtime decision about what input fields to create is quite simple
- Optionality is, in a pure view, just another value of the type BUT most people see it as a characteristic of the field where it is used
- A type may be optional in one record type but not in another

Possibility
-----------

- A general Input component, which takes a Data Type, and maybe some props like readonly, and creates appropriate type
- A Form component that takes an Object Type, and creates an Input for each field
- Override and add fields to an object form by adding children to it
- Extend types dynamically by adding constraints
- Elemento-specific runtime type objects, generated from model
- Runtime type objects have a validate() function that may use Zod internally

Decision
--------

- Elemento has a set of simple type definition objects
- The runtime type definitions are similar to the model Type objects
- Runtime type definitions can be created and manipulated in user expressions
- User functions to create type definitions eg for direct use in input validation
- Runtime types have:
  - Type name (kind)
  - Description
  - Optional
  - Rule descriptions
  - Specific properties for the type eg min, max, format - to use in input controls
  - validate(val) function
- Record type has the member types available under the fieldTypes property (items?)
- List type has the itemType
