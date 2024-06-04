Rich text
=========

_Revised Jun 2024_

Aims
----

- Developer can easily edit areas of formatted text
- Formatted text areas can have embedded components

Requirements
------------

- ✅ Text component accepts HTML
- ✅ In a string of Newlines, all except the first are replaced with <br/>
- ✅ Option to allow no HTML (default), safe or all
- ✅ Formulas/values can be embedded in the text by using a template string
- ✅ Can contain any other page elements as children
- ✅ Placeholders, in the form @element-name@, with the name of a child element, cause that element to be included at that point
- ✅ Child elements not named in placeholders are appended at the end
- ✅ Malformed HTML does not blow up app eg <Inclu followed by newline

Later requirements
------------------

- Text can be edited with a WYSIWYG rich text editor


Technical
---------

- In runtime element, use dangerouslySetInnerHtml
- Use DOMPurify in browser to sanitise if option is on
- Refactor TextElement to use a content property
- The embedded children are passed to the Text element as children
- Children with name in an embed code are substituted with the element of that name from the embeddedChildren
- Children without an embed code are appended at the end
