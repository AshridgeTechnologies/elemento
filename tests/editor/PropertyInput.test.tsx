/**
 * @jest-environment jsdom
 */
import React from 'react'
import PropertyInput from '../../src/editor/PropertyInput'

import {fireEvent, render} from '@testing-library/react'
import {componentProps} from '../util/testHelpers'
import {ElementId} from '../../src/model/Types'

let container: any
let newValue: any
const onChange = (elementId: ElementId, name: string, val: any) => newValue = val

const kindButton = () => container.querySelector('button')
const input = () => container.querySelector('input')
const label = () => container.querySelector('label')

beforeEach(() => {
    newValue = 'not set'
})

test('shows fixed value control for string property if current value is empty', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={undefined} onChange={() => {} }/>))
    expect(kindButton().textContent).toBe('abc')
    expect(input().type).toBe('text')
    expect(input().id).toBe('length')
    expect(input().value).toBe('')
    expect(componentProps(input()).value).toBe('')
    expect(label().textContent).toBe('Length')
})

test('shows fixed value control for string property if current value is a string', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={'Hi there!'} onChange={() => {} }/>))
    expect(kindButton().textContent).toBe('abc')
    expect(input().type).toBe('text')
    expect(input().id).toBe('length')
    expect(input().value).toBe('Hi there!')
    expect(label().textContent).toBe('Length')
})

test('shows fixed value control for number property if current value is a number', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='number' value={10} onChange={() => {} }/>))
    expect(kindButton().textContent).toBe('abc')
    expect(input().type).toBe('text')
    expect(input().id).toBe('length')
    expect(input().value).toBe('10')
    expect(label().textContent).toBe('Length')
})

test('shows fixed value control for boolean property if current value is a boolean', () => {
    ({container} = render(<PropertyInput elementId='el1' name='display' type='boolean' value={true} onChange={() => {} }/>))
    expect(kindButton().textContent).toBe('abc')
    expect(input().type).toBe('text')
    expect(input().previousSibling.id).toBe('display')
    expect(input().value).toBe('true')
    expect(label().textContent).toBe('Display')
})

test('shows expression control for property if current value is an expression', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={{expr: '"Hi there!"'}} onChange={() => {} }/>))
    expect(kindButton().textContent).toBe('fx=')
    expect(input().type).toBe('text')
    expect(input().id).toBe('length')
    expect(input().value).toBe('"Hi there!"')
    expect(label().textContent).toBe('Length')
})

test('calls onChange with undefined if input is empty', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={'Old value'} onChange={onChange}/>))

    fireEvent.input(input(), {target: {value: ''}})
    expect(newValue).toBeUndefined()
})

test('calls onChange with new string fixed value', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={'Old value'} onChange={onChange}/>))

    fireEvent.input(input(), {target: {value: 'New value'}})
    expect(newValue).toStrictEqual('New value')
})

test('calls onChange with new number fixed value', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='number' value={10} onChange={onChange}/>))

    fireEvent.input(input(), {target: {value: '21'}})
    expect(newValue).toStrictEqual(21)
})

test('calls onChange with new string fixed value', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={'Old value'} onChange={onChange}/>))

    fireEvent.input(input(), {target: {value: 'New value'}})
    expect(newValue).toStrictEqual('New value')
})

test.skip('calls onChange with new boolean fixed value', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='boolean' value={true} onChange={onChange}/>))

    fireEvent.change(input(), {target: {value: 'false'}})
    expect(newValue).toStrictEqual(false)
})

test('calls onChange with new expression value', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={{expr: 'Old_value'}} onChange={onChange}/>))

    fireEvent.input(input(), {target: {value: '"New value"'}})
    expect(newValue).toStrictEqual({expr: '"New value"'})
})

test('calls onChange with undefined if input is empty on expression value', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={{expr: 'Old_value'}} onChange={onChange}/>))

    fireEvent.input(input(), {target: {value: ''}})
    expect(newValue).toBeUndefined()
})

test('calls onChange with undefined if started empty and toggle button, but saves state for next input', () => {
    ({container} = render(<PropertyInput elementId='el2' name='length' type='string' value={undefined} onChange={onChange}/>))

    fireEvent.click(kindButton())
    expect(newValue).toBeUndefined()

    fireEvent.input(input(), {target: {value: '"New value"'}})
    expect(newValue).toStrictEqual({expr: '"New value"'})
})

test('calls onChange with new expression value if started with fixed value and toggle button', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={"Old value"} onChange={onChange}/>))

    fireEvent.click(kindButton())
    expect(newValue).toStrictEqual({expr: 'Old value'})

    // fireEvent.input(input(), {target: {value: '"New value"'}})
    // expect(newValue).toStrictEqual({expr: '"New value"'})
})

test('calls onChange with new fixed value if started with expression and toggle button', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={{expr: 'Old_value'}} onChange={onChange}/>))

    fireEvent.click(kindButton())
    expect(newValue).toStrictEqual('Old_value')

    // fireEvent.input(input(), {target: {value: 'New value'}})
    // expect(newValue).toStrictEqual('New value')
})

test('calls onChange with new expression value if started with boolean fixed value and toggle button', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='boolean' value={true} onChange={onChange}/>))

    fireEvent.click(kindButton())
    expect(newValue).toStrictEqual({expr: "true"})

    // fireEvent.input(input(), {target: {value: '"New value"'}})
    // expect(newValue).toStrictEqual({expr: '"New value"'})
})

test('calls onChange with undefined on boolean if started with expression and toggle button', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='boolean' value={{expr: 'true'}} onChange={onChange}/>))

    fireEvent.click(kindButton())
    expect(newValue).toBe(undefined)

    // fireEvent.input(input(), {target: {value: 'New value'}})
    // expect(newValue).toStrictEqual('New value')
})




