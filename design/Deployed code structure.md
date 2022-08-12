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
- Get React, material UI from CDN, exclude from bundle
- Put generated code in inline script
- Put generated code in module with src

