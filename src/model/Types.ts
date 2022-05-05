export type ElementType = 'Project' | 'App' | 'Page' | 'Text' | 'TextInput'| 'NumberInput'| 'SelectInput'| 'TrueFalseInput' | 'Button' | 'List' | 'Data' | 'Collection'
export type ElementId = string
export type PropertyType = 'string' | 'string|number' | 'string list' | 'string multiline' | 'number' | 'boolean' | 'action'
export type PropertyExpr = {expr: string}
export type PropertyValue = string | number | boolean | string[] | PropertyExpr
export type PropertyValueType<T> = T | PropertyExpr

