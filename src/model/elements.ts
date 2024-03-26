import Project from './Project'
import App from './App'
import AppBar from './AppBar'
import Page from './Page'
import Text from './Text'
import TextInput from './TextInput'
import NumberInput from './NumberInput'
import SelectInput from './SelectInput'
import TrueFalseInput from './TrueFalseInput'
import Button from './Button'
import Icon from './Icon'
import Image from './Image'
import UserLogon from './UserLogon'
import Menu from './Menu'
import MenuItem from './MenuItem'
import List from './List'
import Data from './Data'
import FileDataStore from './FileDataStore'
import BrowserDataStore from './BrowserDataStore'
import MemoryDataStore from './MemoryDataStore'
import Function from './FunctionDef' // Note: use ElementType name for Function
import Component from './ComponentDef' // Note: use ElementType name for Component
import Collection from './Collection'
import Layout from './Layout'
import {DataTypeElementType, ElementType} from './Types'
import FirestoreDataStore from './FirestoreDataStore'
import ServerApp from './ServerApp'
import ServerAppConnector from './ServerAppConnector'
import File from './File'
import FileFolder from './FileFolder'
import TrueFalseType from './types/TrueFalseType'
import DataTypes from './types/DataTypes'
import TextType from './types/TextType'
import RecordType from './types/RecordType'
import ListType from './types/ListType'
import Rule from './types/Rule'
import NumberType from './types/NumberType'
import DateType from './types/DateType'
import ChoiceType from './types/ChoiceType'
import SpeechInput from "./SpeechInput";
import FunctionImport from "./FunctionImport";
import Form from './Form'
import DateInput from './DateInput'
import DecimalType from './types/DecimalType'
import ToolFolder from './ToolFolder'
import Tool from './Tool'
import Calculation from './Calculation'
import ToolImport from './ToolImport'
import ComponentFolder from './ComponentFolder'
import Block from './Block'
import Timer from './Timer'

export const dataTypeElementTypes = (): {[key in DataTypeElementType]: any} => {
    return {
        ChoiceType: ChoiceType,
        DataTypes: DataTypes,
        DateType: DateType,
        ListType: ListType,
        NumberType: NumberType,
        DecimalType: DecimalType,
        RecordType: RecordType,
        TextType: TextType,
        TrueFalseType: TrueFalseType,
        Rule: Rule,
    }
}

export const elementTypes = (): {[key in ElementType]: any} => {
    return {
        Project: Project,
        App: App,
        Tool: Tool,
        AppBar: AppBar,
        Page: Page,
        Text: Text,
        TextInput: TextInput,
        NumberInput: NumberInput,
        SelectInput: SelectInput,
        TrueFalseInput: TrueFalseInput,
        DateInput: DateInput,
        SpeechInput: SpeechInput,
        Button: Button,
        Form: Form,
        Image: Image,
        Icon: Icon,
        UserLogon: UserLogon,
        Menu: Menu,
        MenuItem: MenuItem,
        List: List,
        Data: Data,
        Calculation: Calculation,
        Timer: Timer,
        FileDataStore: FileDataStore,
        BrowserDataStore: BrowserDataStore,
        FirestoreDataStore: FirestoreDataStore,
        MemoryDataStore: MemoryDataStore,
        Function: Function,
        FunctionImport: FunctionImport,
        Component: Component,
        Collection: Collection,
        Layout: Layout,
        Block: Block,
        ServerApp: ServerApp,
        ServerAppConnector: ServerAppConnector,
        File: File,
        FileFolder: FileFolder,
        ComponentFolder: ComponentFolder,
        ToolFolder: ToolFolder,
        ToolImport: ToolImport,
        ...dataTypeElementTypes()
    }
}

export const elementTypeNames = ()=> Object.keys(elementTypes()) as ElementType[]
export const isBuiltInType = (elementType: ElementType) => elementTypeNames().includes(elementType)
export const elementOfType = (elementType: ElementType) => elementTypes()[elementType]
export const parentTypeOf = (elementType: ElementType) => isBuiltInType(elementType) ? elementOfType(elementType).parentType : 'any'
