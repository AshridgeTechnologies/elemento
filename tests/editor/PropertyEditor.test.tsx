/**
 * @jest-environment jsdom
 */
import React from 'react'
import PropertyEditor from '../../src/editor/PropertyEditor'

import {fireEvent, render as tlRender, screen} from '@testing-library/react'
import Page from '../../src/model/Page'
import Text from '../../src/model/Text'
import TextInput from '../../src/model/TextInput'
import Button from '../../src/model/Button'
import Menu from '../../src/model/Menu'
import MenuItem from '../../src/model/MenuItem'
import {componentProps, ex} from '../testutil/testHelpers'
import NumberInput from '../../src/model/NumberInput'
import TrueFalseInput from '../../src/model/TrueFalseInput'
import List from '../../src/model/List'
import SelectInput from '../../src/model/SelectInput'
import Data from '../../src/model/Data'
import App from '../../src/model/App'
import Project1, {TOOLS_ID} from '../../src/model/Project'
import Project2, {FILES_ID} from '../../src/model/Project'
import MemoryDataStore from '../../src/model/MemoryDataStore'
import Collection from '../../src/model/Collection'
import FunctionDef from '../../src/model/FunctionDef'
import FileDataStore from '../../src/model/FileDataStore'
import Layout from '../../src/model/Layout'
import AppBar from '../../src/model/AppBar'
import FirestoreDataStore from '../../src/model/FirestoreDataStore'
import FileFolder from '../../src/model/FileFolder'
import userEvent from '@testing-library/user-event'
import ToolFolder from '../../src/model/ToolFolder'

let container: any
let changedValue: any

beforeEach( ()=> changedValue = undefined )

const render = (element: React.ReactElement) => ({container} = tlRender(element))
const onChange = jest.fn().mockImplementation( (id: string, propName: string, value: any) => {
    changedValue = value
})

const idField = () => (screen.getByTestId('elementId') as HTMLElement)
const typeField = () => (screen.getByTestId('elementType') as HTMLElement)
const input = (label: string) => (screen.getByLabelText(label) as HTMLInputElement)
const textarea = (label: string) => (screen.getByLabelText(label) as HTMLTextAreaElement)
const select = (label: string) => (screen.getByLabelText(label).nextSibling as HTMLInputElement)
const inputValue = (label: string) => input(label).value
const nameInput = () => container.querySelector('#name')
const nameInputValue = () => nameInput().value
const notesInput = () => container.querySelector('#notes')
const notesInputValue = () => notesInput().value
const errorValue = (label: string) => {
    const helperId = `${(input(label).id)}-helper-text`
    return container.querySelector(`[id="${helperId}"]`).textContent
}
const textareaValue = (label: string) => textarea(label).textContent
const selectValue = (label: string) => select(label).value
const kindButton = (index: number) => {
    const nodes = container.querySelectorAll('button').values()
    return Array.from(nodes)[index] as HTMLButtonElement
}

const project = Project1.new([], 'proj1', 'id1', {})

