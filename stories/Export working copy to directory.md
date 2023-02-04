Export working copy to directory
================================

Aims
----

- Developer can save the files in a browser working copy to a disk directory
- Developer can save the files in a browser working copy to a zip file

Requirements
------------

- Use existing File -> Export menu option
- File picker appears
- Pick or create the save directory
- Write all files, including .git if it exists, to the given dir
- For Zip file option, choose a location and file name
- Write project file and all files to zip file
- Success or error message

Desirable
---------

- Confirm if dir exists and is not empty

Technical
---------

- Start to refactor EditorRunner into UI and processing