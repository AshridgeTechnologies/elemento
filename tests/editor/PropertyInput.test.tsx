/**
 * @jest-environment jsdom
 */
import React from 'react'
import PropertyInput from '../../src/editor/PropertyInput'

import {fireEvent, render} from '@testing-library/react'
import {componentProps} from '../testutil/testHelpers'
import {ElementId, eventAction} from '../../src/model/Types'

let container: any
let newValue: any
const onChange = (elementId: ElementId, name: string, val: any) => newValue = val
const onNameSelected = jest.fn()

const kindButton = () => container.querySelector('button')
const input = () => container.querySelector('input')
const error = () => container.querySelector('label+div+p')
const textarea = () => container.querySelector('textarea')
const label = () => container.querySelector('label')

beforeEach(() => {
    newValue = 'not set'
})

test('shows read only control for string property', () => {
    ({container} = render(<PropertyInput elementId='el1' name='description' type='string' readOnly={true} value='This is what it is'  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton()).toBe(null)
    expect(textarea().type).toBe('textarea')
    expect(textarea().id).toBe('description')
    expect(textarea().value).toBe('This is what it is')
    expect(textarea().readOnly).toBe(true)
    expect(label().textContent).toBe('Description')
})

test('shows fixed value control for string property if current value is empty', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={undefined}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('abc')
    expect(textarea().type).toBe('textarea')
    expect(textarea().id).toBe('length')
    expect(textarea().value).toBe('')
    expect(componentProps(textarea()).value).toBe('')
    expect(label().textContent).toBe('Length')
})

