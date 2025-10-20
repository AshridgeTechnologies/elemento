AutoState - Part 2
==================

Aims
----

- Move to fully "proxified" app state objects

Requirements - from design doc
------------------------------

- Go back to always using a proxy
- Proxy created by app state store
- Proxy stored in each version of the state object, so always the same instance
- Proxy gets child state objects direct from the store
- Proxy gets functions and binds them to work with the proxy as this
- Proxy caches bound functions for each version
- Proxy always calls the function on the latest version in the store
- The getChildState and _boundMethods functions go from BaseComponentState
- BaseComponentState no longer has the App State Object
- May no longer need AppState Object

Steps
-----

- BaseComponentState init always returns a proxy
- AppStateStore creates the proxy and saves in the instance
- Proxy handler contains app store and id
- Proxy handler does child state objects direct
- Proxy handler does bound methods
- Proxy handler caches bound methods
- Proxy handler calls bound methods on latest version
- Proxy handler gets properties from latest version
