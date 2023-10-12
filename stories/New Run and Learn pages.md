New Run and Learn pages
=======================

Aims
----

- Provide easy ways for people to learn about Elemento
- Provide an easy and intuitive way for people to run Elemento apps

Requirements
------------

### Run
- ✅ Select an app in private browser store to run
- ✅ Choose an app in a disk folder to run
- ✅ Run page still works for GitHub
- ✅ Function imports work
- ✅ Images have correct URL


### Learn
✅ - Intro
✅ - Link to Help
✅ - Link to examples
✅ - Placeholder for link to Tutorials, guides
✅ - Tutorial from the old First App

Further requirements
--------------------

- List of recent disk files opened
- Enter a GitHub URL and get the run URL - if possible
- Instructions to copy or run in new window

Technical
---------

- AppRunnerFromOpfs
- AppRunnerFromFiles
- AppChooser
- RunPage
- RunnerServiceWorker

- ✅ /run needs to always serve same page
- run page needs to look at url
- if url is just run or run/, show app chooser 
- if matches one of the url schemes, run that immediately, otherwise show app chooser
- Always want to download the actual built index.html
- Local runner needs to ensure service worker is controlling page, else reload
- For local scheme, should have downloaded the app-specific index.html if sw in control