test('shows fixed value control for date property if current value is empty', () => {
    ({container} = render(<PropertyInput elementId='el1' name='start' type='date' value={undefined}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('dmy')
    expect(input().type).toBe('date')
    expect(input().id).toBe('start')
    expect(input().value).toBe('')
    expect(componentProps(input()).value).toBe('')
    expect(label().textContent).toBe('Start')
})

test('shows fixed value control for string or number property if current value is empty', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string|number' value={undefined}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('a12')
    expect(textarea().type).toBe('textarea')
    expect(textarea().id).toBe('length')
    expect(textarea().value).toBe('')
    expect(componentProps(textarea()).value).toBe('')
    expect(label().textContent).toBe('Length')
})

test('shows fixed value control for string list property if current value is empty', () => {
    ({container} = render(<PropertyInput elementId='el1' name='color' type='string list' value={undefined}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('abc')
    expect(textarea().type).toBe('textarea')
    expect(textarea().id).toBe('color')
    expect(textarea().value).toBe('')
    expect(label().textContent).toBe('Color')
})

test('shows fixed value control for ChoiceList property if current value is empty', () => {
    ({container} = render(<PropertyInput elementId='el1' name='color' type={['red', 'green', 'blue']} value={undefined}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('sel')
    expect(input().type).toBe('text')
    expect(input().previousSibling.id).toBe('color')
    expect(input().value).toBe('')
    expect(label().textContent).toBe('Color')
})

test('shows expression-only control for action property if current value is empty', () => {
    ({container} = render(<PropertyInput elementId='el1' name='theAction' type={eventAction()} value={undefined}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('fx=')
    expect(kindButton().disabled).toBe(true)
    expect(textarea().id).toBe('theAction')
    expect(textarea().textContent).toBe('')
    expect(label().textContent).toBe('The Action')
})

test('shows expression-only control for expr property if current value is empty', () => {
    ({container} = render(<PropertyInput elementId='el1' name='theItems' type='expr' value={undefined}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('fx=')
    expect(kindButton().disabled).toBe(true)
    expect(textarea().id).toBe('theItems')
    expect(textarea().textContent).toBe('')
    expect(label().textContent).toBe('The Items')
})

test('shows fixed-only control for string fixed-only property if current value is empty', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={undefined} fixedOnly  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('abc')
    expect(kindButton().disabled).toBe(true)
    expect(textarea().type).toBe('textarea')
    expect(textarea().id).toBe('length')
    expect(textarea().value).toBe('')
    expect(componentProps(textarea()).value).toBe('')
    expect(label().textContent).toBe('Length')
})

test('shows fixed value control for string property if current value is a string', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={'Hi there!'}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('abc')
    expect(textarea().type).toBe('textarea')
    expect(textarea().id).toBe('length')
    expect(textarea().value).toBe('Hi there!')
    expect(label().textContent).toBe('Length')
})

test('shows fixed value control for string property if current value is a multiline string', () => {
    ({container} = render(<PropertyInput elementId='el1' name='greeting' type='string multiline' value={'Hi there!\nHow are you?'}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('abc')
    expect(textarea().id).toBe('greeting')
    expect(textarea().textContent).toBe('Hi there!\nHow are you?')
    expect(label().textContent).toBe('Greeting')
})

test('shows fixed value control for string or number property if current value is a string', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string|number' value={'Hi there!'}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('a12')
    expect(textarea().type).toBe('textarea')
    expect(textarea().id).toBe('length')
    expect(textarea().value).toBe('Hi there!')
    expect(label().textContent).toBe('Length')
})

test('shows fixed value control for number property if current value is a number', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='number' value={10}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('123')
    expect(input().type).toBe('number')
    expect(input().id).toBe('length')
    expect(input().value).toBe('10')
    expect(label().textContent).toBe('Length')
})

test('shows fixed value control for date property if current value is a Date', () => {
    const date1 = new Date('2023-05-04');
    ({container} = render(<PropertyInput elementId='el1' name='start' type='date' value={date1}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('dmy')
    expect(input().type).toBe('date')
    expect(input().id).toBe('start')
    expect(input().value).toBe('2023-05-04')
    expect(input().valueAsDate).toStrictEqual(date1)
    expect(label().textContent).toBe('Start')
})

test('shows fixed value control for boolean property if current value is a boolean', () => {
    ({container} = render(<PropertyInput elementId='el1' name='display' type='boolean' value={true}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('y/n')
    expect(input().type).toBe('text')
    expect(input().previousSibling.id).toBe('display')
    expect(input().value).toBe('true')
    expect(label().textContent).toBe('Display')
})

test('shows fixed value control for string list property if current value is a list', () => {
    ({container} = render(<PropertyInput elementId='el1' name='color' type='string list' value={['Green', 'Blue', 'Red']}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('abc')
    expect(textarea().type).toBe('textarea')
    expect(textarea().id).toBe('color')
    expect(textarea().value).toBe('Green, Blue, Red')
    expect(label().textContent).toBe('Color')
})

test('shows fixed value control for ChoiceList property if current value is a string', () => {
    ({container} = render(<PropertyInput elementId='el1' name='color' type={['red', 'green', 'blue']} value={'green'}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('sel')
    expect(input().type).toBe('text')
    expect(input().previousSibling.id).toBe('color')
    expect(input().value).toBe('green')
    expect(label().textContent).toBe('Color')
})

test('shows expression control for string property if current value is an expression', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={{expr: '"Hi there!"'}}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('fx=')
    expect(textarea().id).toBe('length')
    expect(textarea().textContent).toBe('"Hi there!"')
    expect(label().textContent).toBe('Length')
})

test('shows expression control for string or number property if current value is an expression', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string|number' value={{expr: '47 + 53'}}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('fx=')
    expect(textarea().id).toBe('length')
    expect(textarea().textContent).toBe('47 + 53')
    expect(label().textContent).toBe('Length')
})

test('shows expression control for number property if current value is an expression', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='number' value={{expr: '10 + 20'}}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('fx=')
    expect(textarea().id).toBe('length')
    expect(textarea().textContent).toBe('10 + 20')
    expect(label().textContent).toBe('Length')
})

test('shows expression control for ChoiceList property if current value is an expression', () => {
    ({container} = render(<PropertyInput elementId='el1' name='color' type={['red', 'green', 'blue']} value={{expr: 'theColor + 1'}}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('fx=')
    expect(textarea().id).toBe('color')
    expect(textarea().textContent).toBe('theColor + 1')
    expect(label().textContent).toBe('Color')
})

test('shows expression control for property if type is action and current value is an expression', () => {
    ({container} = render(<PropertyInput elementId='el1' name='onClick' type={eventAction()} value={{expr: 'doIt()'}}  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('fx=')
    expect(textarea().id).toBe('onClick')
    expect(textarea().textContent).toBe('doIt()')
    expect(label().textContent).toBe('On Click')
})

test('shows error message for text field if given', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={{expr: '"Hi there!"'}} error='Must be a number'  onChange={onChange} onNameSelected={onNameSelected}/>))
    expect(kindButton().textContent).toBe('fx=')
    expect(textarea().id).toBe('length')
    expect(textarea().textContent).toBe('"Hi there!"')
    expect(label().textContent).toBe('Length')
    expect(error().textContent).toBe('Must be a number')
})

test('calls onChange with undefined if input is empty', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={'Old value'}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.input(textarea(), {target: {value: ''}})
    expect(newValue).toBeUndefined()
})

test('calls onChange with new string fixed value', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={'Old value'}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.input(textarea(), {target: {value: 'New value'}})
    expect(newValue).toBe('New value')
})

test('calls onChange with new string multiline fixed value', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string multiline' value={'Old value\nLine 2'}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.input(textarea(), {target: {value: 'New value\nLine 3'}})
    expect(newValue).toBe('New value\nLine 3')
})

test('calls onChange with new string fixed value in string or number', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string|number' value={'Old value'}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.input(textarea(), {target: {value: 'New value'}})
    expect(newValue).toBe('New value')
})

test('calls onChange with new number fixed value in string or number', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string|number' value={'Old value'}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.input(textarea(), {target: {value: '27'}})
    expect(newValue).toBe(27)
})

test('calls onChange with new number fixed value', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='number' value={10}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.input(input(), {target: {value: '21'}})
    expect(newValue).toBe(21)
})

test('calls onChange with new date fixed value', () => {
    const date1 = new Date('2023-05-04');
    ({container} = render(<PropertyInput elementId='el1' name='start' type='date' value={date1}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.input(input(), {target: {value: '2024-02-03'}})
    expect(newValue).toStrictEqual(new Date('2024-02-03'))
})

test('calls onChange with new string list fixed value and ignores spaces around values', () => {
    ({container} = render(<PropertyInput elementId='el1' name='color' type='string list' value={['Green', 'Red']}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.input(textarea(), {target: {value: ' Blue, Green,   Red, Pinkish grey   '}})
    expect(newValue).toStrictEqual(['Blue', 'Green', 'Red', 'Pinkish grey'])
})

test('calls onChange with new boolean fixed value', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='boolean' value={true}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.change(input(), {target: {value: 'false'}})
    expect(newValue).toBe(false)
})

test('calls onChange with new ChoiceList fixed value', () => {
    ({container} = render(<PropertyInput elementId='el1' name='color' type={['red', 'green', 'blue']} value={'blue'}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.change(input(), {target: {value: 'red'}})
    expect(newValue).toBe('red')
})

test('calls onChange with new expression value', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={{expr: 'Old_value'}}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.input(textarea(), {target: {value: '"New value"'}})
    expect(newValue).toStrictEqual({expr: '"New value"'})
})

test('calls onChange with new action expression value', () => {
    ({container} = render(<PropertyInput elementId='el1' name='onFoo' type={eventAction()} value={{expr: 'doThis()'}}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.input(textarea(), {target: {value: 'doThat()'}})
    expect(newValue).toStrictEqual({expr: 'doThat()'})
})

test('calls onChange with undefined if input is empty on expression value', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={{expr: 'Old_value'}}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.input(textarea(), {target: {value: ''}})
    expect(newValue).toBeUndefined()
})

test('calls onChange with new action expression value if started empty', () => {
    ({container} = render(<PropertyInput elementId='el1' name='onFoo' type={eventAction()} value={undefined}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.input(textarea(), {target: {value: 'doThat()'}})
    expect(newValue).toStrictEqual({expr: 'doThat()'})
})

test('calls onChange with undefined if input is empty on action expression value', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type={eventAction()} value={{expr: 'doWhat()'}}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.input(textarea(), {target: {value: ''}})
    expect(newValue).toBeUndefined()
})

test('calls onChange with undefined if started empty and toggle button, but saves state for next input', () => {
    ({container} = render(<PropertyInput elementId='el2' name='length' type='string' value={undefined}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.click(kindButton())
    expect(newValue).toBeUndefined()

    fireEvent.input(textarea(), {target: {value: '"New value"'}})
    expect(newValue).toStrictEqual({expr: '"New value"'})
})

test('calls onChange with new expression value if started with fixed value and toggle button', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={"Old value"}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.click(kindButton())
    expect(newValue).toStrictEqual({expr: 'Old value'})
})

test('calls onChange with new fixed value if started with expression and toggle button', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={{expr: 'Old_value'}}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.click(kindButton())
    expect(newValue).toStrictEqual('Old_value')
})

test('calls onChange with new expression value if started with boolean fixed value and toggle button', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='boolean' value={true}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.click(kindButton())
    expect(newValue).toStrictEqual({expr: "true"})
})

test('calls onChange with undefined on boolean if started with expression and toggle button', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='boolean' value={{expr: 'true'}}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.click(kindButton())
    expect(newValue).toBe(undefined)
})

test('calls onNa with undefined on boolean if started with expression and toggle button', () => {
    ({container} = render(<PropertyInput elementId='el1' name='length' type='boolean' value={{expr: 'true'}}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.click(kindButton())
    expect(newValue).toBe(undefined)
})

test('calls onNameSelected with clicked word if ctrl key or meta key pressed', () => {
    const onNameSelected = jest.fn();
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={{expr: 'AnotherElement.something'}}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.click(textarea(), {ctrlKey: true, offsetX: 60, offsetY: 12})
    expect(onNameSelected).toHaveBeenCalledWith('AnotherElement')
})

test('calls onNameSelected with clicked word if meta key pressed', () => {
    const onNameSelected = jest.fn();
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={{expr: 'AnotherElement.something'}}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.click(textarea(), {metaKey: true, offsetX: 60, offsetY: 12})
    expect(onNameSelected).toHaveBeenCalledWith('AnotherElement')
})

test('does not call onNameSelected with clicked word if not in a formula', () => {
    const onNameSelected = jest.fn();
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={'AnotherElement.something'}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.click(textarea(), {metaKey: true, offsetX: 60, offsetY: 12})
    expect(onNameSelected).not.toHaveBeenCalled()
})

test('does not call onNameSelected if control key not pressed', () => {
    const onNameSelected = jest.fn();
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={{expr: 'AnotherElement.something'}}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.click(textarea(), {ctrlKey: false, offsetX: 60, offsetY: 12})
    expect(onNameSelected).not.toHaveBeenCalled()
})

test('does not call onNameSelected if click is not in a word', () => {
    const onNameSelected = jest.fn();
    ({container} = render(<PropertyInput elementId='el1' name='length' type='string' value={{expr: '**********.something'}}  onChange={onChange} onNameSelected={onNameSelected}/>))

    fireEvent.click(textarea(), {ctrlKey: true, offsetX: 60, offsetY: 12})
    expect(onNameSelected).not.toHaveBeenCalled()
})
