Convert App model to and from JSON
===================================

- Converts any model object to JSON with all properties and type info
- Converts a full App structure to JSON
- Loads any model object from JSON into an object of the correct class
- Loads a full App structure into objects with the correct classes
- Ignores unknown properties
- Throws exception if incorrect property type in JSON, with diagnostic info
- New properties are automatically detected if not added to unit test, especially if optional