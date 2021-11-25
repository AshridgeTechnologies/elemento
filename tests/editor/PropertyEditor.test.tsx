/**
 * @jest-environment jsdom
 */
import React, {createElement} from 'react'
import PropertyEditor from '../../src/editor/PropertyEditor'
import Text from '../../src/model/Text'

import {render, screen} from '@testing-library/react'
import Page from '../../src/model/Page'
import TextInput from '../../src/model/TextInput'
import {componentJSON} from '../util/testHelpers'

const onChange = () => {}

const componentProps = (domElement: any) => {
    const propsKey = Object.keys(domElement).find( k => k.startsWith("__reactProps$"))
    return propsKey !== undefined ? domElement[propsKey as string] : null
}

const inputValue = function (label: string) {
    const input = screen.getByLabelText(label) as HTMLInputElement
    return input.value
}

test('PropertyEditor has expected structure for Text', ()=> {
    const element = new Text('id1', 'Text 1', {contentExpr: '"Hi there!"'})
    expect(componentJSON(createElement(PropertyEditor, {element, onChange}))).toMatchSnapshot()
})

test('PropertyEditor has fields for Page', ()=> {
    const element = new Page('id1', 'Page 1', {style: 'funky'}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Page 1')
    expect(inputValue('Style')).toBe('funky')
})

test('PropertyEditor shows controlled component for optional fields for Page', ()=> {
    const element = new Page('id1', 'Page 1', {}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Style')).toBe('')
    const styleInput = screen.getByLabelText('Style') as HTMLInputElement
    expect(componentProps(styleInput).value).toBe('')
})

test('PropertyEditor has fields for Text', ()=> {
    const element = new Text('id1', 'Text 1', {contentExpr: '"Hi!"'})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Text 1')
    expect(inputValue('Content')).toBe('"Hi!"')
})

test('PropertyEditor has fields for TextInput', ()=> {
    const element = new TextInput('id1', 'Text Input 1', {initialValue: '"Hi!"', maxLength: "10", label: '"Text One"'})
    render(<PropertyEditor element={element} onChange={onChange}/>)
    expect(inputValue('Name')).toBe('Text Input 1')
    expect(inputValue('Label')).toBe('"Text One"')
    expect(inputValue('Initial Value')).toBe('"Hi!"')
    expect(inputValue('Max Length')).toBe('10')
})