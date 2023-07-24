React imports
=============

Aims
----

- Make React available in flexible ways wherever it is needed
- Avoid having two copies of React in the page
- Reduce bundle sizes

Forces
------

- Two copies of React is not just inefficient - it doesn't work
- Editor needs React
- Tests need React
- Running apps need React
- Running apps may be in their own window
- Running apps may be included in another App
- Running apps may be within the Editor eg Tools
- So - Generated code needing React may be in the same environment as bundled code needing React
- Forcing Apps to always be in their own window/iframe is cumbersome and inflexible
- Keeping React out of our bundles and coming from a CDN would save bandwidth on our servers and speed up builds
- Import maps work only in latest browser versions
- Downloading React from a CDN in testing could be very inefficient
- Also needs to work in node for testing

Possibilities
-------------

- Use import maps and accept it not working sometimes
- Import React from our own separate module outside the Editor and runtime bundles
- Use dynamic imports in the React module, with different sources for different environments
- Set React as a global and use that if present, otherwise dynamic import

Spikes
------

- Try importing React from a different module
- 