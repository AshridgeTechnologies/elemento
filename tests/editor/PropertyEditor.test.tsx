/**
 * @jest-environment jsdom
 */
import React from 'react'
import renderer from 'react-test-renderer'
import PropertyEditor from '../../src/editor/PropertyEditor'
import Text from '../../src/model/Text'

import {render, screen} from '@testing-library/react'
import Page from '../../src/model/Page'

const onChange = () => {}

const componentProps = (domElement: any) => {
    const propsKey = Object.keys(domElement).find( k => k.startsWith("__reactProps$"))
    return propsKey !== undefined ? domElement[propsKey as string] : null
}

test('PropertyEditor has expected structure for Text', ()=> {
    const element = new Text('id1', 'Text 1', {contentExpr: '"Hi there!"'})
    const component = renderer.create(React.createElement(PropertyEditor, {element, onChange}))
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
})

test('PropertyEditor has fields for Page', ()=> {

    const element = new Page('id1', 'Page 1', {style: 'funky'}, [])
    render(<PropertyEditor element={element} onChange={onChange}/>)
    const nameInput = screen.getByLabelText('Name') as HTMLInputElement
    expect(nameInput.value).toBe('Page 1')
    const styleInput = screen.getByLabelText('Style') as HTMLInputElement
    expect(styleInput.value).toBe('funky')
})

test('PropertyEditor shows controlled component for optional fields for Page', ()=> {

    let value = undefined
    const saveValue = (id: string, propertyName: string, val: string) => {value = val}
    const element = new Page('id1', 'Page 1', {}, [])
    const component = <PropertyEditor element={element} onChange={saveValue}/>
    render(component)
    const styleInput = screen.getByLabelText('Style') as HTMLInputElement
    expect(styleInput.value).toBe('')
    expect(componentProps(styleInput).value).toBe('')
})

test('PropertyEditor has fields for Text', ()=> {

    const element = new Text('id1', 'Text 1', {contentExpr: '"Hi!"'})
    const onChange = () => {}
    render(<PropertyEditor element={element} onChange={onChange}/>)
    const nameInput = screen.getByLabelText('Name') as HTMLInputElement
    expect(nameInput.value).toBe('Text 1')
    const contentInput = screen.getByLabelText('Content') as HTMLInputElement
    expect(contentInput.value).toBe('"Hi!"')
})