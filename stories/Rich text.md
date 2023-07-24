Rich text
=========

Aims
----

- Developer can easily edit areas of formatted text
- Formatted text areas can have embedded components

Requirements
------------

- Rich text component - model, runtime
- Text can be edited with a WYSIWYG rich text editor
- Can contain any other page elements as children
- Placeholders with {} can be embedded in the text
- Placeholders with "embed:xxx" or maybe Embed('name'), with the name of a child element, cause that element to be included at that point
- Other placeholders are treated as expressions and their values included at that point


Technical
---------

- In property editor, use Quill as the rich text editor, with the Snow theme
- In generator, use a JSX converter to generate JS code from the rich text html
- The converted elements become the children of the runtime RichText element
- The embedded children are passed to the RichText element as a separate property
- Any children that are an embed code are substituted with the element of that name from the embeddedChildren