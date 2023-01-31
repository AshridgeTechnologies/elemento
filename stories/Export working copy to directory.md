Export working copy to directory
================================

Aims
----

- Developer can save the files in a browser working copy to a disk directory

Requirements
------------

- Use existing File -> Export menu option
- Export Dialog appears
- Pick a parent directory
- Show path where will save to - parent plus Project name
- Confirm before saving
- Write all files, including .git if it exists, to the given dir
- Success or error message

Desirable
---------

- Confirm if dir exists and is not empty

Technical
---------

- Start to refactor EditorRunner into UI and processing