App settings
============

Aims
----

- Can supply fixed data to the app when it runs in a particular environment


Needs
-----

- Can supply a settings object to the app in a deployed environment
- Can inject settings directly
- Settings can have defaults in the app code
- App needs to have the settings itself


Forces
------

- Downloading a JSON file, ignoring if not found seems convenient
- Supplying the settings as props to the App React component seems simple and idiomatic
- Need to have the settings available anywhere in the app
- Need to be available as soon as the app runs as they may affect how it starts up


Possibilities
-------------

- Generate settings into index file
- Download a settings file from same dir as index.html
- Context available throughout the app
- Get settings into app state, access through the app


Initial design - 10 Nov 22
--------------------------

- App has default settings - empty object
- Props given to app are added to the settings
- run() function takes settings object parameter
- Deployers can use their own way to inject properties