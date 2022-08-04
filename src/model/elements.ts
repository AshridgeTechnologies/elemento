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
import UserLogon from './UserLogon'
import Menu from './Menu'
import MenuItem from './MenuItem'
import List from './List'
import Data from './Data'
import FileDataStore from './FileDataStore'
import BrowserDataStore from './BrowserDataStore'
import MemoryDataStore from './MemoryDataStore'
// Note: use ElementType name for Function
import Function from './FunctionDef'
import Collection from './Collection'
import Layout from './Layout'
import {ElementType} from './Types'

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
        Icon: Icon,
        UserLogon: UserLogon,
        Menu: Menu,
        MenuItem: MenuItem,
        List: List,
        Data: Data,
        FileDataStore: FileDataStore,
        BrowserDataStore: BrowserDataStore,
        MemoryDataStore: MemoryDataStore,
        Function: Function,
        Collection: Collection,
        Layout: Layout,
    }
}

export const elementOfType = (elementType: ElementType) => elementTypes()[elementType]