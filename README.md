Elemento
========

Elemento is a Low-code programming tool that enables people to create software more easily and quickly. 

It is designed to be easily learned by people with no programming experience, but also flexible enough to be used by experienced developers.

It provides a GUI for setting up a simple model of the application.  Specific functionality for calculations and actions is defined by Excel-like formulas.

From the model, code is generated to run the app, based on React.  
The generated code uses a runtime library that provides easy-to-use React components, and state management based on Zustand.

There are two main areas to the codebase:
- The studio - the GUI app for editing apps and previewing them
- The runtime library

This repo also contains the source and deployment scripts for the Elemento Online website.

For more information on the background and aims of Elemento, visit [Elemento Software](https://elemento.software). 

The studio and documentation can be used free at [Elemento Online](https://elemento.online).

Scripts for development and deployment are in `package.json` and the `scripts` directory.