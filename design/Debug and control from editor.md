Debug and control from editor
=============================

Aims
----
- Editor can get state and other information from the app running in preview mode
- Editor can change state and other aspects of the app running in preview mode
- Just the communication mechanism here - editor UI to be decided later

Needs
-----
- Editor can get the state of any component in the _main_ preview app
- Editor can update the state of any component, in all previews
- Editor can run commands on any component state (initially just refresh), in all previews
- May include the existing highlight component functionality

Forces
------
- Service worker postMessage established as a communication path
- AppRunner may be a natural point to do this
- Access to the state may be all that is required
- StoreProvider already has a hook for testing that it sets the current app store in
- App is running in a separate window to editor, so objects need to be cloneable, and contain type id
- For some devs, debugging in browser dev tools would be useful


Possibilities
-------------
- Tracing with argument values can be switched on in all of our functions
- Can pass through app store hook in runPreview
- Editor sends component id, function, params via service worker postMessage
- Can start with one-way communication
- Include element id from which code generated in comments
- Preview inserts debugger statements 
- Generator inserts debugger statements
- Actions log the parameters they were called with
- Data elements have a type, validate the value they are given - maybe use in code
- In multiline actions/expressions, separate the definitions from the actions/result, show without executing
- To debug in browser tools, couls use the latest cache-busted import in the sources list
- If use script element instead, could recreate with a debugger statement at the start so it stops when runs and can set breakpoints

Decisions
---------

- Re-use app store hook mechanism
- Pass through hook from runPreview, hold current store
- Respond to 'callFunction' messages
- Use component id, function, params from message to call the function
- Rely on the updateState mechanism to update the app as necessary
