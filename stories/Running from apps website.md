Running from apps website
-------------------------

- Runtime html page
- The path /run always rewrites to the runtime page
- If the next segment is `code` the path is treated as a path to an app published on the apps website
- The page loads the app in the path
- Apps website files should not be available through a GET from another site
- It is served with content-type text/javascript
- If the next segment is `web` the rest of the path is treated as an arbitrary URL, preceded by `https://`
- Can run from an arbitrary URL with incorrect content type
- Rewrites URL for Dropbox content
