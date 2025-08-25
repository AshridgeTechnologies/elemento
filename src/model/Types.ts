import {StylingProp} from '../util/StylingTypes'

export type ElementId = string
export type ComponentType = 'statelessUI' | 'statefulUI' | 'background' | 'backgroundFixed' | 'app' | 'utility' | 'dataType'
export type ChoiceList = readonly string[]
export type PropertyType = 'string' | 'string|number' | 'string list' | 'string multiline' | 'number' | 'boolean' | 'date' | 'object' | 'expr' | 'styles' | ChoiceList | EventActionPropertyDef
export type PropertyExpr = {expr: string}
export type PropertyValue = string | number | boolean | string[] | Date | PropertyExpr
export type MultiplePropertyValue = {[p: string]: PropertyValue}
export type CombinedPropertyValue = PropertyValue | MultiplePropertyValue
export type PropertyValueType<T> = T | PropertyExpr
export type CanContain = 'elementsWithThisParentType'

export const InsertPositions = ['before', 'after', 'inside'] as const
export type InsertPosition = typeof InsertPositions[number]

export interface EventActionPropertyDef {
    type: 'Action',
    argumentNames: string[]
}

export const eventAction = (...argumentNames: string[]): EventActionPropertyDef => ({type: 'Action', argumentNames})

export type PropOptions = { multilineExpr?: boolean, state?: boolean, stateAndDom?: boolean, fixedOnly?: boolean, readOnly?: boolean }

export type PropertyDef = {
    name: string,
    type: PropertyType,
} & PropOptions

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

export type UserDefinedType = string

export type ElementType =
    'Project' |
    'App' |
    'Tool' |
    'AppBar' |
    'Page' |
    'Dialog' |
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
    'ItemSet' |
    'Data' |
    'Calculation' |
    'FileDataStore' |
    'WebFileDataStore' |
    'BrowserDataStore' |
    'MemoryDataStore' |
    'WebFile' |
    'Function' |
    'FunctionImport' |
    'Component' |
    'InputProperty' |
    'OutputProperty' |
    'Collection' |
    'Block' |
    'CloudflareDataStore' |
    'TinyBaseDataStore' |
    'TinyBaseServerDataStore' |
    'ServerApp' |
    'ServerAppConnector' |
    'Adapter' |
    'File' |
    'FileFolder' |
    'ToolFolder' |
    'ComponentFolder' |
    'ToolImport' |
    'ScreenKeyboard' |
    DataTypeElementType |
    UserDefinedType

export type ParentType = ElementType | ElementType[] | 'any' | null

export type StylingProps = Partial<Readonly<{
    [k in StylingProp]: PropertyValueType<string | number>
}>>
export type Styling = { readonly styles?: StylingProps }
export type Show = { readonly show?: PropertyValueType<boolean> }
