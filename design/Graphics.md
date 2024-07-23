Graphics
========

17 Oct 2022

Updated 10 Jul 2024

Aims
----

- Make it easy to create apps with graphics

Use case examples
-----------------

- Simple action game - eg space invaders, candy-crush
- Board game - cards, word games, counter games
- Educational - eg physics or maths simulation
- Custom designs - customer enters specific details, generates image
- Business - data illustrations


Needs
-----

- Can show shapes, lines, icons, images, text
- Can mix with normal elements
- Can have HTML elements inside shapes
- Can have shapes inside shapes
- Can control position and all other properties
- Can use CSS styling
- Easily show straightforward shapes
- Complex polygons
- Complex svg images from files
- Complex SVG images inline
- Response is fast enough for simple games
- Follow same functional principles as everything else
- Similar DX to text-oriented elements
- Can create components using lower-level eg a deck of cards
- Only responds to clicks in the actual shape area


Forces
------

- Clip-path means clicks only received within visible area
- SVG shapes also only receive clicks within their area
- Two competing style and positioning systems in SVG - own and CSS
- You can (mostly) use css to style SVG elements
- BUT the css props are different to HTML and differ between elements
- SVG elements need to be inside an outer <svg> element
- 

Possibilities
-------------

- HTML elements with absolute positioning
- SVG elements
- SVG images
- HTML with clip-path
- HTML with background
- SVG foreign object
- Canvas
- Graphics components are put into a container as text ones, but not positioned automatically
- Ordering may control z-order
- All properties are formulas
- Position functions eg x away from another position at 45 degrees
- Draggable elements have a position value
