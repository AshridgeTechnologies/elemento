Timers and animation
====================

20 Mar 2024

Aims
----

- Developer can make things happen in an app based on time elapsing
- Enable simple animations of screen elements

Needs
-----

- Can use time (of some sort) in formulas
- The formulas are re-evaluated and screen updated when the time changes
- Updates are frequent enough for continuous animation
- Updates are no more frequent than necessary
- Efficient enough to work on low-end devices
- Help the developer with common calculations such as time elapsed since a start time
- Do actions at the end of a period or at intervals

Forces
------

- The requestAnimationFrame method seems most efficient

Possibilities
-------------

- Have one app-wide timer that updates the current system time on every animation frame
- Timer element that checks itself every animation frame
- Timer State that is part of app state and updated when needed
- Timer Input properties: Timer period, interval
- Timer methods: Start, stop, Reset, restart
- Elapsed time property, time remaining property, interval count property
- Get system time with another function
- Interval action
- End action
