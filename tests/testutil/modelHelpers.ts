import {modelElementClass} from '../../src/model/ModelElement'
import {default as AppBarRuntime} from '../../src/runtime/components/AppBar'
import {default as TextElementRuntime} from '../../src/runtime/components/TextElement'
import {default as TextInputRuntime} from '../../src/runtime/components/TextInput'
import {default as BlockRuntime} from '../../src/runtime/components/Block'
import {default as ItemSetRuntime} from '../../src/runtime/components/ItemSet'
import {default as ButtonRuntime} from '../../src/runtime/components/Button'
import {default as MenuRuntime} from '../../src/runtime/components/Menu'
import {default as MenuItemRuntime} from '../../src/runtime/components/MenuItem'
import {elementOfType} from '../../src/model/elements'

export const AppBar = modelElementClass(AppBarRuntime)
export const TextInput = modelElementClass(TextInputRuntime)
export const NumberInput = elementOfType('NumberInput')
export const DateInput = elementOfType('DateInput')
export const SelectInput = elementOfType('SelectInput')
export const TrueFalseInput = elementOfType('TrueFalseInput')
export const Text = modelElementClass(TextElementRuntime)
export const Block = modelElementClass(BlockRuntime)
export const ItemSet = modelElementClass(ItemSetRuntime)
export const Button = modelElementClass(ButtonRuntime)
export const Menu = modelElementClass(MenuRuntime)
export const MenuItem = modelElementClass(MenuItemRuntime)
export const Dialog = elementOfType('Dialog')
export const BrowserDataStore = elementOfType('BrowserDataStore')
export const FileDataStore = elementOfType('FileDataStore')
export const MemoryDataStore = elementOfType('MemoryDataStore')
export const Calculation = elementOfType('Calculation')
export const CloudflareDataStore = elementOfType('CloudflareDataStore')
export const TinyBaseDataStore = elementOfType('TinyBaseDataStore')
export const TinyBaseServerDataStore = elementOfType('TinyBaseServerDataStore')
export const WebFileDataStore = elementOfType('WebFileDataStore')
export const Collection = elementOfType('Collection')
export const Data = elementOfType('Data')
export const File = elementOfType('File')
export const FileFolder = elementOfType('FileFolder')
export const Form = elementOfType('Form')
export const Frame = elementOfType('Frame')
export const Image = elementOfType('Image')
export const List = elementOfType('List')
export const Timer = elementOfType('Timer')
export const ScreenKeyboard = elementOfType('ScreenKeyboard')
export const SpeechInput = elementOfType('SpeechInput')
export const UserLogon = elementOfType('UserLogon')
export const WebFile = elementOfType('WebFile')
