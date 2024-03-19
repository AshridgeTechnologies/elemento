import Text from '../../src/model/Text'
import TextInput from '../../src/model/TextInput'
import Button from '../../src/model/Button'
import Menu from '../../src/model/Menu'
import MenuItem from '../../src/model/MenuItem'
import NumberInput from '../../src/model/NumberInput'
import TrueFalseInput from '../../src/model/TrueFalseInput'
import SelectInput from '../../src/model/SelectInput'
import List from '../../src/model/List'
import {createNewElement} from '../../src/model/createElement'
import Data from '../../src/model/Data'
import Page from '../../src/model/Page'
import App from '../../src/model/App'
import Collection from '../../src/model/Collection'
import FunctionDef from '../../src/model/FunctionDef'
import MemoryDataStore from '../../src/model/MemoryDataStore'
import FileDataStore from '../../src/model/FileDataStore'
import Layout from '../../src/model/Layout'
import AppBar from '../../src/model/AppBar'

test('creates elements of correct type', () => {
    expect(createNewElement('App', 2)).toBeInstanceOf(App)
    expect(createNewElement('Page', 2)).toBeInstanceOf(Page)
    expect(createNewElement('Layout', 2)).toBeInstanceOf(Layout)
    expect(createNewElement('AppBar', 2)).toBeInstanceOf(AppBar)
    expect(createNewElement('Text', 2)).toBeInstanceOf(Text)
    expect(createNewElement('TextInput', 2)).toBeInstanceOf(TextInput)
    expect(createNewElement('NumberInput', 2)).toBeInstanceOf(NumberInput)
    expect(createNewElement('SelectInput', 2)).toBeInstanceOf(SelectInput)
    expect(createNewElement('TrueFalseInput', 2)).toBeInstanceOf(TrueFalseInput)
    expect(createNewElement('Button', 3)).toBeInstanceOf(Button)
    expect(createNewElement('Menu', 3)).toBeInstanceOf(Menu)
    expect(createNewElement('MenuItem', 3)).toBeInstanceOf(MenuItem)
    expect(createNewElement('List', 3)).toBeInstanceOf(List)
    expect(createNewElement('Data', 4)).toBeInstanceOf(Data)
    expect(createNewElement('Collection', 4)).toBeInstanceOf(Collection)
    expect(createNewElement('MemoryDataStore', 5)).toBeInstanceOf(MemoryDataStore)
    expect(createNewElement('FileDataStore', 5)).toBeInstanceOf(FileDataStore)
    expect(createNewElement('Function', 5)).toBeInstanceOf(FunctionDef)
})

test('cannot create a Project', () => {
    expect( ()=> createNewElement('Project', 2)).toThrow('Cannot create new Project')
})

test('creates elements with next sequence number in lowercase id', ()=> {
    const element = createNewElement('TextInput', 2)
    expect(element.id).toBe('textinput_2')
})

test('creates elements with next sequence number in start case name', ()=> {
    const element = createNewElement('TextInput', 2)
    expect(element.name).toBe('Text Input 2')
})

test('creates elements with properties', ()=> {
    const element = createNewElement('TextInput', 2, {label: 'The Input', initialValue: 'Wide'})
    expect(element.name).toBe('Text Input 2')
    expect((element as TextInput).label).toBe('The Input')
    expect((element as TextInput).initialValue).toBe('Wide')
})
