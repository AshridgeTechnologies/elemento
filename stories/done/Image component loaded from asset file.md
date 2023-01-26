Image component loaded from asset file
======================================

Aims
----

- Developer can include images on a page

Requirements
------------

- ✅ Image component with source, width, height
- ✅ Can load from external URL
- ✅ Use name of asset file in src for internal
- ✅ Can load from asset file in preview
- ✅ Can load from asset file in run from GitHub
- ✅ Has alt property, also shown as title

Later - when deployment reviewed
--------------------------------

- Can load from asset file in Firebase deployment 

Technical
---------

- ✅ Use mui-image
- ✅ External URL should be easy
- ✅ For run from GitHub, need to ensure images have full URL
- ✅ For run from preview, need to intercept HTTP requests from images
- For Firebase deployment, will need to deploy to top level with project file

Run from preview
----------------

- Keep code injection from Editor, because:
  - It already works
  - Keeping state through code changes is important
  - The editor (or editor runner) needs to generate the code anyway for errors and preview
- The app frame (not the editor window) needs a service worker to handle network requests
- Service worker needs the LocalProjectStore
- Can parcel/esbuild produce the service worker file?

