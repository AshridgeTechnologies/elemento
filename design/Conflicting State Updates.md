Conflicting State Updates
=========================

22 Jun 2024

Aims
----

- Make multiple inter-dependent state changes in an action intuitive

Needs
-----

- Make a situation like this intuitive to deal with:
  - an update Action has this code
  `Move(PlayerPosition, position)
    RandomObstacleMove(RandomPosition('obstacle'), RandomPosition('empty'))`
  - BUT the player position updates the set of empty positions, so the obstacle may occasionally be moved to the same position - a serious bug 

Forces
------

- You can't really have it both ways - either updates take effect within the action or they don't
- Sticking with the functional approach is consistent
- Whichever way you do it, some things will be easier and others harder
