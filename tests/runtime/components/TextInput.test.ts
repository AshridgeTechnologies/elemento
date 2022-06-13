/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {TextInput} from '../../../src/runtime/components/index'
import {snapshot, testProxy} from '../../testutil/testHelpers'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {stateProxy} from '../../../src/runtime/stateProxy'
import {testContainer, wait} from '../../testutil/rtlHelpers'

test('TextInput element produces output with properties supplied',
    snapshot(createElement(TextInput, {state: testProxy('app.page1.width', new TextInput.State({initialValue: 'Hi there!'})), maxLength: 10, width: 22, label: 'Item Description'}))
)

test('TextInput element produces output with properties supplied as state objects', () => {
    let container = testContainer(createElement(TextInput, {
        state: testProxy('app.page1.widget1', new TextInput.State({initialValue: 'Hello!'})),
        maxLength: testProxy('path.x', {value: 10}),
        label: testProxy('path.x', {value: 'Item Description'})
    }))
    expect(container.querySelector('input[id="app.page1.widget1"]').maxLength).toBe(10)
    expect(container.querySelector('label[for="app.page1.widget1"]').innerHTML).toBe('Item Description')
})

test('TextInput element produces output with multiline', async () => {
    const {container} = render(createElement(TextInput, {state: testProxy('app.page1.description', new TextInput.State({initialValue: 'Hi there!'})), multiline: true, label: 'Item Description'}))
    expect(container.innerHTML).toMatchSnapshot()
})

test('TextInput element produces output with default values where properties omitted',
    snapshot(createElement(TextInput, {state: testProxy('app.page1.height', new TextInput.State({initialValue: undefined}))}))
)

test('TextInput shows value from the state supplied', () => {
    let container = testContainer(createElement(TextInput, {state: testProxy('app.page1.widget1', new TextInput.State({initialValue: 'Hello!'}))}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('Hello!')
})

test('TextInput shows empty value when state value is absent', () => {
    let container = testContainer(createElement(TextInput, {state: testProxy('app.page1.widget1', {}, new TextInput.State({initialValue: 'Hi there!'}))}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('TextInput shows empty value when state value is set to undefined', () => {
    let container = testContainer(createElement(TextInput, {state: testProxy('app.page1.widget1', new TextInput.State({initialValue: undefined}), new TextInput.State({initialValue: undefined}))}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('TextInput shows initial value when state value is set to undefined and initial value exists', () => {
    let container = testContainer(createElement(TextInput, {state: testProxy('app.page1.widget1', new TextInput.State({initialValue: 'Axe'}), new TextInput.State({initialValue: 'Axe'}))}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('Axe')
})

test('TextInput shows empty value when state value is set to null and initial value exists', () => {
    let container = testContainer(createElement(TextInput, {state: testProxy('app.page1.widget1', new TextInput.State({initialValue: 'Axe'}, null), new TextInput.State({initialValue: 'Axe'}))}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('TextInput stores updated values in the app store section for its path', async () => {
    const updateFn = jest.fn()
    let container = testContainer(createElement(TextInput, {state: stateProxy('app.page1.sprocket', new TextInput.State({initialValue: undefined}, 'Hi'), new TextInput.State({initialValue: undefined}), updateFn)}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.type(inputEl, '!')
    await wait(10)
    expect(updateFn).toHaveBeenCalledWith('app.page1.sprocket', new TextInput.State({initialValue: undefined}, 'Hi!'), true)
} )

test('TextInput stores null value in the app store when cleared', async () => {
    const updateFn = jest.fn()
    let container = testContainer(createElement(TextInput, {state: stateProxy('app.page1.sprocket', new TextInput.State({initialValue: 'Hi'}), new TextInput.State({initialValue: undefined}), updateFn)}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.clear(inputEl)
    await wait(10)
    expect(updateFn).toHaveBeenCalledWith('app.page1.sprocket', new TextInput.State({initialValue: 'Hi'}, null), true)
} )

test('State class has correct properties and functions', () => {
    const state = new TextInput.State({initialValue: 'car'})
    expect(state.value).toBe('car')
    expect(state.defaultValue).toBe('')

    expect(state.Reset()).toStrictEqual(new TextInput.State({initialValue: 'car'}, undefined))
})
