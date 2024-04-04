Timer element
=============

Aims
----

- Developer can make things happen in an app based on time elapsing

Requirements
------------

- ✅ Timer element - stateful UI
- ✅ Shown by default
- ✅ Simple UI that shows time elapsed in seconds to 2dp
- ✅ Input properties: Period, Interval - default to animation frame interval
- ✅ Methods: Start, Stop, Reset
- ✅ Output properties: Start time, ~~End time~~, Elapsed time, time remaining, interval count, IsRunning, IsFinished
- ✅ Interval action
- ✅ End action - called when reach Finish time, not when call Stop
- ✅ Start when running or Stop when not running have no effect
- ✅ Reset when running Stops as well

Technical
---------

- Use requestAnimationFrame to schedule checks
- Work out when an interval is due and trigger actions
- Store interval count, if intervals elapsed is greater, trigger an interval

Test
----

- ✅ No period
- ✅ No fixed interval
- ✅ Period not a round number of intervals
- ✅ Stop
- ✅ Stop and Start again
- ✅ Stop and Start again with period
- ✅ Reset
- ✅ Reset while running
