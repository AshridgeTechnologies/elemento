Immediate update with Set(Data)
-------------------------------

Aims
----

- Make it easier for developers to understand and use how Data and Set work

Needs
-----

- Make the new value available immediately in subsequent expressions in an action, _and any other functions it calls_

Forces
------
- Most peoples' mental model is that as soon as you have Set a value in a Data element, you can use that value
- We hide asyncery everywhere else as far as possible
- It leads to hard to find bugs
- It leads to complicated workarounds
- Immediate set is not in the spirit of FP, but our audience doesn't care about that
- Any other workarounds like SetImmediate or WaitForUpdates are nearly as bad - will usually be forgotten


