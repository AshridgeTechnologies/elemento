Git merging
===========

Aims
----

- Make merging contributions from multiple collaborators safe (essential)
- Make merging contributions from multiple collaborators easy and flexible (desirable)
- Allow working with external Git tools as well

Needs
-----

- Pulling from Git to a local working copy never leaves it in a corrupt state
- Merging gives the most sensible result when there are both local and remote changes
- No manual editing of text files is needed (but can still be done externally)

Possible future needs
---------------------

- Show a three-way comparison of two trees and allow to choose and edit individual changes from either side

Forces
------

- Git allows separate fetch and merge, so can check for conflicts before 
- Isomorphic git allows providing a merge resolver
- Isomorphic git allows aborting merges with conflicts
- Can copy part or all of the tree and manually compare - but tedious

Possibilities
-------------

- Do an object merge rather than a line by line merge
- If conflicts detected, warn user and ask whether to abandon, or which side to prefer
- Write a backup file before the merge if there are conflicts