EditorRunner refactoring
========================

Aims
----

- Make Editor Runner and associated classes more maintainable
- Improve test coverage
- Make adding new functionality easier
- Allow more future flexibility in Editor configurations

Needs
-----

- Make non-GUI functionality easily testable without DOM
- Dialogs share common code
- Each chunk of functionality eg Get from GitHub moved to own file
- Reduce repetition and "chained changes" through Editor, AppStructureTree etc

Forces
------

- Dialogs all quite similar (and should be)
- Dialogs all collect info then perform an action
- Dialogs need to present info from state
- Dialogs may validate info entered

Possibilities
-------------

- Form state with "binding" to elements
- Use timestamp to cause re-render if state object mutable
- General show/close dialog functionality
- Use a forms library
- Overall editor state object
- Editor state is a facade for the project handler, local store, GitHub etc

Example: Get from GitHub action
-------------------------------

- GetFromGitHubDialog is just UI over a state object
- GetFromGitHubDialogState:
  - should share file with UI component
  - is unit tested separately
  - has a timestamp for changes
  - is passed as a prop to UI along with timestamp to get re-render
  - has the overall state passed in
- EditorState:
  - facade for project handler, local project store, GitHub project store
  - passed in to EditorRunner
  - has timestamp for changes
- Common Dialog
  - has title, fixed content as props
  - can have children
  - can have actions
  - handles onClose automatically