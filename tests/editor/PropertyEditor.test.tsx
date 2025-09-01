/**
 * @vitest-environment jsdom
 */
import React from 'react'
import PropertyEditor from '../../src/editor/PropertyEditor'
import {beforeEach, describe, expect, test, vi} from "vitest"

import {fireEvent, render as tlRender, screen} from '@testing-library/react'
import Page from '../../src/model/Page'
import {Block, Text, TextInput, Button, Menu, MenuItem, AppBar, NumberInput, SelectInput} from '../testutil/modelHelpers'
import {componentProps, ex} from '../testutil/testHelpers'
import TrueFalseInput from '../../src/model/TrueFalseInput'
import List from '../../src/model/List'
import Data from '../../src/model/Data'
import App from '../../src/model/App'
import Project2, {FILES_ID, TOOLS_ID} from '../../src/model/Project'
import MemoryDataStore from '../../src/model/MemoryDataStore'
import Collection from '../../src/model/Collection'
import FunctionDef from '../../src/model/FunctionDef'
import FileDataStore from '../../src/model/FileDataStore'
import FileFolder from '../../src/model/FileFolder'
import userEvent from '@testing-library/user-event'
import ToolFolder from '../../src/model/ToolFolder'
import {presetPositionStyles} from '../../src/editor/StylesPropertyEditor'
import {noop} from 'lodash'

let container: any
let changedValue: any

beforeEach( ()=> changedValue = undefined )

const render = (element: React.ReactElement) => ({container} = tlRender(element))
const onChange = vi.fn().mockImplementation( (_id: string, _propName: string, value: any) => {
    changedValue = value
})
const onNameSelected = vi.fn()

const idField = () => (screen.getByTestId('elementId') as HTMLElement)
const typeField = () => (screen.getByTestId('elementType') as HTMLElement)
const input = (label: string) => (screen.getByLabelText(label) as HTMLInputElement)
const select = (label: string) => (screen.getByLabelText(label).nextSibling as HTMLInputElement)
const inputValue = (label: string) => {
    const el = input(label)
    return el.type === 'textarea' ? el.textContent : el.value
}
const nameInput = () => container.querySelector('#name')
const nameInputValue = () => nameInput().value
const notesInput = () => container.querySelector('#notes')
const notesInputValue = () => notesInput().value
const errorValue = (label: string) => {
    const helperId = `${(input(label).id)}-helper-text`
    return container.querySelector(`[id="${helperId}"]`).textContent
}
const elementErrorValue = () => {
    const helperId = `elementErrors`
    return container.querySelector(`[data-testid="${helperId}"]`).textContent
}
const selectValue = (label: string) => select(label).value
const kindButton = (index: number) => {
    const nodes = container.querySelectorAll('button[data-eltype="propertyTypeButton"]').values()
    return Array.from(nodes)[index] as HTMLButtonElement
}

test('shows type and id and notes', () => {
    const element = new Page('id1', 'Page 1', {notes: 'This is the first page'}, [])
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(idField().textContent).toBe('id1')
    expect(typeField().textContent).toBe('Page')
    expect(nameInputValue()).toBe('Page 1')
    expect(notesInputValue()).toBe('This is the first page')
})

test('updates name on blur', () => {
    const element = new Page('id1', 'Page 1', {}, [])
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(nameInputValue()).toBe('Page 1')
    fireEvent.input(nameInput(), {target: {value: 'Page One'}})
    expect(nameInputValue()).toBe('Page One')
    expect(changedValue).toBe(undefined)
    fireEvent.blur(nameInput(), {target: {value: 'Page One'}})
    expect(changedValue).toBe('Page One')
})

test('updates notes on blur', () => {
    const element = new Page('id1', 'Page 1', {notes: 'This is page 1'}, [])
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(notesInputValue()).toBe('This is page 1')
    fireEvent.input(notesInput(), {target: {value: 'This is page One'}})
    expect(notesInputValue()).toBe('This is page One')
    expect(changedValue).toBe(undefined)
    fireEvent.blur(notesInput(), {target: {value: 'This is page One'}})
    expect(changedValue).toBe('This is page One')
})

