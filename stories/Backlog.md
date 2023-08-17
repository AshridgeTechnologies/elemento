Elemento Backlog
================

Bugs
----
- Changes really slow on large list
- Initial value not showing on Number input
- Copy/Paste multiple not working
- Select element on preview not highlighting
- Query with MemoryDataStore not updating 
- Query without DataStore does nothing
- Runtime error (eg Sort with function $item => $item.Word.toString() when Word null) blows up preview
- Browser data store fails to add new collection
- With a new browser database, new items added to a collection cannot be selected
- Full review of asset files, multiple dirs, rename, move, GitHub save/update
- DateFormat blows up on some bad values eg a string
- Studio: Stop Objects are not valid as a React child errors when have an object as the only thing in a formula eg a Server App Connector
- Big error storm in preview when load app that uses firebase config
- Asks for login to gapi on every keystroke when a Firebase Publisher exists
- Studio: Show errors in server side apps (just needs a test)
- Clear preview and state when load new app
- Dependencies error while editing blows up editor
- No code generation error for unknown name in text element
- Editor height styles allow property panel to be larger than container, so page scrolls up


Stories
-------

### Move to GitHub
- Deploy from GitHub
- Can use private GitHub repos


### Priority for internal apps
- Type expressions


### Priority for customer-facing apps
- Payments
- API calls from browser
- External API calls (eg for webhook)
- Styling
- Email
- Uploaded files
- Web file datastores

### Priority for education and games
- Event actions
- Speech synthesis
- Shapes, drawing, animation
- Dynamic elements from a list

### Priority for learning Elemento
- Tools
- Menu improvements
- Table of Contents
- Example apps

### Priority for credibility
- Dependency vulnerability review
- Supply-chain review - https://github.com/readme/guides/dependency-risk
- Security review
- Revision aid example
- E-commerce example
- Admin app example
- Demo Experience Part 1

### Priority for usability
- Runtime error and notification handling
- Function editing and validation
- General usability Part 2
- Debugger Part 1
- Preview improvements - screen size, scrolling, etc
- Search in project - consider Fuse.js

### Priority 1
- Scheduled jobs
- Rich text
- Readonly elements - for all types and styled clearly
- Import components from web (GitHub repos or npm) - esm.sh bundling? esbuild in browser?
- Import components with typed property editing
- Import API client component with type property editing
- Firestore access rules
- Deploy multiple versions - for testing, canary deployment and instant rollback
- Add deferred desirable features from previous stories
- Google Sheets datastore
- Formula improvements Part 3
- Read-only calculations
- Complex calculation entry
- Embedded apps
- Handle merge conflicts
- Functional test covering Get and Update - and others
- Cut/paste/export/import data as JSON
- Simple way of opening file datastores

### The Rest
- Slick quick apps
- CSV file datastore
- Tutorial Hello World
- Tutorial Real World 1
- Tutorial enhancements Part 1
- Validate App Model loaded from JSON
- Use all input types and attributes
- Load time optimisation
- Splash screens - editor and app
- Back and forward in Help
- Links in Help (use to sync contents to position)
- Search in Help
- Highlight in Help
- Persistent help position
- Editor deep links - use in help examples


Epics
-----

- Interactive tutorial

Tech debt
---------

- Builder/runner: 
  - Generator does not hard code runner location
  - ProjectBuilder only writes updated files
  - runForDev only refreshes code if a file in its path is changed
- Use radash wherever possible, try to remove lodash
- Consider Temporal
- Consider TinyBase
- Consider escodegen in generator
- Consider a better bundler - esbuild, rspack, Rome
- Reduce size of serverRuntime, consider firebase-admin external
- Look for ways to have imports that update dynamically in preview, both client and server
- Consider using decorators
- Consider oclif for CLI and dev server (or combine them)
- Consider a curl-installed server like firebase-tools standalone
- Revisit user-private - using sub-collections in Firebase is non-portable
- Flaky EditorRunner and AppMain tests
- Refactor Editor etc so could swap in different Editor, outer component generates and previews
- Refactor EditorRunner into visual and project handling parts
- Refactor Editor menu actions to be flexible map
- Consider using useSyncExternalStore to connect to data stores
- DOM Testing consistency, clarity, simplicity
- Untangle shared package into studio and runtime
- Fix all uses of constructor.name
- Generated code with concise fns eg objState(elType, pathEnd, props) and el(elType, pathEnd, props, children)
- Unit testing/refactoring of app frame stuff in editor
- Refactor runApp.ts and unit test
- Unit test highlightComponent
- Use React.StrictMode in some tests that do not need sign-in
- Investigate Signals https://github.com/preactjs/signals
- Investigate the React use hook
- Code generator
- Review Generator.initialStateEntry vs generateElement
- Introducing new components
- Mechanism for generating defaults, state and properties code from model object - mark as stateful?
- Script environment creation


Done
====

- App Studio shows app structure
- App Studio edits Text properties
- Convert App object to and from JSON
- App Studio shows generated app
- App Studio can add new Text element
- Formulas for content expression
- Text Input element
- Formulas using page elements
- Save and load app
- Run app from web
- Basic guided tour
- Initial documentation
- Styling Part 1
- Plain value/formula switch
- Delete element
- Controls and functions Part 1
- Formula improvements Part 1
- App state refactor
- In-memory data storage and updates
- Formula improvements Part 2
- General usability Part 1
- Project and App shown in nav tree
- Apps website
- Refactor EditorMain into component and fix unit test
- Collections
- Insert at position
- List component - display
- File data storage
- Queries in Collections
- Selection in List
- Horizontal layouts
- Fix selection and highlighting
- App frame and Nav bar-menu
- Simple Database example app
- App state refactor 2 
- Drag and drop
- List component - updates and actions
- Date functions and storage
- List filter and map
- User-defined functions
- Copy-paste
- Menu component
- User Logon
- IndexedDB datastore
- Firebase deploy Part 1
- Firestore data storage
- Preview with Firebase
- Server side apps
- Internal navigation and deep links
- Upgrade Parcel - babel _typeof error in prod build after 2.3.2
- Local working copy stored in IDB
- Run from GitHub and CDN
- Update GitHub from working copy
- Get or update working copy from GitHub
- Asset files stored in working copy
- Image component loaded from asset file
- Serve preview from WebContainer
- Serve preview from service worker
- Project directory in disk files
- Simulate server apps
- Speech recognition
- Model types in studio
- Import modules
- Date function
- Input validation
- Form generation
- Date input element
- More math functions like Round, Floor etc
- Precise decimals
- Calculation
- Undo


Bugs fixed
----------

- Frequent failure with app._data
- Rendering/update loop between different sites of initialising app state
- Dates being stored as timestamps
- Refresh page after change to ensure all changes picked up
- Same List name in two pages creates duplicate list item
- Stops updating preview sometimes
- Performance: deferred updates repeatedly update store in a loop
- Escape quotes in Javascript string literals
- Text inputs: jump to end, slow rendering, unusual characters
- Select in copied page selects the corresponding element in the page copied from
- Select does not respond to alt-click to highlight
- Bug: Incomplete Select blows up editor - see file