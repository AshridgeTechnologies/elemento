Import modules
==============

Aims
----

- Dev can use functions in files attached to the project
- Dev can use functions imported from elsewhere eg CDNs
- Prepare for importing components in the future

Requirements
------------

- ✅ Can have JavaScript code modules in the asset files
- ✅ Can have Function Import elements under an App
- ✅ Function Import has a source which can be an asset file or a URL
- ✅ The source is a module with a default export
- ✅ Can use the function in expressions by referring to its code name
- ✅ App must continue to run if import fails, and error is reported

Further requirements
--------------------

- ✅ Use named exports
- ✅ Import all named exports with * and refer to them as ImportName.functionName
- Function imports can be within Pages

Technical
---------

- Generator needs to translate Function Imports into import statements
- Import statements from local files will have the form: import <codeName> from 'files/<source-name>'
- Import statements from external sources will have the form: import <codeName> from '<source>'
- BUT static imports blow up the whole app - need to use a dynamic import, catch errors and return a dummy function
- Check whether runtime needs to be a dynamic import
