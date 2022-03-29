Running from apps website
-------------------------

- Runtime html page
- The path /run always rewrites to the runtime page
- The next segment can contain an id, optionally preceded by a descriptive name
- The page loads the app whose id occurs in the second path segment
- There can be further path segments
- The code is available through a GET to /code/<id-plus-name>
- It is served with content-type text/javascript
- Can run from arbitrary URL
- Can run from another URL with incorrect content type
- Rewrites URL for Dropbox content
