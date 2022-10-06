export type ElementId = string
export type ComponentType = 'statelessUI' | 'statefulUI' | 'background' | 'backgroundFixed' | 'app' | 'utility'
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
    fixedOnly?: boolean,
    readOnly?: boolean
}
export type ActionDef = {
    name: string,
}

export type ElementType =
    'Project' |
    'App' |
    'AppBar' |
    'Page' |
    'Text' |
    'TextInput' |
    'NumberInput' |
    'SelectInput' |
    'TrueFalseInput' |
    'Button' |
    'Icon' |
    'UserLogon' |
    'Menu' |
    'MenuItem' |
    'List' |
    'Data' |
    'FileDataStore' |
    'BrowserDataStore' |
    'MemoryDataStore' |
    'Function' |
    'Collection' |
    'Layout' |
    'FirebasePublish' |
    'FirestoreDataStore' |
    'ServerApp' |
    'ServerAppConnector'

export type ParentType = ElementType | 'any' | null