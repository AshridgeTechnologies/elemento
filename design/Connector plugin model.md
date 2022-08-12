Connector plugin model
======================

Aims
----

- Allow connections to third party services (eg database, hosting, API)
- Allow connector modules to be plugged in

Needs
-----

- Hold specific data about a service in the project model (eg API keys)
- Interact with the service to set it up to work with the project (eg configuration)
- Perform actions on the service at design time (eg deployment)
- Apps can perform actions on the service at runtime (eg API calls, data operations)
- Integrate smoothly with studio
- Deploy any runtime components with the app


Forces
------

- Setup my be triggered independently of deployment eg for local testing
- Setup may be done as part of deployment
- Setup will nd extra actions
- Setup actions will be specific to each plugin
- Authorisation will be needed
- Runtime components may or may not be needed (eg needed for database, not for deploy)
- Model object must be JSON serializable
- Exact needs for plugins are not known yet - need to learn gradually



Decision - 15 Aug 22
--------

- Build Firebase deployment and Firestore data store as built-ins
- Build them as if they could become plugins
- Model class includes actions
- Model class may need an injected interface to the studio eg to show a dialog or report progress/errors
- Property editor shows buttons for actions 
- If no runtime implementation, just don't generate any code for it