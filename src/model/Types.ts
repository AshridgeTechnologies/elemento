export type ElementId = string
export type ComponentType = 'statelessUI' | 'statefulUI' | 'background' | 'backgroundFixed' | 'app' | 'utility' | 'dataType'
export type ChoiceList = readonly string[]
export type PropertyType = 'string' | 'string|number' | 'string list' | 'string multiline' | 'number' | 'boolean' | 'date' | 'object' | 'expr' | ChoiceList | EventActionPropertyDef
export type PropertyExpr = {expr: string}
export type PropertyValue = string | number | boolean | string[] | Date | PropertyExpr
export type PropertyValueType<T> = T | PropertyExpr

export const InsertPositions = ['before', 'after', 'inside'] as const
export type InsertPosition = typeof InsertPositions[number]

export interface EventActionPropertyDef {
    type: 'Action',
    argumentNames: string[]
}

export const eventAction = (...argumentNames: string[]): EventActionPropertyDef => ({type: 'Action', argumentNames})

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

export type DataTypeElementType =
    'ChoiceType' |
    'DataTypes' |
    'DateType' |
    'ListType' |
    'NumberType' |
    'DecimalType' |
    'RecordType' |
    'TextType' |
    'TrueFalseType' |
    'Rule'

export type ElementType =
    'Project' |
    'App' |
    'Tool' |
    'AppBar' |
    'Page' |
    'Text' |
    'TextInput' |
    'NumberInput' |
    'SelectInput' |
    'TrueFalseInput' |
    'DateInput' |
    'SpeechInput' |
    'Button' |
    'Form' |
    'Icon' |
    'Image' |
    'UserLogon' |
    'Menu' |
    'MenuItem' |
    'List' |
    'Data' |
    'Calculation' |
    'FileDataStore' |
    'BrowserDataStore' |
    'MemoryDataStore' |
    'Function' |
    'FunctionImport' |
    'Collection' |
    'Layout' |
    'FirestoreDataStore' |
    'ServerApp' |
    'ServerAppConnector' |
    'File' |
    'FileFolder' |
    'ToolFolder' |
    'ToolImport' |
    DataTypeElementType

export type ParentType = ElementType | ElementType[] | 'any' | null