export type ElementType = 'App' | 'Page' | 'Text' | 'TextInput'| 'NumberInput'| 'SelectInput'| 'TrueFalseInput' | 'Button' | 'Data'
export type ElementId = string
export type PropertyType = 'string' | 'string list' | 'string multiline' | 'number' | 'boolean' | 'action'
export type PropertyExpr = {expr: string}
export type PropertyValue = string | number | boolean | string[] | PropertyExpr
export type PropertyValueType<T> = T | PropertyExpr

