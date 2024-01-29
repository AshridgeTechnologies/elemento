Email sending
=============

Aims
----

- Developers can easily send transactional emails from server apps
- Can use straightforward and low-cost email services

Requirements
------------

- SendEmail function, taking a Record with from, to, subject, text, html
- SetupEmail function taking Record with host, user, password
- Only works with SMTP servers that accept secure connections on port 465
- Startup action for server apps so can call SetupEmail
- Startup action can be async so can read from DB or file to get settings
