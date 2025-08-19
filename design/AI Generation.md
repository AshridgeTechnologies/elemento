AI Generation
=============

13 Aug 2025

Aims
====

- High-level outline of the steps to enable LLMs to generate Elemento apps

Needs
-----

- Provide all definitions, documentation and other materials to enable LLMs to "understand" Elemento
- Develop suitable prompting techniques to create workable Elemento apps
- AI generated apps must be comprehensible to human developers
- Round-tripping - AI generation, human adjustments, more AI generation incorporating the adjustments
- Allow for including additional components
- Allow for different target languages, frameworks and generators in the future

Materials
---------

- Model schema
  - Project
  - Common base schemas
  - Each component's schema
  - All constraints eg canContain
- Element reference
- General description
- Guides
- Examples

Forces
------

- Model objects are very boilerplate-y
- Generating definitions from the runtime component would be most flexible
- Need to incorporate the constraints on what components can be contained where
- Need to know where third-party components can be contained
- Third-party components would not have documentation to enable good schema generation
- BUT all third-party components would need a wrapper to be used in Elemento


Issues
------

- What should be the original source of truth about a component? Runtime component Typescript? JSON schema?
- How do you allow a schema/definition to have different components in every project?
- If generating schemas from TypeScript, how do you make them available for use in Elemento project schemas

Possibilities
-------------

- Write JSON schema manually
- Convert existing model objects to schema
- Convert Elemento runtime objects to schema
- Generic wrapper and/or pattern and/or generator tool for any React component
- Generate model object from JSON schema
- Generic model object that works off a JSON Schema
- Separate JSc for each component, import ones needed into a project
- SO there might be a specific schema for each project
- Project and BaseElement model objects still do most of the work, as now

Decisions
---------

- Require a JSON Schema for each runtime component's properties
- Consider a Zod validator to generate this and validate the component props
- Use schema in generic model object that extends BaseElement
- Generate docs from the schema

Tasks
-----

- Create first schema
- Generic model object
- Documentation generator
- Schema generator

Generic model object
====================

Possible approaches
-------------------

- Proxy
- Adds own properties
- Generates and caches a class from the schema

Decision
--------

- Spike with adding own properties
- Evolve to generating a class - can name class, properties and functions, most efficient
