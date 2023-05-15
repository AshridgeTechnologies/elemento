Preview hot reloading
=====================

Aims
----

- Make the developer experience feel easy and "live"

Needs
-----

- Preview updates automatically - no "update now" button
- Preview updates quickly - no lag when resizing or changing text
- Keeps app state through reloads
- Browser resources are not exhausted after a long dev session
- Can use Chrome debugger if needed

Forces
------

- Import caching cannot be overridden
- Chrome debugger sources hold every version of cache-busted dynamic import
- Chrome debugger will only rarely be used
- Breakpoints only work in the latest version
- App sources could easily be 100k+, so typing 10 chars would add 1Mb to browser memory page footprint
- Script elements can import modules, but they cannot export in the normal way

Possibilities
-------------

- Look for unnecessary updates
- Reduce app source size - would be better anyway
- Don't update after first invalid version
- Throttle updates
- Update only when leave a field you are editing (what about immediate feedback on color, size?)
- Update after a period with no action (1-2 secs) - tell the user what is happening
- Use script elements instead of cache-busted imports (will that use less memory?)
- Generate slightly different code for preview
- Generate same code, have a function to process modules in preview
- Find how much memory being used and reload the preview when gets too big
- Serialize the state before reload and restore after
- BUT - it may not be as big a problem as you think

Decision - 14 May 2023
----------------------
- Do performance tests first to find out how serious the problem is!

