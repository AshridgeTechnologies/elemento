/**
 * @jest-environment jsdom
 */
import React, {createElement} from 'react'
import PropertyEditor from '../../src/editor/PropertyEditor'

import {fireEvent, render as tlRender, screen} from '@testing-library/react'
import Page from '../../src/model/Page'
import Text from '../../src/model/Text'
import TextInput from '../../src/model/TextInput'
import Button from '../../src/model/Button'
import {componentJSON, componentProps} from '../util/testHelpers'
import {ex} from '../../src/util/helpers'
import NumberInput from '../../src/model/NumberInput'
import TrueFalseInput from '../../src/model/TrueFalseInput'

let container: any
let changedValue: any

const render = (element: React.ReactElement) => ({container} = tlRender(element))
const onChange = (id: string,propName: string,value: any) => {
    changedValue = value
}

const input = (label: string) => (screen.getByLabelText(label) as HTMLInputElement)
const select = (label: string) => (screen.getByLabelText(label).nextSibling as HTMLInputElement)
const inputValue = (label: string) => input(label).value
const selectValue = (label: string) => select(label).value
const kindButton = (index: number) => {
    const nodes = container.querySelectorAll('button').values()
    return Array.from(nodes)[index] as HTMLButtonElement
}

test('PropertyEditor has expected structure for Text', ()=> {
    const element = new Text('id1', 'Text 1', {content: ex`"Hi there!"`})
    expect(componentJSON(createElement(PropertyEditor, {element, onChange}))).toMatchSnapshot()
})

test('PropertyEditor updates name', () => {
    const element = new Page('id1', 'Page 1', {style: ex`funky`}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Page 1')
    fireEvent.input(input('Name'), {target: {value: 'Page One'}})
    // expect(inputValue('Name')).toBe('Page One')
    expect(changedValue).toBe('Page One')
})

test('PropertyEditor updates other properties', () => {
    const element = new Page('id1', 'Page 1', {style: ex`funky`}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Style')).toBe('funky')
    fireEvent.input(input('Style'), {target: {value: 'cool'}})
    expect(changedValue).toStrictEqual({expr: 'cool'})
})

test('PropertyEditor has fields for Page', ()=> {
    const element = new Page('id1', 'Page 1', {style: ex`funky`}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Page 1')
    expect(inputValue('Style')).toBe('funky')

    expect(kindButton(0).textContent).toBe('fx=')
})

test('PropertyEditor has fields for Page with literal value', ()=> {
    const element = new Page('id1', 'Page 1', {style: `clear`}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Page 1')
    expect(inputValue('Style')).toBe('clear')
    expect(kindButton(0).textContent).toBe('abc')
})

test('PropertyEditor shows controlled component for optional fields for Page', ()=> {
    const element = new Page('id1', 'Page 1', {}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Style')).toBe('')
    const styleInput = screen.getByLabelText('Style') as HTMLInputElement
    expect(componentProps(styleInput).value).toBe('')
})

test('PropertyEditor has fields for Text', ()=> {
    const element = new Text('id1', 'Text 1', {content: ex`"Hi!"`})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Text 1')
    expect(inputValue('Content')).toBe('"Hi!"')
    expect(selectValue('Display')).toBe('true')
})

test('PropertyEditor has fields for TextInput', ()=> {
    const element = new TextInput('id1', 'Text Input 1', {initialValue: ex`"Hi!"`, maxLength: ex`10`, label: ex`"Text One"`})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Text Input 1')
    expect(inputValue('Label')).toBe('"Text One"')
    expect(inputValue('Initial Value')).toBe('"Hi!"')
    expect(inputValue('Max Length')).toBe('10')
})

test('PropertyEditor has fields for NumberInput', ()=> {
    const element = new NumberInput('id1', 'Number Input 1', {initialValue: ex`40`, label: ex`"Number Input One"`})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Number Input 1')
    expect(inputValue('Label')).toBe('"Number Input One"')
    expect(inputValue('Initial Value')).toBe('40')
})

test('PropertyEditor has fields for TrueFalseInput', ()=> {
    const element = new TrueFalseInput('id1', 'True False Input 1', {initialValue: ex`true`, label: ex`"True False Input One"`})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('True False Input 1')
    expect(inputValue('Label')).toBe('"True False Input One"')
    expect(inputValue('Initial Value')).toBe('true')
})

test('PropertyEditor has fields for Button', ()=> {
    const element = new Button('id1', 'Button 1', {content: ex`"Hi!"`, action: ex`doIt()`})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Button 1')
    expect(inputValue('Content')).toBe('"Hi!"')
    expect(inputValue('Action')).toBe('doIt()')
    expect(kindButton(1).textContent).toBe('fx=')
    expect(kindButton(1).disabled).toBe(true)
    expect(selectValue('Display')).toBe('true')
})
