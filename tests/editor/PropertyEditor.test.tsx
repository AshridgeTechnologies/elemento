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
import Project from '../../src/model/Project'
import MemoryDataStore from '../../src/model/MemoryDataStore'
import Collection from '../../src/model/Collection'
import FunctionDef from '../../src/model/FunctionDef'
import FileDataStore from '../../src/model/FileDataStore'
import Layout from '../../src/model/Layout'
import AppBar from '../../src/model/AppBar'
import FirebasePublish from '../../src/model/FirebasePublish'
import {ProjectContext} from '../../src/editor/Editor'
import FirestoreDataStore from '../../src/model/FirestoreDataStore'

let container: any
let changedValue: any

const render = (element: React.ReactElement) => ({container} = tlRender(element))
const onChange = (id: string, propName: string, value: any) => {
    changedValue = value
}

const idField = () => (screen.getByTestId('elementId') as HTMLElement)
const typeField = () => (screen.getByTestId('elementType') as HTMLElement)
const input = (label: string) => (screen.getByLabelText(label) as HTMLInputElement)
const textarea = (label: string) => (screen.getByLabelText(label) as HTMLTextAreaElement)
const select = (label: string) => (screen.getByLabelText(label).nextSibling as HTMLInputElement)
const inputValue = (label: string) => input(label).value
const nameInput = () => container.querySelector('#name')
const nameInputValue = () => nameInput().value
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

