export type ElementType = 'App' | 'Page' | 'Text' | 'TextInput'| 'NumberInput'| 'SelectInput'| 'TrueFalseInput' | 'Button'
export type ElementId = string
export type PropertyType = 'string' | 'string list' | 'number' | 'boolean' | 'action'
export type PropertyExpr = {expr: string}
export type PropertyValue = string | number | boolean | string[] | PropertyExpr

