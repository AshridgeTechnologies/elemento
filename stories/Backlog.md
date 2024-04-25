Elemento Backlog
================


Bugs
----

- P1: Inspector kills app by trying to evaluate CurrentUrl().page in the page when have an element using that in a formula in the app bar selected
- P1: Inspector kills app by trying to evaluate JavaScript function calculation
- P1: Inspector eval (usually) fails if not displaying the page whose element is selected, as the required functions and elements are not in scope
- P1: Runtime errors give no clue that they have even occurred, let alone where or what
- P1: Code generation can fail if start line with brackets and no semi-colon on prev line, in addReturnStatement eg CleanPunctuation
- Uploading file does not copy to client files
- Formula error in app bar kills the preview
- Still occasional failures to build the latest version - one missing char
- Preview cannot reload named pages - service worker gives 404
- Runtime blow-up if dereference null in formula
- TrueFalse readOnly does not work
- Vertical layout with text and button shows only the top few pixels
- Form can contain things that cannot be reset like Calculation, Button
- Calculation: cannot refer directly to properties of value in expressions, so this doesn't work:
  - `const Booking = Elemento.useObjectState(pathWith('Booking'), new Calculation.State({value: MainServerApp.GetOwnBooking(BookingId)}))
    const StartDate = Elemento.useObjectState(pathWith('StartDate'), new DateInput.State({value: Booking.StartDate}))`
- ListElement errors if items is null (as it is with a pending result)
- Memory leak in Studio - probably the number of versions of code (try changing export to return a pseudo module and using Function)
- Fails to check out private project from GitHub - unauthorized
- Errors in server app calls (and elsewhere?) not caught and show React error message instead of app
- Update or download from GitHub is very slow on -Beetle1- (maybe open in two places - or old runtime files)
- No feedback or disabled buttons while awaiting GitHub operations 
- Files not showing up in Files Folder on -Beetle1-
- Loads 3 new versions of app when you select an item in navigator (only when deployed?)
- Duplicate names create errors on action function names
- Changes really slow on large list
- Initial value not showing on Number input
- Errors can kill Editor
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
- Can refresh app after navigating to page
- Can't type date into property field


Stories
-------

### Run and deploy
- Server app containers
- Shared preview and admin service

### Priority for admin apps
- Server app features
- Validation improvements
- Email
- Uploaded files
- Type expressions
- Autocomplete text box
- File upload and storage
- Complex queries, criteria input via forms
  - Partial string match, multiple values in field, number ranges, date ranges
- Generating documents - pdf, docx - jsPDF? HTML to PDF or direct PDF gen?  Print CSS?
- Tables - including different row contents?  - consider react-data-grid
- Multi-level reports
- Ability to print any of the above
- Scheduled jobs - from uptime checker?
- Backup - and also use for reporting

### Priority for learning Elemento
- Formulas tutorial
- Help up to date
- Tutorial and general improvements
- Server apps example
- Data types guide
- General showcase example - with all features
- Other how-to guides
- Look into using driver.js
- Gamification

### Priority for customer-facing apps
- Payments
- API calls from browser
- External API calls (eg for webhook)
- Web file datastores

### Priority for education and games
- Horizontal list
- Freeform list, generated from a list, with positions set by data
- Event actions: double click, drop
- Speech synthesis
- Shapes, drawing, - clip-path, svg?
- When condition actions
- Multi-user shared data
- Card game assets - eg https://www.revk.uk/2018/06/svg-vector-playing-cards.html

### Priority for credibility
- Elemento favicon - https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
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
- Complex formula editing - auto format on separate lines where it helps eg for nested function calls
- Inspector Part 2
- General usability Part 3
- Preview improvements - screen size, scrolling, etc
- Search in project - consider Fuse.js

### Priority 1
- More styling options work on SelectInput
- True False input can be made to be not valid unless checked
- Consider way of getting domElement of any ui Element (including stateless) for special stuff - but encourages bad practices?
- Check out FedCM change
- Resizable panels in Editor - https://react-resizable-panels.vercel.app/
- New datepicker and range picker: https://reactdatepicker.com/
- HTML files served as is from hosting for static pages
- HTML generated by server functions - also other types of file eg image
- DataType rules can show cross-field rules against a particular field 
  - OR field rules can refer to object 
  - OR dynamic DataTypes that change depending on another value - most flexible