test('updates name on enter', () => {
    const element = new Page('id1', 'Page 1', {}, [])
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    fireEvent.input(nameInput(), {target: {value: 'Page One'}})
    fireEvent.keyDown(nameInput(), {key: 'Enter', code: 'Enter', charCode: 13})
    expect(changedValue).toBe('Page One')
})

test('does not update name if enter without typing', () => {
    const element = new Page('id1', 'Page 1', {}, [])
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(nameInputValue()).toBe('Page 1')
    fireEvent.keyDown(nameInput(), {key: 'Enter', code: 'Enter', charCode: 13})
    expect(changedValue).toBe(undefined)
})

test('does not update name if new name is the same', () => {
    const element = new Page('id1', 'Page 1', {}, [])
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    fireEvent.input(nameInput(), {target: {value: 'Page 1'}})
    fireEvent.keyDown(nameInput(), {key: 'Enter', code: 'Enter', charCode: 13})
    expect(changedValue).toBe(undefined)
})

test('cannot change name of Files element', async () => {
    const element = new FileFolder(FILES_ID, 'Files', {}, [])
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    const user = userEvent.setup()
    await user.type(nameInput(), 'Files 2')
    expect(nameInputValue()).toBe('Files')
    await user.keyboard('[Enter]')
    expect(changedValue).toBe(undefined)
})

test('cannot change name of Tools element', async () => {
    const element = new ToolFolder(TOOLS_ID, 'Tools', {}, [])
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    const user = userEvent.setup()
    await user.type(nameInput(), 'Tools 2')
    expect(nameInputValue()).toBe('Tools')
    await user.keyboard('[Enter]')
    expect(changedValue).toBe(undefined)
})

test('updates other properties', () => {
    const element = new Text('id1', 'Text 1', {content: 'x', show: ex`funky`})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(inputValue('Show')).toBe('funky')
    fireEvent.input(input('Show'), {target: {value: 'cool'}})
    expect(changedValue).toStrictEqual({expr: 'cool'})
})

test('updates style properties', () => {
    const element = new TextInput('id1', 'Text 1', {label: 'Some Text', styles: {color: 'red'}})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(inputValue('Color')).toBe('red')
    fireEvent.input(input('Color'), {target: {value: 'blue'}})
    expect(changedValue).toStrictEqual({color: 'blue'})
    expect(onChange).toHaveBeenCalledWith('id1', 'styles', {color: 'blue'})
})

test('shows common style properties when search', () => {
    const element = new TextInput('id1', 'Text 1', {label: 'Some Text', styles: {}})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(screen.queryByLabelText('Color')).toBe(null)
    fireEvent.input(input('Search'), {target: {value: 'col'}})
    expect(inputValue('Color')).toBe('')
    fireEvent.input(input('Color'), {target: {value: 'blue'}})
    expect(changedValue).toStrictEqual({color: 'blue'})
    expect(onChange).toHaveBeenCalledWith('id1', 'styles', {color: 'blue'})
})

test('icon clears search box', () => {
    const element = new TextInput('id1', 'Text 1', {label: 'Some Text', styles: {}})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    fireEvent.input(input('Search'), {target: {value: 'col'}})
    expect(inputValue('Color')).toBe('')
    fireEvent.click(screen.getByTitle('clear search'))
    expect(screen.queryByLabelText('Color')).toBe(null)
})

