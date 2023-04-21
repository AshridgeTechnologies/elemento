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
import Collection from './Collection'
import Layout from './Layout'
import {ElementType} from './Types'
import FirebasePublish from './FirebasePublish'
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
import EnumType from './types/EnumType'

export const elementTypes = () => {
    return {
        Project: Project,
        App: App,
        AppBar: AppBar,
        Page: Page,
        Text: Text,
        TextInput: TextInput,
        NumberInput: NumberInput,
        SelectInput: SelectInput,
        TrueFalseInput: TrueFalseInput,
        Button: Button,
        Image: Image,
        Icon: Icon,
        UserLogon: UserLogon,
        Menu: Menu,
        MenuItem: MenuItem,
        List: List,
        Data: Data,
        FileDataStore: FileDataStore,
        BrowserDataStore: BrowserDataStore,
        FirestoreDataStore: FirestoreDataStore,
        MemoryDataStore: MemoryDataStore,
        Function: Function,
        Collection: Collection,
        Layout: Layout,
        FirebasePublish: FirebasePublish,
        ServerApp: ServerApp,
        ServerAppConnector: ServerAppConnector,
        File: File,
        FileFolder: FileFolder,
        DataTypes: DataTypes,
        TrueFalseType: TrueFalseType,
        TextType: TextType,
        NumberType: NumberType,
        DateType: DateType,
        EnumType: EnumType,
        RecordType: RecordType,
        ListType: ListType,
        Rule: Rule,
    }
}

export const elementOfType = (elementType: ElementType) => elementTypes()[elementType]
