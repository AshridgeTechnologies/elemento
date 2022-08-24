Firestore access rules
=======================

Aim
---

- Allow finer control over access to Firestore data

Requirements
------------

- Each collection can have several security rules applied
- If any rule allows the operation, it is allowed
- Rules are of the form: <role>-<permission>
- Role names are stored in the roles collection, in a comma-separated list
- Special roles are: public, signedin, creator
- Permissions are read or write
- Firestore data store model object sets up the security rules to implement the permissions
- public-write is not allowed