test('shows advanced style properties if check box', () => {
    const element = new TextInput('id1', 'Text 1', {label: 'Some Text', styles: {}})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(screen.queryByLabelText('Accent Color')).toBe(null)
    fireEvent.click(screen.getByLabelText('Show advanced properties'))
    fireEvent.input(input('Search'), {target: {value: 'col'}})
    expect(inputValue('Accent Color')).toBe('')
    fireEvent.input(input('Accent Color'), {target: {value: 'cyan'}})
    expect(changedValue).toStrictEqual({accentColor: 'cyan'})
    expect(onChange).toHaveBeenCalledWith('id1', 'styles', {accentColor: 'cyan'})
})

test('selects name with Cmd/Ctrl-Click', () => {
    const onNameSelected = vi.fn()
    const element = new TextInput('id1', 'Text 1', {label: 'Some Text', initialValue: ex`AnotherElement.size`})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(inputValue('Initial Value')).toBe('AnotherElement.size')
    fireEvent.click(input('Initial Value'), {ctrlKey: true, offsetX: 60, offsetY: 12})
    expect(onNameSelected).toHaveBeenCalledWith('AnotherElement')
})

test('selects name in styles with Cmd/Ctrl-Click', () => {
    const onNameSelected = vi.fn()
    const element = new TextInput('id1', 'Text 1', {label: 'Some Text', styles: {color: ex`ColorOf(AnotherElement)`}})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(inputValue('Color')).toBe('ColorOf(AnotherElement)')
    fireEvent.click(input('Color'), {ctrlKey: true, offsetX: 0, offsetY: 12})
    expect(onNameSelected).toHaveBeenCalledWith('ColorOf')
})

test('has fields for Project', () => {
    const element = Project2.new([], 'Project 1', 'id1', {author: 'Me!'})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(idField().textContent).toBe('id1')
    expect(nameInputValue()).toBe('Project 1')
    expect(inputValue('Formula Name')).toBe('Project1')
    expect(inputValue('Author')).toBe('Me!')
    expect(kindButton(0).textContent).toBe('abc')
})

test('has fields for App', () => {
    const element = new App('id1', 'App 1', {author: ex`Me + You`, maxWidth: '50%', notes: 'My new App'}, [])
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
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
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(idField().textContent).toBe('id1')
    expect(nameInputValue()).toBe('Page 1')
    expect(inputValue('Formula Name')).toBe('Page1')
})

test('has fields for Text with literal value', () => {
    const element = new Text('id1', 'Text 1', {content: 'Some content'})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(nameInputValue()).toBe('Text 1')
    expect(inputValue('Content')).toBe('Some content')
})

test('shows controlled component for optional fields', () => {
    const element = new Button('id1', 'Button 1', {content: ''})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(inputValue('Action')).toBe('')
    const actionInput = screen.getByLabelText('Action') as HTMLInputElement
    expect(componentProps(actionInput).value).toBe('')
})

