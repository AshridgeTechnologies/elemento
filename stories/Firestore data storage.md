Firestore data storage
======================

Aims
----

- Developers can use Firestore to store data
- Works for both private and shared datastores


Requirements
------------


- ✅ Implement the datastore interface
- ✅ Data can be shared across all users, OR
- ✅ Data can be private to each user, OR
- ✅ Some data is private, some data is shared
- ✅ Can specify access as read/write/none for owning user and others
- ✅ User login required for users
- ✅ Needs a Firebase project
- ✅ Google account required for developer to set up database
- ✅ Model object in the editor
- Can add in editor and use as a store
- Configuration data needed is held in model object
- ✅ Do not assume Firebase hosting
- ✅ Security is enforced to keep users' data separate
- Update security rules action in the model object

Security requirements
---------------------

- ✅ Specified by collection
- ✅ Can be user-private: 
  - ✅ Each user sees their own collection
  - ✅ An unrestricted query just gets that user's records
  - ✅ User has full read-write access
- Otherwise shared
- Read: public, signed-in, roles
- Write: roles, creator
- One record per user


Implementation notes
--------------------

- Need to have project details to access db
- Each user has a document keyed by their user id
- User collections are under that document
- Need to create rulesets that implement the security rules in the model
- Need to have the collection names to implement the security rules
- Roles held in a separate collection, writable only through console