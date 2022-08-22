Firestore access rules
=======================

Aim
---

- Allow finer control over access to Firestore data

Requirements
------------

### Development and deploy

- Update security rules action in the model object
- Can select Firebase project to update from a list
- Can select Firebase project for the preview config

### Rules capabilities
- Each collection can have several security rules applied
- If any rule allows the operation, it is allowed
- Rules are of the form: <role>-<permission>
- Role names are stored in the roles collection, in a comma-separated list
- Special roles are: public, signedin, creator
- Permissions are read or write
- Firestore data store model object sets up the security rules to implement the permissions
- public-write is not allowed