test('searches for element codename', () => {
    const onSearch = vi.fn()
    const element = new Button('id1', 'Button 1', {content: ''})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={onSearch}/>)
    fireEvent.click(screen.getByTitle('search for this element'))
    expect(onSearch).toHaveBeenCalledWith('Button1')
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
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(nameInputValue()).toBe('Text 1')
    expect(inputValue('Content')).toBe('Hi!\nGood morning')
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

test('has fields for Block', () => {
    const element = new Block('id1', 'Layout 1', {
        layout: 'horizontal',
        styles: {
            width: 100,
            backgroundColor: 'pink'
        }
    }, [])
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(nameInputValue()).toBe('Layout 1')
    expect(selectValue('Layout')).toBe('horizontal')
    expect(inputValue('Width')).toBe('100')
    expect(inputValue('Background Color')).toBe('pink')
})

test('has fields for AppBar', () => {
    // console.log('start', Date.now())
    const element = new AppBar('id1', 'AppBar 1', {
        title: 'My App',
    }, [])
    // console.log('before render', Date.now())
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
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
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(typeField().textContent).toBe('Text Input')
    expect(nameInputValue()).toBe('Text Input 1')
    expect(inputValue('Label')).toBe('"Text One"')
    expect(inputValue('Initial Value')).toBe('"Hi!"')
    expect(inputValue('Multiline')).toBe('true || false')
    expect(inputValue('Data Type')).toBe('theType')
})

test('has fields for TextInput with default values', () => {
    const element = new TextInput('id1', 'Text Input 1', {})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(nameInputValue()).toBe('Text Input 1')
    expect(inputValue('Label')).toBe('')
    expect(inputValue('Initial Value')).toBe('')
    expect(inputValue('Multiline')).toBe(undefined)
    expect(inputValue('Read Only')).toBe(undefined)
    expect(inputValue('Data Type')).toBe('')
})

test('has fields for NumberInput', () => {
    const element = new NumberInput('id1', 'Number Input 1', {initialValue: ex`40`, label: ex`"Number Input One"`})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(nameInputValue()).toBe('Number Input 1')
    expect(inputValue('Label')).toBe('"Number Input One"')
    expect(inputValue('Initial Value')).toBe('40')
})

test('has fields for TrueFalseInput', () => {
    const element = new TrueFalseInput('id1', 'True False Input 1', {
        initialValue: ex`true`,
        label: ex`"True False Input One"`
    })
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
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
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
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
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(nameInputValue()).toBe('Select Input 1')
    expect(inputValue('Label')).toBe('Select Input One')
    expect(inputValue('Values')).toBe('Green, Blue, Pink')
    expect(inputValue('Initial Value')).toBe('Green')
})

test('has fields for Button', () => {
    const element = new Button('id1', 'Button 1', {content: ex`"Hi!"`, appearance: 'link', action: ex`doIt()`, show: false})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
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
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(nameInputValue()).toBe('Menu 1')
    expect(inputValue('Label')).toBe('"Hi!"')
    expect(selectValue('Filled')).toBe('true')
})

test('has fields for MenuItem', () => {
    const element = new MenuItem('id1', 'Menu Item 1', {label: ex`"Hi!"`, action: ex`doIt()`, show: false})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(nameInputValue()).toBe('Menu Item 1')
    expect(inputValue('Label')).toBe('"Hi!"')
    expect(selectValue('Show')).toBe('false')
    expect(inputValue('Action')).toBe('doIt()')
    expect(kindButton(1).textContent).toBe('fx=')
    expect(kindButton(1).disabled).toBe(true)
})

test('has fields for List', () => {
    const element = new List('id1', 'List 1', {styles: {color: ex`funky`, width: '100%'},
        selectable: true, selectAction: ex`Log(\$item.id)`}, [])
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(idField().textContent).toBe('id1')
    expect(nameInputValue()).toBe('List 1')
    expect(inputValue('Formula Name')).toBe('List1')
    expect(inputValue('Color')).toBe('funky')
    expect(inputValue('Width')).toBe('100%')
})

test('has fields for Data', () => {
    const element = new Data('id1', 'Data 1', {initialValue: ex`"Hi!"`})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(nameInputValue()).toBe('Data 1')
    expect(inputValue('Initial Value')).toBe('"Hi!"')
    expect(selectValue('Display')).toBe('')
})

test('has fields for Collection', () => {
    const element = new Collection('id1', 'Collection 1', {initialValue: ex`["green", "blue"]`, dataStore: ex`dataStore_1`, collectionName: 'Things'})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
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
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(nameInputValue()).toBe('Memory Data Store 1')
    expect(inputValue('Initial Value')).toBe('{ Widgets: { w1: {a: 10}} }')
    expect(kindButton(0).textContent).toBe('fx=')
    expect(kindButton(0).disabled).toBe(true)
    expect(selectValue('Display')).toBe('')
})

test('has fields for FunctionDef', () => {
    const element = new FunctionDef('id1', 'Function 1', {input1: 'foo', input5: 'bar', calculation: ex`42`, private: true})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
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
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
    expect(nameInputValue()).toBe('File Data Store 1')
})

test('shows errors for element', () => {
    const element = new Text('id1', 'Text 1', {content: 'abc'})
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop} errors={{
        element: 'Unknown condition',
    }}/>)
    expect(nameInputValue()).toBe('Text 1')
    expect(inputValue('Content')).toBe('abc')
    expect(elementErrorValue()).toBe('Unknown condition')
})

