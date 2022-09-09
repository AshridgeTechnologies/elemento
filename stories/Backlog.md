Elemento Backlog
================

Bugs
----
- Clear preview and state when load new app
- Select in copied page selects the corresponding element in the page copied from
- Dependencies error while editing blows up editor
- Select does not respond to alt-click to highlight
- Escape quotes in Javascript string literals
- Editor height styles allow property panel to be larger than container, so page scrolls up


Stories
-------

### Priority 1
- Firestore data storage
- Revision aid example
- New publishing
- Demo Experience Part 1
- Runtime error and notification handling
- General usability Part 2
- Security review

### Priority for customer-facing apps
- Server apps
- JavaScript functions
- Payments
- API calls from browser
- External API calls (eg for webhook)
- Styling
- Email
- Images
- Assets - eg image files
- Web file datastores

### Priority for internal apps
- Server side functions
- Types
- Validation
- Model-driven components
- Firestore access rules

### Priority 2
- Firebase deploy Part 2
- Google Sheets datastore
- Formula improvements Part 3
- Info website update
- Read-only calculations
- Complex calculation entry
- Debugger Part 1
- Preview improvements - screen size, scrolling, etc

### The Rest
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

- Investigate Signals https://github.com/preactjs/signals
- Fix all uses of constructor.name
- Code generator
- Introducing new components
- DOM Testing
- Script environment creation
- Refactor runApp.ts and unit test
- Unit test highlightComponent
- Use React.StrictMode in some tests that do not need sign-in
- Review Generator.initialStateEntry vs generateElement
- Mechanism for generating defaults, state and properties code from model object - mark as stateful?
- Upgrade Parcel - babel _typeof error in prod build after 2.3.2


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


Bugs fixed
----------

- Frequent failure with app._data
- Rendering/update loop between different sites of initialising app state
- Dates being stored as timestamps
- Refresh page after change to ensure all changes picked up
- Same List name in two pages creates duplicate list item
- Stops updating preview sometimes
- Performance: deferred updates repeatedly update store in a loop
