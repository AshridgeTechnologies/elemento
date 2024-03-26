Timer element
=============

Aims
----

- Developer can make things happen in an app based on time elapsing

Requirements
------------

- Timer element - stateful UI
- Hidden by default
- Simple UI that shows seconds elapsed
- Input properties: Period, Interval - default to animation frame interval
- Methods: Start, Stop, Reset
- Output properties: Start time, End time, Elapsed time, time remaining, interval count, IsRunning, IsFinished
- Interval action
- End action

Technical
---------

- Use requestAnimationFrame to schedule checks
- Work out when an interval is due and trigger actions
- Store interval count, if intervals elapsed is greater, trigger an interval
