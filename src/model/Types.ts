export type ElementType = 'Project' | 'App' | 'Page' | 'Layout' | 'AppBar' | 'Text' | 'TextInput'| 'NumberInput'| 'SelectInput'| 'TrueFalseInput'
    | 'Button' | 'Menu' | 'MenuItem' | 'List' | 'Data' | 'Collection'
    | 'MemoryDataStore' | 'FileDataStore' | 'Function'
export type ElementId = string
export type ComponentType = 'statelessUI' | 'statefulUI' | 'background' | 'backgroundFixed' | 'app'
export type PropertyType = 'string' | 'string|number' | 'string list' | 'string multiline' | 'number' | 'boolean' | 'action' | 'expr'
export type PropertyExpr = {expr: string}
export type PropertyValue = string | number | boolean | string[] | PropertyExpr
export type PropertyValueType<T> = T | PropertyExpr

export type InsertPosition = 'before' | 'after' | 'inside'

export type PropertyDef = {
    name: string,
    type: PropertyType,
    multilineExpr?: boolean,
    state?: boolean,
    fixedOnly?: boolean
}
