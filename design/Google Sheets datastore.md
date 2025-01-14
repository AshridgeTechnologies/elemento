Google Sheets datastore
=======================

10 Jan 2025

Aims
----

- Provide ability to use Google Sheets as a datastore

Needs
-----

- Easy to attach to a Google spreadsheet
- Security easy to set up
- Avoid difficult requirements to validate apps with Google


Forces
------

- Google rightly enforces tight security around documents
- May want to:
  - Use a single shared spreadsheet for all users
  - Allow users to use their own spreadsheets
- Maybe go for single spreadsheet first
- Or maybe give users access to the spreadsheet in order to control access (less good - they could edit directly)
- Service account with key pair seems best
- But medium-complex to set up and will require ability to store secret config when deploying app
