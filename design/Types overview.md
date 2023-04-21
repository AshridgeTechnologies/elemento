Types overview
==============

Aims
----

- Overall direction for types
- Flexible base for various features based on types

Needs
-----

- Simple way of defining types
- Support simple and complex types
- Not tied to any particular type definition approach
- Support current envisaged needs:
  - Validation
  - Form generation
  - Data persistence
  - API calls and provision
- Flexibility to support future needs
- Can be defined as part of project tree in studio
- Sharing between client and server apps will be a big advantage

Forces
------

- Types are a slightly advanced concept for novice devs
- Some existing type systems are pretty complex
- Easier to add type (or any) features than remove them

Possibilities
-------------

- Convert our canonical types to definitions in a tool like Zod which can then be used in various other tools
- Have "virtual" types that are generated from another source, like OpenAPI


Decisions
---------

- Types are model objects
- They all live under a Types heading in the project for now
- Initial kinds of Type available are:
  - Basic scalar types like number, boolean, enum
  - List types
  - Record types