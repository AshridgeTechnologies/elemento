import ChoiceType from './types/ChoiceType'
import DataTypes from './types/DataTypes'
import DateType from './types/DateType'
import ListType from './types/ListType'
import NumberType from './types/NumberType'
import RecordType from './types/RecordType'
import TextType from './types/TextType'
import TrueFalseType from './types/TrueFalseType'
import Rule from './types/Rule'

export type ElementId = string
export type ComponentType = 'statelessUI' | 'statefulUI' | 'background' | 'backgroundFixed' | 'app' | 'utility' | 'dataType'
export type ChoiceList = readonly string[]
export type PropertyType = 'string' | 'string|number' | 'string list' | 'string multiline' | 'number' | 'boolean' | 'date' | 'expr' | ChoiceList | EventActionPropertyDef
export type PropertyExpr = {expr: string}
export type PropertyValue = string | number | boolean | string[] | Date | PropertyExpr
export type PropertyValueType<T> = T | PropertyExpr

export type InsertPosition = 'before' | 'after' | 'inside'

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
    'RecordType' |
    'TextType' |
    'TrueFalseType' |
    'Rule'

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
    'DateInput' |
    'SpeechInput' |
    'Button' |
    'Icon' |
    'Image' |
    'UserLogon' |
    'Menu' |
    'MenuItem' |
    'List' |
    'Data' |
    'FileDataStore' |
    'BrowserDataStore' |
    'MemoryDataStore' |
    'Function' |
    'FunctionImport' |
    'Collection' |
    'Layout' |
    'FirebasePublish' |
    'FirestoreDataStore' |
    'ServerApp' |
    'ServerAppConnector' |
    'File' |
    'FileFolder' |
    DataTypeElementType

export type ParentType = ElementType | 'any' | null