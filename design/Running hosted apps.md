Running server apps
===================

Aims
----

Yet another review of server apps and hosting
- Consider latest changes in Firebase hosting
- Increase performance, lower costs
- Find the easiest path for novice developers
- Stay with conventional approaches where possible, for experienced developers

Needs
-----

- Avoid any command-line activities
- Avoid downloading local apps
- Avoid complex Google console activities
- Avoid complex GitHub activities
- Reduce manual Firebase setup to a minimum
- Integrate deployment into Studio
- Instant preview of server app changes in Studio
- Provide a standalone preview of at least one next version
- If possible allow multiple newer and older versions to be run side by side
- Allow versions to be viewed and managed in the studio
- Find a low-cost high-performance route to server client files 

Forces
------

- Server app runner extension already works
- Server app runner is an overhead to maintain
- Different URLs rather than versions in the path would be easier and better for users
- Pull rather than push is unconventional
- Server app runner has a lot of overheads
- Server app runner for normal running is unconventional
- Server app runner seems to be only way to do immediate updates
- Did manage to get firebase functions deployed from Studio - but slow
- If just deployed server app runner once on setup the slowness would be quite acceptable
- Hosting deployment relatively quick
- Preview channels seem useful
- FB Hosting makes good use of CDN - and clears cache
- Serving files from Hosting will be much faster and cheaper
- More need to get this right than to do it immediately
- Preview channels have similarities to facilities on other hosting services like netlify
- Security is important - don't want keys stored in many places - or anywhere if possible
- Simplicity is important - ideally just use browser login to Google and GitHub


Possibilities
-------------

- Clone specified commit to OPFS dir, build, deploy from browser
- Use esbuild in the browser, now or in future
- Use FB preview channels if they support server app functionality
- Server app runner could be used just for Studio preview
- Browser build and deploy might share code with a CLI script and/or GitHub action
- Browser logon gets access tokens, send them to admin server to do the deployment

Spike 1
-------

- Use FB CLI to deploy project with express app running server apps
- Review snags and deploy timings and performance