test('shows type and id', () => {
    const element = new Page('id1', 'Page 1', {style: ex`funky`}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(idField().textContent).toBe('id1')
    expect(typeField().textContent).toBe('Page')
    expect(nameInputValue()).toBe('Page 1')
    fireEvent.input(nameInput(), {target: {value: 'Page One'}})
    expect(changedValue).toBe('Page One')
})

test('updates name', () => {
    const element = new Page('id1', 'Page 1', {style: ex`funky`}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Page 1')
    fireEvent.input(nameInput(), {target: {value: 'Page One'}})
    expect(changedValue).toBe('Page One')
})

test('updates other properties', () => {
    const element = new Text('id1', 'Text 1', {content: 'x', color: ex`funky`})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Color')).toBe('funky')
    fireEvent.input(input('Color'), {target: {value: 'cool'}})
    expect(changedValue).toStrictEqual({expr: 'cool'})
})

test('has fields for Project', () => {
    const element = new Project('id1', 'Project 1', {author: 'Me!'}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(idField().textContent).toBe('id1')
    expect(nameInputValue()).toBe('Project 1')
    expect(inputValue('Formula Name')).toBe('Project1')
    expect(inputValue('Author')).toBe('Me!')
    expect(kindButton(0).textContent).toBe('abc')
})

test('has fields for App', () => {
    const element = new App('id1', 'App 1', {author: ex`Me + You`, maxWidth: '50%'}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(idField().textContent).toBe('id1')
    expect(nameInputValue()).toBe('App 1')
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
    const element = new Text('id1', 'Text 1', {content: '', color: `clear`})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Text 1')
    expect(inputValue('Color')).toBe('clear')
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
        fontSize: 44,
        fontFamily: 'Dog',
        color: 'red',
        backgroundColor: 'blue',
        border: 10,
        borderColor: 'black',
        width: 100,
        height: 200,
        marginBottom: 33,
        display: true
    })
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Text 1')
    expect(textareaValue('Content')).toBe('Hi!\nGood morning')
    expect(inputValue('Font Size')).toBe('44')
    expect(inputValue('Font Family')).toBe('Dog')
    expect(inputValue('Color')).toBe('red')
    expect(inputValue('Background Color')).toBe('blue')
    expect(inputValue('Border')).toBe('10')
    expect(inputValue('Border Color')).toBe('black')
    expect(inputValue('Width')).toBe('100')
    expect(inputValue('Height')).toBe('200')
    expect(inputValue('Margin Bottom')).toBe('33')
    expect(selectValue('Display')).toBe('true')
})

test('has fields for Layout', () => {
    const element = new Layout('id1', 'Layout 1', {
        width: 100,
        horizontal: true,
        backgroundColor: 'pink',
        wrap: false,
    }, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Layout 1')
    expect(selectValue('Horizontal')).toBe('true')
    expect(selectValue('Wrap')).toBe('false')
    expect(inputValue('Width')).toBe('100')
    expect(inputValue('Background Color')).toBe('pink')
})

test('has fields for AppBar', () => {
    const element = new AppBar('id1', 'AppBar 1', {
        title: 'My App',
    }, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('AppBar 1')
    expect(inputValue('Title')).toBe('My App')
})

test('has fields for TextInput', () => {
    const element = new TextInput('id1', 'Text Input 1', {
        initialValue: ex`"Hi!"`,
        maxLength: ex`10`,
        multiline: ex`true || false`,
        width: ex`22`,
        label: ex`"Text One"`
    })
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(typeField().textContent).toBe('Text Input')
    expect(nameInputValue()).toBe('Text Input 1')
    expect(inputValue('Label')).toBe('"Text One"')
    expect(inputValue('Initial Value')).toBe('"Hi!"')
    expect(inputValue('Max Length')).toBe('10')
    expect(inputValue('Width')).toBe('22')
    expect(inputValue('Multiline')).toBe('true || false')
})

test('has fields for TextInput with default values', () => {
    const element = new TextInput('id1', 'Text Input 1', {})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Text Input 1')
    expect(inputValue('Label')).toBe('')
    expect(inputValue('Initial Value')).toBe('')
    expect(inputValue('Max Length')).toBe('')
    expect(inputValue('Width')).toBe('')
    expect(inputValue('Multiline')).toBe(undefined)
    expect(inputValue('Read Only')).toBe(undefined)
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
    const element = new Button('id1', 'Button 1', {content: ex`"Hi!"`, appearance: 'link', action: ex`doIt()`, display: false})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Button 1')
    expect(inputValue('Content')).toBe('"Hi!"')
    expect(selectValue('Appearance')).toBe('link')
    expect(inputValue('Action')).toBe('doIt()')
    expect(kindButton(3).textContent).toBe('fx=')
    expect(kindButton(3).disabled).toBe(true)
    expect(selectValue('Display')).toBe('false')
})

test('has fields for Menu', () => {
    const element = new Menu('id1', 'Menu 1', {label: ex`"Hi!"`, filled: true}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Menu 1')
    expect(inputValue('Label')).toBe('"Hi!"')
    expect(selectValue('Filled')).toBe('true')
})

test('has fields for MenuItem', () => {
    const element = new MenuItem('id1', 'Menu Item 1', {label: ex`"Hi!"`, action: ex`doIt()`, display: false})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(nameInputValue()).toBe('Menu Item 1')
    expect(inputValue('Label')).toBe('"Hi!"')
    expect(selectValue('Display')).toBe('false')
    expect(inputValue('Action')).toBe('doIt()')
    expect(kindButton(2).textContent).toBe('fx=')
    expect(kindButton(2).disabled).toBe(true)
})

test('has fields for List', () => {
    const element = new List('id1', 'List 1', {items: ex`[{a: 10}, {a: 20}]`, style: ex`funky`, width: '100%'}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(idField().textContent).toBe('id1')
    expect(nameInputValue()).toBe('List 1')
    expect(inputValue('Formula Name')).toBe('List1')
    expect(inputValue('Items')).toBe('[{a: 10}, {a: 20}]')
    expect(kindButton(0).textContent).toBe('fx=')
    expect(kindButton(0).disabled).toBe(true)
    expect(inputValue('Style')).toBe('funky')
    expect(inputValue('Width')).toBe('100%')
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

test('has fields and actions for FirebasePublish', () => {
    const element = new FirebasePublish('id1', 'Firebase Publish 1', {firebaseProject: 'project-one'})
    element.publish = jest.fn()
    const project = new Project('id1', 'proj1', {})
    render(<ProjectContext.Provider value={project}>
        <PropertyEditor element={element} onChange={onChange}/>
    </ProjectContext.Provider>)
    expect(nameInputValue()).toBe('Firebase Publish 1')
    expect(inputValue('Firebase Project')).toBe('project-one')

    const publishButton = screen.getByText('Publish')
    fireEvent.click(publishButton)
    expect(element.publish).toHaveBeenCalledWith(project)
})

test('shows errors for each property', () => {
    const element = new Text('id1', 'Text 1', {
        content: 'Hi!\nGood morning',
        fontSize: 44,
        fontFamily: 'Dog',
        color: 'red',
        backgroundColor: ex`Splurge`,
        border: 10,
        borderColor: 'black',
        width: -100,
        height: 200
    })
    render(<PropertyEditor element={element} onChange={onChange} errors={{
        backgroundColor: 'Unknown name "Splurge"',
        width: 'Must be greater than or equal to zero'
    }}/>)
    expect(nameInputValue()).toBe('Text 1')
    expect(textareaValue('Content')).toBe('Hi!\nGood morning')
    expect(inputValue('Background Color')).toBe('Splurge')
    expect(errorValue('Background Color')).toBe('Unknown name "Splurge"')
    expect(inputValue('Width')).toBe('-100')
    expect(errorValue('Width')).toBe('Must be greater than or equal to zero')

})




