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
import {componentProps, ex} from '../testutil/testHelpers'
import NumberInput from '../../src/model/NumberInput'
import TrueFalseInput from '../../src/model/TrueFalseInput'
import SelectInput from '../../src/model/SelectInput'
import Data from '../../src/model/Data'
import App from '../../src/model/App'
import Project from '../../src/model/Project'
import { Collection } from '../../src/model'

let container: any
let changedValue: any

const render = (element: React.ReactElement) => ({container} = tlRender(element))
const onChange = (id: string, propName: string, value: any) => {
    changedValue = value
}

const input = (label: string) => (screen.getByLabelText(label) as HTMLInputElement)
const textarea = (label: string) => (screen.getByLabelText(label) as HTMLTextAreaElement)
const select = (label: string) => (screen.getByLabelText(label).nextSibling as HTMLInputElement)
const inputValue = (label: string) => input(label).value
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

test('updates name', () => {
    const element = new Page('id1', 'Page 1', {style: ex`funky`}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Page 1')
    fireEvent.input(input('Name'), {target: {value: 'Page One'}})
    expect(changedValue).toBe('Page One')
})

test('updates other properties', () => {
    const element = new Page('id1', 'Page 1', {style: ex`funky`}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Style')).toBe('funky')
    fireEvent.input(input('Style'), {target: {value: 'cool'}})
    expect(changedValue).toStrictEqual({expr: 'cool'})
})

test('has fields for Project', () => {
    const element = new Project('id1', 'Project 1', {author: 'Me!'}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Id')).toBe('id1')
    expect(inputValue('Name')).toBe('Project 1')
    expect(inputValue('Formula Name')).toBe('Project1')
    expect(inputValue('Author')).toBe('Me!')
    expect(kindButton(0).textContent).toBe('abc')
})

test('has fields for App', () => {
    const element = new App('id1', 'App 1', {author: ex`Me + You`}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Id')).toBe('id1')
    expect(inputValue('Name')).toBe('App 1')
    expect(inputValue('Formula Name')).toBe('App1')
    expect(inputValue('Author')).toBe('Me + You')
    expect(kindButton(0).textContent).toBe('fx=')
})

test('has fields for Page', () => {
    const element = new Page('id1', 'Page 1', {style: ex`funky`}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Id')).toBe('id1')
    expect(inputValue('Name')).toBe('Page 1')
    expect(inputValue('Formula Name')).toBe('Page1')
    expect(inputValue('Style')).toBe('funky')
    expect(kindButton(0).textContent).toBe('fx=')
})

test('has fields for Page with literal value', () => {
    const element = new Page('id1', 'Page 1', {style: `clear`}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Page 1')
    expect(inputValue('Style')).toBe('clear')
    expect(kindButton(0).textContent).toBe('abc')
})

test('shows controlled component for optional fields for Page', () => {
    const element = new Page('id1', 'Page 1', {}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Style')).toBe('')
    const styleInput = screen.getByLabelText('Style') as HTMLInputElement
    expect(componentProps(styleInput).value).toBe('')
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
        display: true
    })
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Text 1')
    expect(textareaValue('Content')).toBe('Hi!\nGood morning')
    expect(inputValue('Font Size')).toBe('44')
    expect(inputValue('Font Family')).toBe('Dog')
    expect(inputValue('Color')).toBe('red')
    expect(inputValue('Background Color')).toBe('blue')
    expect(inputValue('Border')).toBe('10')
    expect(inputValue('Border Color')).toBe('black')
    expect(inputValue('Width')).toBe('100')
    expect(inputValue('Height')).toBe('200')
    expect(selectValue('Display')).toBe('true')
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
    expect(inputValue('Name')).toBe('Text Input 1')
    expect(inputValue('Label')).toBe('"Text One"')
    expect(inputValue('Initial Value')).toBe('"Hi!"')
    expect(inputValue('Max Length')).toBe('10')
    expect(inputValue('Width')).toBe('22')
    expect(inputValue('Multiline')).toBe('true || false')
})

test('has fields for TextInput with default values', () => {
    const element = new TextInput('id1', 'Text Input 1', {})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Text Input 1')
    expect(inputValue('Label')).toBe('')
    expect(inputValue('Initial Value')).toBe('')
    expect(inputValue('Max Length')).toBe('')
    expect(inputValue('Width')).toBe('')
    expect(inputValue('Multiline')).toBe(undefined)
})

test('has fields for NumberInput', () => {
    const element = new NumberInput('id1', 'Number Input 1', {initialValue: ex`40`, label: ex`"Number Input One"`})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Number Input 1')
    expect(inputValue('Label')).toBe('"Number Input One"')
    expect(inputValue('Initial Value')).toBe('40')
})

test('has fields for TrueFalseInput', () => {
    const element = new TrueFalseInput('id1', 'True False Input 1', {
        initialValue: ex`true`,
        label: ex`"True False Input One"`
    })
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('True False Input 1')
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
    expect(inputValue('Name')).toBe('Select Input 1')
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
    expect(inputValue('Name')).toBe('Select Input 1')
    expect(inputValue('Label')).toBe('Select Input One')
    expect(inputValue('Values')).toBe('Green, Blue, Pink')
    expect(inputValue('Initial Value')).toBe('Green')
})

test('has fields for Button', () => {
    const element = new Button('id1', 'Button 1', {content: ex`"Hi!"`, action: ex`doIt()`, display: false})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Button 1')
    expect(inputValue('Content')).toBe('"Hi!"')
    expect(inputValue('Action')).toBe('doIt()')
    expect(kindButton(1).textContent).toBe('fx=')
    expect(kindButton(1).disabled).toBe(true)
    expect(selectValue('Display')).toBe('false')
})

test('has fields for Data', () => {
    const element = new Data('id1', 'Data 1', {initialValue: ex`"Hi!"`})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Data 1')
    expect(inputValue('Initial Value')).toBe('"Hi!"')
    expect(selectValue('Display')).toBe('')
})

test('has fields for Collection', () => {
    const element = new Collection('id1', 'Collection 1', {initialValue: ex`["green", "blue"]`})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Collection 1')
    expect(inputValue('Initial Value')).toBe('["green", "blue"]')
    expect(selectValue('Display')).toBe('')
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
    expect(inputValue('Name')).toBe('Text 1')
    expect(textareaValue('Content')).toBe('Hi!\nGood morning')
    expect(inputValue('Background Color')).toBe('Splurge')
    expect(errorValue('Background Color')).toBe('Unknown name "Splurge"')
    expect(inputValue('Width')).toBe('-100')
    expect(errorValue('Width')).toBe('Must be greater than or equal to zero')

})




