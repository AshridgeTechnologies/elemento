HTML pages
----------

9 Sep 2024

Aims
----

- Provide a flexible way of including plain HTML in apps
- Provide a way of linking to pages outside the app

Needs
-----

- View plain HTML pages that are part of the app eg T&Cs
- Include HTML within app pages
- Navigate to HTML pages inside or outside the app

Forces
------

- Can be show an html file in the files dir
- Reloading app page after navigating to another page could be slow
- Need to add a way to navigate to another HTML page
- Including chunks of HTML in app pages is generally useful
- Being able to read text from an asset (or external) file is generally useful
- If can navigate to an internal page, can navigate to external one
- Having ability to specify a target would be useful
- Having a link render as a plain link, with href, rather than using JS would be good


Decision
--------

- Implement reading text content of a file first as it has other uses
- Implement plain links later
