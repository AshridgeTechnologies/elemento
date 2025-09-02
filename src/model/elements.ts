import Project from './Project'
import App from './App'
import Page from './Page'
import TrueFalseInput from './TrueFalseInput'
import UserLogon from './UserLogon'
import WebFileDataStore from './WebFileDataStore'
import Function from './FunctionDef' // Note: use ElementType name for Function
import Component from './ComponentDef' // Note: use ElementType name for Component
import {DataTypeElementType, ElementType} from './Types'
import ServerApp from './ServerApp'
import ServerAppConnector from './ServerAppConnector'
import Adapter from './Adapter'
import {FileSchema} from './File'
import {FileFolderSchema} from './FileFolder'
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
import DecimalType from './types/DecimalType'
import ToolFolder from './ToolFolder'
import Tool from './Tool'
import ToolImport from './ToolImport'
import ComponentFolder from './ComponentFolder'
import Timer from './Timer'
import ScreenKeyboard from './ScreenKeyboard'
import WebFile from './WebFile'
import OutputProperty from './OutputProperty'
import InputProperty from './InputProperty'
import TinyBaseDataStore from './TinyBaseDataStore'
import TinyBaseServerDataStore from './TinyBaseServerDataStore'
import {modelElementClass, modelElementClassFromGeneratedSchema} from './ModelElement'

// import App from '../runtime/components/App'
import AppBar from '../runtime/components/AppBar'
import TextInput from '../runtime/components/TextInput'
import DateInput from '../runtime/components/DateInput'
import SelectInput from '../runtime/components/SelectInput'
import BrowserDataStore from '../runtime/components/BrowserDataStore'
import FileDataStore from '../runtime/components/FileDataStore'
import CloudflareDataStore from '../serverRuntime/CloudflareDataStore'
import NumberInput from '../runtime/components/NumberInput'
import Dialog from '../runtime/components/Dialog'
import TextElement from '../runtime/components/TextElement'
import Block from '../runtime/components/Block'
import ItemSet from '../runtime/components/ItemSet'
import Button from '../runtime/components/Button'
import Menu from '../runtime/components/Menu'
import MenuItem from '../runtime/components/MenuItem'
import Icon from '../runtime/components/Icon'
import Calculation from '../runtime/components/Calculation'
import Collection from '../runtime/components/Collection'
import Data from '../runtime/components/Data'
import Form from '../runtime/components/Form'
import Frame from '../runtime/components/Frame'
import Image from '../runtime/components/Image'
import {ListElementSchema} from '../runtime/components/ListElement'
import MemoryDataStore from '../runtime/components/MemoryDataStore'

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
        SelectInput: modelElementClass(SelectInput),
        TrueFalseInput: TrueFalseInput,
        DateInput: modelElementClass(DateInput),
        SpeechInput: SpeechInput,
        Button: modelElementClass(Button),
        Form: modelElementClass(Form),
        Image: modelElementClass(Image),
        Frame: modelElementClass(Frame),
        Icon: modelElementClass(Icon),
        UserLogon: UserLogon,
        Menu: modelElementClass(Menu),
        MenuItem: modelElementClass(MenuItem),
        List: modelElementClass(ListElementSchema),
        ItemSet: modelElementClass(ItemSet),
        Data: modelElementClass(Data),
        Calculation: modelElementClass(Calculation),
        Timer: Timer,
        FileDataStore: modelElementClass(FileDataStore),
        WebFileDataStore: WebFileDataStore,
        BrowserDataStore: modelElementClass(BrowserDataStore),
        CloudflareDataStore: modelElementClass(CloudflareDataStore),
        TinyBaseDataStore: TinyBaseDataStore,
        TinyBaseServerDataStore: TinyBaseServerDataStore,
        MemoryDataStore: modelElementClass(MemoryDataStore),
        Function: Function,
        FunctionImport: FunctionImport,
        Component: Component,
        InputProperty: InputProperty,
        OutputProperty: OutputProperty,
        Collection: modelElementClass(Collection),
        Block: modelElementClass(Block),
        Dialog: modelElementClass(Dialog),
        ServerApp: ServerApp,
        ServerAppConnector: ServerAppConnector,
        Adapter: Adapter,
        WebFile: WebFile,
        File: modelElementClass(FileSchema),
        FileFolder: modelElementClass(FileFolderSchema),
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
