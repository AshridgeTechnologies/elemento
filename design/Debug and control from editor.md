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


Possibilities
-------------
- Can pass through app store hook in runForDev
- Editor sends component id, function, params via service worker postMessage
- Can start with one-way communication

Decisions
---------

- Re-use app store hook mechanism
- Pass through hook from runForDev, hold current store
- Respond to 'callFunction' messages
- Use component id, function, params from message to call the function
- Rely on the updateState mechanism to update the app as necessary
