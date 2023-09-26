Action formula steps and results
================================

Aims
----

- Solve problems commonly found in update actions

Needs
-----

- Actions may involve several separate calls
- Calls will often return promises
- May need to wait for some actions to complete before starting others
- May want to use the results of one call in another (eg id of inserted db item)
- May want to choose what to do based on the result of an action

Forces
------

- If wait for promises, the action formula will need to be an async function
- Do not want this for calculation formulas as cannot handle promises
- May want to run action steps in parallel for performance

Possibilities
-------------

- Can separate actions into individual steps in editor
- Optionally assign the result of a step to a name
- Make this similar to steps in a calculation
- Named results are all done first, waiting for each, then others in parallel
- Optimise later by analysing which results used and where
- Stopgap by allowing await in action expressions, and making async if found

Decision 28 Sep 23
------------------

- Spike allowing await
- Backlog item to have better formula editing