- Any calculation can be fixed, formula or JavaScript
- Any formula can have intermediate values, client or server
- ShowDialog to show a Page or Form in a modal dialog
- Extension auto-loads latest code from git repo via CDN
- Single copy of expressUtils between two projects
- OPFS file store
- SQLite WASM data store
- SQL or IDB table creation and updating from Data Types
- Import and export to/from data store - esp browser
- Better queries
- Database and data sync review - consider RxDB, CRDTs, etc
- Tools can do deployment - parameters, access to project, GitHub, etc
- Tools can use data read from Editor and Preview
- runtime published and documented - see https://hexagon.56k.guru/posts/dual-mode-cross-runtime-packages/, https://advancedweb.hu/modern-javascript-library-starter/
- Scheduled jobs
- Rich text
- Readonly elements - for all types and styled clearly
- Form improvements - buttons enabled, validation, mods shown, form rules shown in position
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
- Calendar control - consider https://github.com/williamtroup/Calendar.js
- Form-level Rules display message - at the position where they occur in the form
- Clean old files from generated code dir

### The Rest
- Choice component to generate one of children based on condition OR a condition prop on every component?
- Tools can be included or excluded from deployment
- Server side HTML generation using same or similar elements as on client
- Show element notes when hover in navigator
- Table of Contents
- Slick quick apps
- CSV file datastore
- Tutorial Hello World
- Tutorial Real World 1
- Tutorial enhancements Part 1
- Validate App Model loaded from JSON
- Use all input types and attributes
- Load time optimisation - eg https://www.macarthur.me/posts/priority-hints
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

- Cannot upgrade MUI as slotProps.backdrop not available
- PropertyEditor test really slow on some tests
- Improve jsdom test performance = try happy-dom
- Improve PW testing - eg https://www.checklyhq.com/blog/track-frontend-javascript-exceptions-with-playwright/
- run.css - needed?  where from?- Copying layouts does not change names of contents
- Look at https://gist.github.com/khalidx/1c670478427cc0691bda00a80208c8cc
- Remove barrel files: https://marvinh.dev/blog/speeding-up-javascript-ecosystem-part-7
- Check for dodgy RegExp - see https://www.sonarsource.com/blog/vulnerable-regular-expressions-javascript
- Remove Download from GitHub to new directory
- Remove window.setProject/getProject - replace with OPFS?
- Builder/runner: 
  - Generator does not hard code runner location
  - ProjectBuilder only writes updated files
  - runPreview only refreshes code if a file in its path is changed
- Use radash wherever possible, try to remove lodash
- Consider replacing state management with self-updating immutable objects using Immer, maybe Proxies, useContext and useReducer
- Consider Temporal
- Upgrade date-fns v3
- Consider TinyBase
- Consider escodegen in generator
- Latest yarn
- Remove initialProperties
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
- Menu improvements
- Startup Action
- Tools
- Move Help to a Tool
- Data Types example app
- Automatic open from GitHub
- Help Content and Presentation
- Priority improvements
- Move examples to separate repos
- New Run page can enter and run an app from GitHub or local projects
- New Learn page with links to Help, Guides and Examples
- Server apps guide
- App user management
- Improved runtime notifications
- Tutorial and general improvements - Part 1
- Replace FirebasePublish with a Tool, remove actionDefs, project passed to PropertyEditor
- Styling
- User defined components
- Block element
- Timer element
- General object adapter

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
- Fix run from GitHub
- Insert menu can overflow the page
- Copy/Paste not working
- Cannot load project from Git if files dir empty, and Git does not commit empty dirs
- Menu on Studio etc not working
- Shows Objects are not valid as a React child (found: object with keys {description, errorMessage}) when server call fails
- Authorization header not sent with server app get requests
- Dates in data from server app function are left as ISO strings
- Async Startup action causes error (as useEffect tries to call the Promise)
- Multiple EditorControllers listening, causing effects such as Show me clicking and typing not working correctly (being called twice)
- Menu button Show me shows all buttons
- Service worker no longer serves files after being woken up (dirHandle lost)
- Writes and preview updates get out of order - latest change sometimes does not show in Preview
- Previews are mixed up if open two projects in different tabs
- Does not show preview on new project - sw gives 404 - until reload frame
- $item functions have await inserted but not async before eg ForEach(newWords, Add(Words, $item));

