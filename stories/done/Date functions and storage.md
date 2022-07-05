Date functions and storage
==========================

Aims
----

- Users can manipulate and calculate with dates
- Users can store dates in data stores

Requirements
------------

- ✅ Dates written to JSON data stores in ISO format, normalised to UTC
- ✅ Dates read from JSON data stores in ISO format
- ✅ Invalid dates are returned as strings
- ✅ Today() function: previous midnight in current time zone
- ✅ Now() function: current date/time
- ✅ DaysBetween(date1, date2) function: full or part calendar days between two dates, normalised to UTC, previous midnight
- ✅ TimeBetween(dateTime1, dateTime2, unit): actual full time units between two date/times
