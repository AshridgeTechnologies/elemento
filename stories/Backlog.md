Elemento Backlog
================

Bugs
----
- Changes really slow on large list
- Select element in page has stopped working
- DateFormat blows up on some bad values eg a string
- Studio: Show errors in server side apps
- Big error storm in preview when load app that uses firebase config
- Asks for login to gapi on every keystroke when a Firebase Publisher exists
- Studio: Show errors in server side apps
- Clear preview and state when load new app
- Dependencies error while editing blows up editor
- No code generation error for unknown name in text element
- Editor height styles allow property panel to be larger than container, so page scrolls up


Stories
-------

### WebContainer server
- Serve preview from WebContainer
- Serve server apps from WebContainer

### Move to GitHub
- Deploy from GitHub
- Can use private GitHub repos
- Handle merge conflicts
- Functional test covering Get and Update - and others

### Priority for customer-facing apps
- JavaScript functions
- Payments
- API calls from browser
- External API calls (eg for webhook)
- Styling
- Email
- Uploaded files
- Web file datastores

### Priority for internal apps
- Types (consider Zod, ArkType)
- Validation
- Model-driven components (consider zorm and other Zod integrations)
- Firestore access rules

### Priority for education and games
- Event actions
- Shapes, drawing, animation

### Priority for learning
- Tutorials
- Example apps

### Priority for credibility
- Security review
- Revision aid example
- E-commerce example
- Admin app example
- Demo Experience Part 1

### Priority for usability
- Runtime error and notification handling
- General usability Part 2
- Debugger Part 1
- Preview improvements - screen size, scrolling, etc

### Priority 1
- Export working copy to directory - or zip?
- Import working copy from directory - or zip?
- Add deferred desirable features from previous stories
- Google Sheets datastore
- Formula improvements Part 3
- Read-only calculations
- Complex calculation entry
- Embedded apps

### The Rest
- Slick quick apps
- CSV file datastore
- Tutorial Hello World
- Tutorial Real World 1
- Tutorial enhancements Part 1
- Validate App Model loaded from JSON
- Load time optimisation
- Splash screens - editor and app
- Back and forward in Help
- Links in Help (use to sync contents to position)
- Search in Help
- Highlight in Help
- Persistent help position
- Editor deep links - use in help examples
- Save and load project on apps website
- List apps

Epics
-----

- Interactive tutorial

Tech debt
---------

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
