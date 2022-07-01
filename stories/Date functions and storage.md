Date functions and storage
==========================

Aims
----

- Users can manipulate and calculate with dates
- Users can store dates in data stores

Requirements
------------

- Dates written to JSON data stores in ISO format, normalised to UTC
- Dates read from JSON data stores in ISO format
- Today() function: previous midnight in current time zone
- Now() function: current date/time
- DaysBetween(date1, date2) function: full days between two dates, normalised to UTC, previous midnight
- HoursBetween(dateTime1, dateTime2): actual full hours between two date/times
- 