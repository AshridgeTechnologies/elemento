Deployed code structure
=======================

Aims
----

- Achieve the optimal way of organising the code in an app deployed on a hosting site

Needs
-----

- Fast loading
- Reduce traffic from Elemento hosting
- Reasonably conventional approach
- Fast deployment
- Deployed code continues to work even when Elemento and other libs move on

Forces
------

- Generated code is fairly small
- Several large third party packages used
- Elemento runtime can be an independent package
- Releasing the runtime to npm eventually, but maybe not now
- Don't want version update problems during Elemento development
- Jsdelivr esm looks very good at first sight
- Imports would be a good way to go as can also use in bundlers

Spike 1
-------

- Get bundler to create separate Elemento runtime
- ~~Get React, material UI from CDN, exclude from bundle~~ - See below
- Put generated code in inline script
- Put generated code in module with src

Notes
-----

- Attempted to exclude React from bundle - could not get to work
- Many packages need to resolve "react"
- Tried import maps shim, which did work
- BUT esbuild cannot handle dynamic require of react, which happens in many packages
- Started a whack-a-mole session, externalising the packages that did this, but could go on a long time
- SO: accept having one bundle for runtime - still under 1Mb minified