import Text from '../../src/model/Text'
import TextInput from '../../src/model/TextInput'
import Button from '../../src/model/Button'
import Menu from '../../src/model/Menu'
import MenuItem from '../../src/model/MenuItem'
import NumberInput from '../../src/model/NumberInput'
import TrueFalseInput from '../../src/model/TrueFalseInput'
import SelectInput from '../../src/model/SelectInput'
import List from '../../src/model/List'
import {createElement} from '../../src/model/createElement'
import Data from '../../src/model/Data'
import Page from '../../src/model/Page'
import App from '../../src/model/App'
import {Collection, FunctionDef} from '../../src/model/index'
import MemoryDataStore from '../../src/model/MemoryDataStore'
import FileDataStore from '../../src/model/FileDataStore'
import Layout from '../../src/model/Layout'
import AppBar from '../../src/model/AppBar'

test('creates elements of correct type', () => {
    expect(createElement('App', 2)).toBeInstanceOf(App)
    expect(createElement('Page', 2)).toBeInstanceOf(Page)
    expect(createElement('Layout', 2)).toBeInstanceOf(Layout)
    expect(createElement('AppBar', 2)).toBeInstanceOf(AppBar)
    expect(createElement('Text', 2)).toBeInstanceOf(Text)
    expect(createElement('TextInput', 2)).toBeInstanceOf(TextInput)
    expect(createElement('NumberInput', 2)).toBeInstanceOf(NumberInput)
    expect(createElement('SelectInput', 2)).toBeInstanceOf(SelectInput)
    expect(createElement('TrueFalseInput', 2)).toBeInstanceOf(TrueFalseInput)
    expect(createElement('Button', 3)).toBeInstanceOf(Button)
    expect(createElement('Menu', 3)).toBeInstanceOf(Menu)
    expect(createElement('MenuItem', 3)).toBeInstanceOf(MenuItem)
    expect(createElement('List', 3)).toBeInstanceOf(List)
    expect(createElement('Data', 4)).toBeInstanceOf(Data)
    expect(createElement('Collection', 4)).toBeInstanceOf(Collection)
    expect(createElement('MemoryDataStore', 5)).toBeInstanceOf(MemoryDataStore)
    expect(createElement('FileDataStore', 5)).toBeInstanceOf(FileDataStore)
    expect(createElement('Function', 5)).toBeInstanceOf(FunctionDef)
})

test('cannot create a Project', () => {
    expect( ()=> createElement('Project', 2)).toThrow('Cannot create new Project')
})

test('creates elements with next sequence number in lowercase id', ()=> {
    const element = createElement('TextInput', 2)
    expect(element.id).toBe('textinput_2')
})

test('creates elements with next sequence number in start case name', ()=> {
    const element = createElement('TextInput', 2)
    expect(element.name).toBe('Text Input 2')
})