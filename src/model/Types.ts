export type ElementType = 'Project' | 'App' | 'Page' | 'Text' | 'TextInput'| 'NumberInput'| 'SelectInput'| 'TrueFalseInput' | 'Button' | 'List' | 'Data' | 'Collection'
                            | 'MemoryDataStore' | 'FileDataStore'
export type ElementId = string
export type ComponentType = 'statelessUI' | 'statefulUI' | 'background' | 'backgroundFixed' | 'app'
export type PropertyType = 'string' | 'string|number' | 'string list' | 'string multiline' | 'number' | 'boolean' | 'action' | 'expr'
export type PropertyExpr = {expr: string}
export type PropertyValue = string | number | boolean | string[] | PropertyExpr
export type PropertyValueType<T> = T | PropertyExpr

export type InsertPosition = 'before' | 'after' | 'inside'
