Unified components
==================

30 Sep 2025

Aims
----

- Make built-in components, user-defined components and third-party components all usable in the same way
- Elemento components can be exported and used in any other app
- Elemento projects can be built and served by Vite using a plugin

Needs
-----

- A Project contains a set of components
- App and Page are just components
- User-defined components are also just components
- Each component produces one code file
- Each component is edited separately
- Any component can be previewed individually
- Component input properties can be set for the preview
- Mechanism to run a component as a top-level app
- Existing page routing still works
- Elemento standard components can be imported
- Third-party components can be imported
- Components can be exported
- Code generation available as an API
- Vite plugin to transform Elemento components into code files during build

Forces
------

- Should probably be done after auto-state
