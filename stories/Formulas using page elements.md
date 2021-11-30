Formulas using page elements
============================

- Formulas can refer to value of an element on the same page
- Element referred to by name, with spaces replaced by underscores
- Value property referred to with dot syntax eg My_Input.value

Technical Design
----------------

### Preparation
- Separate component generated for each page
- Review use of Zustand and other global state mechanisms

### Make data available
- App state maintained by EditorMain
- State has section for each page
- Page state has section for each element
- Element section includes value
- Element onChange updates the app state for that element
- Element value displayed is either initialValue, or app state value if present

### Allow formulas to reference the data
- Collect all the identifiers in the page formulas
- Valid where match an element name
- Generate code to get each element state from the page state
- Generate a const referring to the element state in the page component function body