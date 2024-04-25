Debugger app level objects
--------------------------

25 Apr 2024

Aims
----

- Decide technical approach for accessing app-level functions and objects in inspector

Needs
-----

- Continuously access CurrentUrl().page
- Debug elements under the app level eg in App Bar
- Evaluate arbitrary expressions that use objects at both page level and app level

Forces
------

- There are two obvious points to put debugging - in the App component and in the Page component
- Confusing for the developer to distinguish between app level and page level objects
- Developer mental model is the current page including the inherited app objects and functions
- Don't need to distinguish in normal expressions as the generator gets app-level state objects automatically
- May use both in the same expression
- Don't know whether objects are app-level or page level
- Can't call useGetObjectState as it will upset order of hooks
- If want to use an arbitrary expression, may need app or global functions or objects that have not been generated into the page
- May need to parse expressions anyway to transform to proper JS - eg expr -> function
- Developer will expect to use Elemento formula language, which allows a few things JS doesn't
- Don't really want debug stuff in the production code anyway

Possibility
-----------

- Debug calls in both Page component and App component
- Get current page from a different hook in the App so know which page you're in
- A state access route that isn't a hook so it doesn't upset React
- Send object paths and get all state properties - but react element props?
- Get app in every Page whether needed or not
- Or get Store from context once in every page, use in debug expr
- Get app by calling useGetObjectState('app') in useDebugExpr
- Try each debug expr in both app and page debug hooks and use whichever works
- Dev does specify where each expression and watch should be eval'ed - page or app
- Debugger sends all the app object names to make available in the expressions
- Have to specify app in an arbitrary expression to use an app object not normally in the page
- When create watch set it to app or page depending on what is selected
- Send path with expression (or a set of) - executed when in scope
- Don't have two debugging points but get all app objects in the Page
- Can add variable declarations to the evaluated code, initialised from the app or from Elemento
- Use Parser in debugger to translate and extract names needed
- Use convertAstToValidJavaScript on the exprs - but don't add return statements
- Parser.parseElement is pretty close to what we need
- Viewpoint: we need to generate a temporary block of code for the debugger
- Generate debug code into the page with everything else
- Update app each time debug code changes - no different to when editing
- Generate a separate version with debug code which is served by the preview
- Generate version with debug code, extract before writing to dist - but would leave extra declarations etc
- Would send debug exprs to editor instead, just receive debug data from preview
- Could be done by existing parser-generator mechanism
- 

Possible plan - Insert debugging code into generated code
-----------------------------------------------------------

- Generate code twice, once to /preview dir
- Git ignore file for /preview
- Service worker serves from /preview if there, otherwise dist
- Before generating to preview, makes a copy and inserts debugData prop to Page containing all the parsed and tweaked data exprs
  - but which page? all?
- All gets quite complicated

Possible plan - generate code for eval
--------------------------------------

- Must be as if it were for use in a separate block within the page component
- Must include all the Elemento and app var declarations
- So assume app in every page - will be in most anyway
- BUT would this mean extra calls to useGetObjectState
- or assume useContext called and store available

Spike 1
-------

- ✅ Add generateStandaloneExpr to Generator
- ✅ Create a Generator in Inspector for each Project update and main app 
- ✅ Use it to generate the standalone debug expr
- ✅ Change the debug expr back to a string on both ends

### Results

- Can't do extra useGetObjectState calls as it upsets the order of hooks

Spike 1 - Part 2
----------------

- ✅ StateStore class that does all of useGetObject etc, given a StoreApi
- ✅ appData has a useGetStore, returns the State Store
- ✅ Generator makes a single useGetStore call in each component, assigns to _store
- ✅ Other calls are done to the StateStore
- ✅ Debug calls also use the _store assumed to be there
- BUT this still doesn't work, as StoreApi makes more hook calls
- ✅ So have a getObject that goes direct to state
- ✅ Use fixPath to change app name to "app"
- ✅ Refactor all uses of other hooks




