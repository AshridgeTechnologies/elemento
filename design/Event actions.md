Event actions
-------------

Aims
----

- Simple to add actions to common events for novice users
- Ability to use all events available and all attributes of those events for advanced users

Forces
------

- Dealing with React events not HTML events
- There is a straightforward list of events for each element type
- Dealing with events is a slightly more advanced concept
- Will want to update the underlying data in many cases eg to do list, or game with objects
- For a game with objects, probably just use an in-memory data store

Possibilities
-------------

- Set of event action props and property defs in common base component
- Use advanced flag on property def
- Have standard $event parameter to all actions
- Event Actions tab on property editor
- Have a standard mechanism for linking an element to a data item behind it and accessing that in an event action
- Maybe a $id or $data that is passed in and can be used to get an element in a Data containing a Record and act on it
- ListItem has a data-sourceId attribute, get that in event action and make available as $id
- OR - you can just use $item in the event action