test('shows type and id and notes', () => {
    const element = new Page('id1', 'Page 1', {notes: 'This is the first page'}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(idField().textContent).toBe('id1')
    expect(typeField().textContent).toBe('Page')
    expect(nameInputValue()).toBe('Page 1')
    expect(notesInputValue()).toBe('This is the first page')
})

test('updates name on blur', () => {
    const element = new Page('id1', 'Page 1', {}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Page 1')
    fireEvent.input(nameInput(), {target: {value: 'Page One'}})
    expect(nameInputValue()).toBe('Page One')
    expect(changedValue).toBe(undefined)
    fireEvent.blur(nameInput(), {target: {value: 'Page One'}})
    expect(changedValue).toBe('Page One')
})

test('updates notes on blur', () => {
    const element = new Page('id1', 'Page 1', {notes: 'This is page 1'}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(notesInputValue()).toBe('This is page 1')
    fireEvent.input(notesInput(), {target: {value: 'This is page One'}})
    expect(notesInputValue()).toBe('This is page One')
    expect(changedValue).toBe(undefined)
    fireEvent.blur(notesInput(), {target: {value: 'This is page One'}})
    expect(changedValue).toBe('This is page One')
})

test('updates name on enter', () => {
    const element = new Page('id1', 'Page 1', {}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    fireEvent.input(nameInput(), {target: {value: 'Page One'}})
    fireEvent.keyDown(nameInput(), {key: 'Enter', code: 'Enter', charCode: 13})
    expect(changedValue).toBe('Page One')
})

test('does not update name if enter without typing', () => {
    const element = new Page('id1', 'Page 1', {}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Page 1')
    fireEvent.keyDown(nameInput(), {key: 'Enter', code: 'Enter', charCode: 13})
    expect(changedValue).toBe(undefined)
})

test('does not update name if new name is the same', () => {
    const element = new Page('id1', 'Page 1', {}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    fireEvent.input(nameInput(), {target: {value: 'Page 1'}})
    fireEvent.keyDown(nameInput(), {key: 'Enter', code: 'Enter', charCode: 13})
    expect(changedValue).toBe(undefined)
})

test('cannot change name of Files element', async () => {
    const element = new FileFolder(FILES_ID, 'Files', {}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    const user = userEvent.setup()
    await user.type(nameInput(), 'Files 2')
    expect(nameInputValue()).toBe('Files')
    await user.keyboard('[Enter]')
    expect(changedValue).toBe(undefined)
})

test('cannot change name of Tools element', async () => {
    const element = new ToolFolder(TOOLS_ID, 'Tools', {}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    const user = userEvent.setup()
    await user.type(nameInput(), 'Tools 2')
    expect(nameInputValue()).toBe('Tools')
    await user.keyboard('[Enter]')
    expect(changedValue).toBe(undefined)
})

test('updates other properties', () => {
    const element = new Text('id1', 'Text 1', {content: 'x', show: ex`funky`})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Show')).toBe('funky')
    fireEvent.input(input('Show'), {target: {value: 'cool'}})
    expect(changedValue).toStrictEqual({expr: 'cool'})
})

test('updates style properties', () => {
    const element = new TextInput('id1', 'Text 1', {label: 'Some Text', styles: {color: 'red'}})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Color')).toBe('red')
    fireEvent.input(input('Color'), {target: {value: 'blue'}})
    expect(changedValue).toStrictEqual({color: 'blue'})
    expect(onChange).toHaveBeenCalledWith('id1', 'styles', {color: 'blue'})
})

test('has fields for Project', () => {
    const element = Project2.new([], 'Project 1', 'id1', {author: 'Me!'})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(idField().textContent).toBe('id1')
    expect(nameInputValue()).toBe('Project 1')
    expect(inputValue('Formula Name')).toBe('Project1')
    expect(inputValue('Author')).toBe('Me!')
    expect(kindButton(0).textContent).toBe('abc')
})

test('has fields for App', () => {
    const element = new App('id1', 'App 1', {author: ex`Me + You`, maxWidth: '50%', notes: 'My new App'}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(idField().textContent).toBe('id1')
    expect(nameInputValue()).toBe('App 1')
    expect(notesInputValue()).toBe('My new App')
    expect(inputValue('Formula Name')).toBe('App1')
    expect(inputValue('Author')).toBe('Me + You')
    expect(inputValue('Max Width')).toBe('50%')
    expect(kindButton(0).textContent).toBe('fx=')
})

test('has fields for Page', () => {
    const element = new Page('id1', 'Page 1', {}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(idField().textContent).toBe('id1')
    expect(nameInputValue()).toBe('Page 1')
    expect(inputValue('Formula Name')).toBe('Page1')
})

test('has fields for Text with literal value', () => {
    const element = new Text('id1', 'Text 1', {content: 'Some content'})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Text 1')
    expect(inputValue('Content')).toBe('Some content')
})

test('shows controlled component for optional fields for Text', () => {
    const element = new Text('id1', 'Text 1', {content: ''})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Color')).toBe('')
    const colorInput = screen.getByLabelText('Color') as HTMLInputElement
    expect(componentProps(colorInput).value).toBe('')
})

test('has fields for Text', () => {
    const element = new Text('id1', 'Text 1', {
        content: 'Hi!\nGood morning',
        show: true,
        styles: {
            fontSize: 44,
            fontFamily: 'Dog',
            color: 'red',
            backgroundColor: 'blue',
            border: 10,
            borderColor: 'black',
            width: 100,
            height: 200,
            marginBottom: 33
        }
    })
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Text 1')
    expect(textareaValue('Content')).toBe('Hi!\nGood morning')
    expect(selectValue('Show')).toBe('true')
    expect(inputValue('Font Size')).toBe('44')
    expect(inputValue('Font Family')).toBe('Dog')
    expect(inputValue('Color')).toBe('red')
    expect(inputValue('Background Color')).toBe('blue')
    expect(inputValue('Border')).toBe('10')
    expect(inputValue('Border Color')).toBe('black')
    expect(inputValue('Width')).toBe('100')
    expect(inputValue('Height')).toBe('200')
    expect(inputValue('Margin Bottom')).toBe('33')
})

test('has fields for Layout', () => {
    const element = new Layout('id1', 'Layout 1', {
        horizontal: true,
        wrap: false,
        styles: {
            width: 100,
            backgroundColor: 'pink'
        }
    }, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Layout 1')
    expect(selectValue('Horizontal')).toBe('true')
    expect(selectValue('Wrap')).toBe('false')
    expect(inputValue('Width')).toBe('100')
    expect(inputValue('Background Color')).toBe('pink')
})

test('has fields for AppBar', () => {
    // console.log('start', Date.now())
    const element = new AppBar('id1', 'AppBar 1', {
        title: 'My App',
    }, [])
    // console.log('before render', Date.now())
    render(<PropertyEditor element={element} onChange={onChange}/>)
    // console.log('before render', Date.now())
    expect(nameInputValue()).toBe('AppBar 1')
    // console.log('after first expect', Date.now())
    expect(inputValue('Title')).toBe('My App')
    // console.log('end', Date.now())
})

test('has fields for TextInput', () => {
    const element = new TextInput('id1', 'Text Input 1', {
        initialValue: ex`"Hi!"`,
        multiline: ex`true || false`,
        label: ex`"Text One"`,
        dataType: ex`theType`
    })
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(typeField().textContent).toBe('Text Input')
    expect(nameInputValue()).toBe('Text Input 1')
    expect(inputValue('Label')).toBe('"Text One"')
    expect(inputValue('Initial Value')).toBe('"Hi!"')
    expect(inputValue('Multiline')).toBe('true || false')
    expect(inputValue('Data Type')).toBe('theType')
})

test('has fields for TextInput with default values', () => {
    const element = new TextInput('id1', 'Text Input 1', {})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Text Input 1')
    expect(inputValue('Label')).toBe('')
    expect(inputValue('Initial Value')).toBe('')
    expect(inputValue('Width')).toBe('')
    expect(inputValue('Multiline')).toBe(undefined)
    expect(inputValue('Read Only')).toBe(undefined)
    expect(inputValue('Data Type')).toBe('')
})

test('has fields for NumberInput', () => {
    const element = new NumberInput('id1', 'Number Input 1', {initialValue: ex`40`, label: ex`"Number Input One"`})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Number Input 1')
    expect(inputValue('Label')).toBe('"Number Input One"')
    expect(inputValue('Initial Value')).toBe('40')
})

test('has fields for TrueFalseInput', () => {
    const element = new TrueFalseInput('id1', 'True False Input 1', {
        initialValue: ex`true`,
        label: ex`"True False Input One"`
    })
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('True False Input 1')
    expect(inputValue('Label')).toBe('"True False Input One"')
    expect(inputValue('Initial Value')).toBe('true')
})

test('has fields for SelectInput', () => {
    const element = new SelectInput('id1', 'Select Input 1', {
        values: ex`["Green", "Blue", "Pink"]`,
        initialValue: ex`"Green"`,
        label: ex`"Select Input One"`
    })
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Select Input 1')
    expect(inputValue('Label')).toBe('"Select Input One"')
    expect(inputValue('Values')).toBe('["Green", "Blue", "Pink"]')
    expect(inputValue('Initial Value')).toBe('"Green"')
})

test('has fields for SelectInput with fixed value', () => {
    const element = new SelectInput('id1', 'Select Input 1', {
        values: ['Green', 'Blue', 'Pink'],
        initialValue: 'Green',
        label: 'Select Input One'
    })
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Select Input 1')
    expect(inputValue('Label')).toBe('Select Input One')
    expect(inputValue('Values')).toBe('Green, Blue, Pink')
    expect(inputValue('Initial Value')).toBe('Green')
})

test('has fields for Button', () => {
    const element = new Button('id1', 'Button 1', {content: ex`"Hi!"`, appearance: 'link', action: ex`doIt()`, show: false})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Button 1')
    expect(inputValue('Content')).toBe('"Hi!"')
    expect(selectValue('Appearance')).toBe('link')
    expect(inputValue('Action')).toBe('doIt()')
    expect(kindButton(4).textContent).toBe('fx=')
    expect(kindButton(4).disabled).toBe(true)
    expect(selectValue('Show')).toBe('false')
})

test('has fields for Menu', () => {
    const element = new Menu('id1', 'Menu 1', {label: ex`"Hi!"`, filled: true}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Menu 1')
    expect(inputValue('Label')).toBe('"Hi!"')
    expect(selectValue('Filled')).toBe('true')
})

test('has fields for MenuItem', () => {
    const element = new MenuItem('id1', 'Menu Item 1', {label: ex`"Hi!"`, action: ex`doIt()`, show: false})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Menu Item 1')
    expect(inputValue('Label')).toBe('"Hi!"')
    expect(selectValue('Show')).toBe('false')
    expect(inputValue('Action')).toBe('doIt()')
    expect(kindButton(1).textContent).toBe('fx=')
    expect(kindButton(1).disabled).toBe(true)
})

test('has fields for List', () => {
    const element = new List('id1', 'List 1', {items: ex`[{a: 10}, {a: 20}]`, styles: {color: ex`funky`, width: '100%'},
        selectable: true, selectAction: ex`Log(\$item.id)`}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(idField().textContent).toBe('id1')
    expect(nameInputValue()).toBe('List 1')
    expect(inputValue('Formula Name')).toBe('List1')
    expect(inputValue('Items')).toBe('[{a: 10}, {a: 20}]')
    expect(kindButton(0).textContent).toBe('fx=')
    expect(kindButton(0).disabled).toBe(true)
    expect(inputValue('Color')).toBe('funky')
    expect(inputValue('Width')).toBe('100%')
    expect(selectValue('Selectable')).toBe('true')
    expect(inputValue('Select Action')).toBe('Log($item.id)')
    expect(kindButton(3).textContent).toBe('fx=')
    expect(kindButton(3).disabled).toBe(true)
})

test('has fields for Data', () => {
    const element = new Data('id1', 'Data 1', {initialValue: ex`"Hi!"`})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Data 1')
    expect(inputValue('Initial Value')).toBe('"Hi!"')
    expect(selectValue('Display')).toBe('')
})

test('has fields for Collection', () => {
    const element = new Collection('id1', 'Collection 1', {initialValue: ex`["green", "blue"]`, dataStore: ex`dataStore_1`, collectionName: 'Things'})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Collection 1')
    expect(inputValue('Initial Value')).toBe('["green", "blue"]')
    expect(kindButton(0).textContent).toBe('fx=')
    expect(kindButton(0).disabled).toBe(true)
    expect(inputValue('Data Store')).toBe('dataStore_1')
    expect(kindButton(1).textContent).toBe('fx=')
    expect(kindButton(1).disabled).toBe(true)
    expect(inputValue('Collection Name')).toBe('Things')
    expect(selectValue('Display')).toBe('')
})

test('has fields for MemoryDataStore', () => {
    const element = new MemoryDataStore('id1', 'Memory Data Store 1', {initialValue: ex`{ Widgets: { w1: {a: 10}} }`})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Memory Data Store 1')
    expect(inputValue('Initial Value')).toBe('{ Widgets: { w1: {a: 10}} }')
    expect(kindButton(0).textContent).toBe('fx=')
    expect(kindButton(0).disabled).toBe(true)
    expect(selectValue('Display')).toBe('')
})

test('has fields for FunctionDef', () => {
    const element = new FunctionDef('id1', 'Function 1', {input1: 'foo', input5: 'bar', calculation: ex`42`, private: true})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Function 1')
    expect(inputValue('Input 1')).toBe('foo')
    expect(inputValue('Input 2')).toBe('')
    expect(inputValue('Input 5')).toBe('bar')
    expect(kindButton(0).textContent).toBe('abc')
    expect(kindButton(0).disabled).toBe(true)
    expect(kindButton(4).textContent).toBe('abc')
    expect(kindButton(4).disabled).toBe(true)
    expect(kindButton(5).textContent).toBe('y/n')
    expect(kindButton(5).disabled).toBe(true)
    expect(kindButton(6).textContent).toBe('fx=')
    expect(kindButton(6).disabled).toBe(true)
    expect(kindButton(7).textContent).toBe('y/n')
    expect(kindButton(7).disabled).toBe(true)
})

test('has fields for FileDataStore', () => {
    const element = new FileDataStore('id1', 'File Data Store 1', {})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('File Data Store 1')
})

test('has fields and actions for FirestoreDataStore', () => {
    const expectedSecurityRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId}/Things/{record} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    } 
  }       
}`
    const element = new FirestoreDataStore('id1', 'Firestore Data Store 1', {collections: 'Things: user-private'})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Firestore Data Store 1')
    expect(inputValue('Collections')).toBe('Things: user-private')
    expect(inputValue('Security Rules')).toBe(expectedSecurityRules)
    expect(input('Security Rules').readOnly).toBe(true)
})

test('shows errors for a normal property', () => {
    const element = new Text('id1', 'Text 1', {
        content: ex`Splurge`,
    })
    render(<PropertyEditor element={element} onChange={onChange} errors={{
        content: 'Unknown name "Splurge"',
    }}/>)
    expect(nameInputValue()).toBe('Text 1')
    expect(textareaValue('Content')).toBe('Splurge')
    expect(errorValue('Content')).toBe('Unknown name "Splurge"')
})

test('shows errors for styles properties', () => {
    const element = new TextInput('id1', 'Text Input 1', {
        styles: {
            fontSize: 44,
            backgroundColor: ex`Splurge`,
            border: ex`10+`,
        }
    })
    render(<PropertyEditor element={element} onChange={onChange} errors={{
        styles: {
            backgroundColor: 'Unknown name "Splurge"',
            border: 'Unexpected end of input'
        }
    }}/>)
    expect(nameInputValue()).toBe('Text Input 1')
    expect(inputValue('Background Color')).toBe('Splurge')
    expect(errorValue('Background Color')).toBe('Unknown name "Splurge"')
    expect(inputValue('Border')).toBe('10+')
    expect(errorValue('Border')).toBe('Unexpected end of input')
})
