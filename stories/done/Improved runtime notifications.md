Improved runtime notifications
==============================

Aims
----

- Better user experience than alert messages
- Developers can send other notifications as well as errors

Requirements
------------

- ✅ Notify(level, title, description) function
- ✅ Keep NotifyError and delegate to above
- ✅ Notify can be called anywhere in generated or fixed app code = like currentUser
- ✅ Messages are displayed in a Snackbar
- ✅ Colour according to level
- ✅ Messages can be closed or left to disappear automatically
- ✅ Flexibility in holding and displaying messages

Technical - simplest
--------------------

- ✅ Have a notifications module, like authentication
- ✅ Notify function calls notifications addNotification
- ✅ subscribeToNotifications function
- ✅ App subscribes once in a useEffect
- ✅ App uses notistack to show messages

Later requirements - if want to keep notifications
--------------------------------------------------

- Store a list of notifications
- Notify adds to the list, with timestamp and read marker
- Have a markNotificationAsRead function
- Automatically mark as read after n seconds ????
- getUnreadNotifications function
- Can subscribe to notification changes
- App subscribes, causes update
- App includes popup with any unread notifications
- App marks as read after n seconds ????
