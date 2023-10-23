Run hosted apps Spike 1
=======================

Aims
----

- Inform whether to change the server apps hosting approach

Requirements
------------

- Can deploy an Elemento App from command line to Hosting
- Server apps run as expected

To Do
-----

- Create/reuse a test Elemento project with server apps
- Create a new FB project - and do nothing to it
- Fill in necessary stuff for deployment, noting steps
- Attempt deploy and revise as necessary, noting problems
- Test app running with server apps

Steps taken
-----------

- firebase experiments:enable webframeworks
- Init and Enable angular as no express option - all went angular-ish
- Enable billing
- Init again - did Express without asking
- Deploy failed with /bin/sh invalid option

Results
-------

- Didn't work at all, odd error running build script, open bug reported by others but no-one taking any notice
