import Project from './Project'
import App from './App'
import Page from './Page'
import SelectInput from './SelectInput'
import TrueFalseInput from './TrueFalseInput'
import Image from './Image'
import UserLogon from './UserLogon'
import List from './List'
import Data from './Data'
import FileDataStore from './FileDataStore'
import WebFileDataStore from './WebFileDataStore'
import BrowserDataStore from './BrowserDataStore'
import MemoryDataStore from './MemoryDataStore'
import Function from './FunctionDef' // Note: use ElementType name for Function
import Component from './ComponentDef' // Note: use ElementType name for Component
import Collection from './Collection'
import {DataTypeElementType, ElementType} from './Types'
import CloudflareDataStore from './CloudflareDataStore'
import ServerApp from './ServerApp'
import ServerAppConnector from './ServerAppConnector'
import Adapter from './Adapter'
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
import SpeechInput from "./SpeechInput"
import FunctionImport from "./FunctionImport"
import Form from './Form'
import DateInput from './DateInput'
import DecimalType from './types/DecimalType'
import ToolFolder from './ToolFolder'
import Tool from './Tool'
import Calculation from './Calculation'
import ToolImport from './ToolImport'
import ComponentFolder from './ComponentFolder'
import Timer from './Timer'
import Frame from './Frame'
import ScreenKeyboard from './ScreenKeyboard'
import WebFile from './WebFile'
import OutputProperty from './OutputProperty'
import InputProperty from './InputProperty'
import TinyBaseDataStore from './TinyBaseDataStore'
import TinyBaseServerDataStore from './TinyBaseServerDataStore'
import {modelClassFromGeneratedSchema, modelElementClass} from './ModelElement'

// import App from '../runtime/components/App'
import AppBar from '../runtime/components/AppBar'
import TextInput from '../runtime/components/TextInput'
import NumberInput from '../runtime/components/NumberInput'
import Dialog from '../runtime/components/Dialog'
import TextElement from '../runtime/components/TextElement'
import Block from '../runtime/components/Block'
import ItemSet from '../runtime/components/ItemSet'
import Button from '../runtime/components/Button'
import Menu from '../runtime/components/Menu'
import MenuItem from '../runtime/components/MenuItem'
import Icon from '../runtime/components/Icon'

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

const elementTypes = (): {[key in ElementType]: any} => {
    return {
        Project: Project,
        App: App,  // specific class still needed for now
        Tool: Tool,
        AppBar: modelElementClass(AppBar),
        Page: Page,
        Text: modelElementClass(TextElement),
        TextInput: modelElementClass(TextInput),
        NumberInput: modelElementClass(NumberInput),
        SelectInput: SelectInput,
        TrueFalseInput: TrueFalseInput,
        DateInput: DateInput,
        SpeechInput: SpeechInput,
        Button: modelElementClass(Button),
        Form: Form,
        Image: Image,
        Frame: Frame,
        Icon: modelElementClass(Icon),
        UserLogon: UserLogon,
        Menu: modelElementClass(Menu),
        MenuItem: modelElementClass(MenuItem),
        List: List,
        ItemSet: modelElementClass(ItemSet),
        Data: Data,
        Calculation: Calculation,
        Timer: Timer,
        FileDataStore: FileDataStore,
        WebFileDataStore: WebFileDataStore,
        BrowserDataStore: BrowserDataStore,
        CloudflareDataStore: CloudflareDataStore,
        TinyBaseDataStore: TinyBaseDataStore,
        TinyBaseServerDataStore: TinyBaseServerDataStore,
        MemoryDataStore: MemoryDataStore,
        Function: Function,
        FunctionImport: FunctionImport,
        Component: Component,
        InputProperty: InputProperty,
        OutputProperty: OutputProperty,
        Collection: Collection,
        Block: modelElementClass(Block),
        Dialog: modelElementClass(Dialog),
        ServerApp: ServerApp,
        ServerAppConnector: ServerAppConnector,
        Adapter: Adapter,
        WebFile: WebFile,
        File: File,
        FileFolder: FileFolder,
        ComponentFolder: ComponentFolder,
        ToolFolder: ToolFolder,
        ToolImport: ToolImport,
        ScreenKeyboard: ScreenKeyboard,
        ...dataTypeElementTypes()
    }
}

export const elementTypeNames = ()=> Object.keys(elementTypes()) as ElementType[]
export const isBuiltInType = (elementType: ElementType) => elementTypeNames().includes(elementType)
export const elementOfType = (elementType: ElementType) => {
    return elementTypes()[elementType]
}
export const parentTypeOf = (elementType: ElementType) => isBuiltInType(elementType) ? elementOfType(elementType).parentType : 'any'