test('shows errors for a normal property', () => {
    const element = new Text('id1', 'Text 1', {
        content: ex`Splurge`,
    })
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop} errors={{
        content: 'Unknown name "Splurge"',
    }}/>)
    expect(nameInputValue()).toBe('Text 1')
    expect(inputValue('Content')).toBe('Splurge')
    expect(errorValue('Content')).toBe('Unknown name "Splurge"')
})

test('shows errors for styles properties', () => {
    // const start = Date.now()
    const element = new TextInput('id1', 'Text Input 1', {
        styles: {
            fontSize: 44,
            backgroundColor: ex`Splurge`,
            border: ex`10+`,
        }
    })
    // console.log(1, Date.now() - start)
    render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop} errors={{
        styles: {
            backgroundColor: 'Unknown name "Splurge"',
            border: 'Unexpected end of input'
        }
    }}/>)
    // console.log(2, Date.now() - start)
    expect(nameInputValue()).toBe('Text Input 1')
    // console.log('2a', Date.now() - start)
    expect(inputValue('Background Color')).toBe('Splurge')
    // console.log('2b', Date.now() - start)
    expect(errorValue('Background Color')).toBe('Unknown name "Splurge"')
    // console.log('2c', Date.now() - start)
    expect(inputValue('Border')).toBe('10+')
    // console.log('2d', Date.now() - start)
    expect(errorValue('Border')).toBe('Unexpected end of input')
    // console.log(3, Date.now() - start)
})

describe('Preset position styles', () => {
    const centerPreset = presetPositionStyles.center
    const topLeftPreset = presetPositionStyles.topLeft
    const centerPresetModified = {...centerPreset, top: '49%'}
    const centerPresetWithRight = {...centerPreset, right: '0'}

    test('shows empty preset if styles do not match a preset', () => {
        const element = new Text('id1', 'Text 1', {content: 'x', styles: centerPresetModified})
        render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
        expect(selectValue('Preset Position')).toBe('')
    })

    test('shows empty preset if styles match a preset but have extra positioning styles', () => {
        const element = new Text('id1', 'Text 1', {content: 'x', styles: centerPresetWithRight})
        render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
        expect(selectValue('Preset Position')).toBe('')
    })

    test('shows preset name if styles match a preset', () => {
        const element = new Text('id1', 'Text 1', {content: 'x', styles: centerPreset})
        render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
        expect(selectValue('Preset Position')).toBe('center')
    })

    test('updates styles to match a preset', () => {
        const element = new Text('id1', 'Text 1', {content: 'x', styles: centerPreset})
        render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
        expect(selectValue('Preset Position')).toBe('center')
        fireEvent.input(select('Preset Position'), {target: {value: 'topLeft'}})
        expect(changedValue).toStrictEqual(topLeftPreset)
        expect(onChange).toHaveBeenCalledWith('id1', 'styles', topLeftPreset)
    })

    test('updates styles to clear a preset', () => {
        const element = new Text('id1', 'Text 1', {content: 'x', styles: {...centerPreset, color: 'blue'}})
        render( <PropertyEditor element={element} propertyDefs={element.propertyDefs} onChange={onChange} onNameSelected={onNameSelected} onSearch={noop}/>)
        expect(selectValue('Preset Position')).toBe('center')
        fireEvent.input(select('Preset Position'), {target: {value: ''}})
        expect(changedValue).toStrictEqual({color: 'blue'})
        expect(onChange).toHaveBeenCalledWith('id1', 'styles', {color: 'blue'})
    })
})

