Save and load app
=================

  - Can open a new app using Open button on menu bar
  - Can save the current app to a file
  - If the file has not been saved, prompt for name
  - Save button on menu bar
  - The filename is remembered after open for subsequent saves and used automatically
  - If the file cannot be read as a valid app, show an error message
  - If the user cancels any open or save request, no exception


To Do
-----

  - Get PW tests running by mocking file picker


Technical Design
----------------

### Preparation
  - Review use of Filesystem Access API

### Load file
  - Editor has onOpen callback provided by EditorMain
  - Use file picker
  - Open the file and try to load as an app
  - Store file handle in EditorMain

### Save file
  - Editor has onSave callback provided by EditorMain
  - If have file handle use it, otherwise show file picker
  - Use file handle to save file
  - Store file handle
