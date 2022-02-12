export type ElementType = 'App' | 'Page' | 'Text' | 'TextInput' | 'Button'
export type ElementId = string
export type PropertyType = 'string' | 'number' | 'boolean' | 'action'
export type PropertyExpr = {expr: string}
export type PropertyValue = string | number | boolean | PropertyExpr

