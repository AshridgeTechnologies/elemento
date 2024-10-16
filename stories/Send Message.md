Send Message
============

Aims
----

- Allow communication between different apps running in the same browser 

Requirements
------------

- A SendMessage(targetName, data) function generally available
- The targetName param is the relative window ref eg 'parent' or 0, 1 etc for sub-frames
- The data is anything
- App has a Message Action property
- The action is triggered when a message is received
- The action has params $sender, $message 
