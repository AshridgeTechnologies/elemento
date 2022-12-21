GitHub App storage
==================

Aims
----

- Make GitHub the app storage medium for Elemento apps
- Enjoy the many benefits of GitHub
- Simplify Elemento code
- Avoid maintaining app storage ourselves
- Fit seamlessly with Pro development

Needs
-----

- Clear explanation of creating GitHub account for complete novice
- User needs to know nothing about GitHub unless they want to
- Create repo for a project automatically
- Saved apps are stored in GitHub automatically
- Local working copy stored by other means
- Published apps stored in GitHub when requested
- Project can be stored as multiple files
- Additional assets can be stored

Forces
------

- Git/GitHub client required, may be complex
- Local working copy required - in-memory and losing work would annoy people
- Parts needed:
  - Local working copy with zero effort from user
  - Git/GitHub client
  - GitHub CDN
  - Runner page
  - Service worker to serve local working copy to preview
- If running from CDN, need to have versioned files as they are cached
- Really want to keep URL of a published app the same, but get latest version from CDN
- Want to be able to do Firebase deployment easily 

Possibilities
-------------
- Could use files, cache or IDB for working copy
- Working copy doubles as a fallback
- IDB can hold blobs
- GitHub Rest and Client APIs are huge and complex
- Not clear how to clone/update with GitHub API (you don't - you use a plain git API - see below)
- Can have registry of apps in elemento that gets all public apps in Elemento
- Registry can have a directory page that is indexed by search engines
- Isomorphic git client - also has a users page, good for a backlink
- Isomorphic git has an associated FS on IDB implementation - perfect!
- jsDelivr seems to be the only serious player as a GitHub CDN
- GitHub actions may be useful
- Runner page could write a small doc to Firestore, processed by hourly/daily job => directory page, stats

Versioning possibilities
------------------------
- File/database with latest commits of each project
- Update db when commit - from client, or from GH action
- Function to generate index page on request
- Static index page, not cached, for each app, updated when commit
- Directory page also updated when commit
- JS on client to find latest commit from GitHub - blocked by CORS on web page
- But GitHub API can be used without auth for public repos, can easily get HEAD commit
- So spike shows can get latest commit id and download that from jsDelivr - perfect!

Stories
-------

- ✅ Local working copy stored in IDB
- ✅ Run from GitHub and CDN
- Update GitHub from working copy
- Get or update working copy from GitHub
- Run preview from working copy
- Multiple files in working copy
- Export working copy to directory - or zip?
- Import working copy from directory - or zip?
- Asset files stored in working copy
- Image component loaded from asset file
- Add deferred desirable features from previous stories
