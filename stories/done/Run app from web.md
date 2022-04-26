Run app from web
================

  - App runtime extracts a URL from its path (see rules)
  - Converts dropbox display URL to raw content URL
  - Loads app from the source and runs it
  - Shows error message if the app cannot be loaded


App URL rules
-------------
  - If the path starts with "https" or "http", treat path as an app url
  - If the host is www.dropbox.com, convert to dl.dropboxusercontent.com