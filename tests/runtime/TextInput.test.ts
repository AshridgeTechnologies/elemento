/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import TextInput from '../../src/runtime/TextInput'
import {snapshot, testContainer, wait} from '../testutil/testHelpers'
import {render} from '@testing-library/react'
import {stateProxy, useStore} from '../../src/runtime/appData'
import userEvent from '@testing-library/user-event'

test('TextInput element produces output with properties supplied',
    snapshot(createElement(TextInput, {state: stateProxy('app.page1.width', {value: 'Hi there!'}), maxLength: 10, width: 22, label: 'Item Description'}))
)

test('TextInput element produces output with string width',
    snapshot(createElement(TextInput, {state: stateProxy('app.page1.width', {value: 'Hi there!'}), maxLength: 10, width: '22', label: 'Item Description'}))
)

test('TextInput element produces output with properties supplied as state objects', () => {
    let container = testContainer(createElement(TextInput, {
        state: stateProxy('app.page1.widget1', {value: 'Hello!'}),
        maxLength: stateProxy('path.x', {value: 10}),
        label: stateProxy('path.x', {value: 'Item Description'})
    }))
    expect(container.querySelector('input[id="app.page1.widget1"]').maxLength).toBe(10)
    expect(container.querySelector('label[for="app.page1.widget1"]').innerHTML).toBe('Item Description')
})

test('TextInput element produces output with multiline', async () => {
    const {container} = render(createElement(TextInput, {state: stateProxy('app.page1.description', {value: 'Hi there!'}), multiline: true, label: 'Item Description'}))
    expect(container.innerHTML).toMatchSnapshot()
})

test('TextInput element produces output with default values where properties omitted',
    snapshot(createElement(TextInput, {state: stateProxy('app.page1.height', {value: ''})}))
)

test('TextInput shows value from the state supplied', () => {
    let container = testContainer(createElement(TextInput, {state: stateProxy('app.page1.widget1', {value: 'Hello!'}, {defaultValue: ''})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('Hello!')
})

test('TextInput shows empty value when state value is absent', () => {
    let container = testContainer(createElement(TextInput, {state: stateProxy('app.page1.widget1', {}, {defaultValue: ''})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('TextInput shows empty value when state value is set to undefined', () => {
    let container = testContainer(createElement(TextInput, {state: stateProxy('app.page1.widget1', {value: undefined}, {defaultValue: ''})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('TextInput shows initial value when state value is set to undefined and initial value exists', () => {
    let container = testContainer(createElement(TextInput, {state: stateProxy('app.page1.widget1', {value: undefined}, {defaultValue: '', value: 'Axe'})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('Axe')
})

test('TextInput shows empty value when state value is set to null and initial value exists', () => {
    let container = testContainer(createElement(TextInput, {state: stateProxy('app.page1.widget1', {value: null}, {defaultValue: '', value: 'Axe'})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('TextInput stores updated values in the app store section for its path', async () => {
    let container = testContainer(createElement(TextInput, {state: stateProxy('app.page1.sprocket', {value: 'Hi'}, {defaultValue: ''})}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.type(inputEl, '!')
    await wait(10)
    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: 'Hi!'})
    //expect(inputEl.value).toBe('Hi!')
} )

test('TextInput stores undefined value in the app store when cleared', async () => {
    let container = testContainer(createElement(TextInput, {state: stateProxy('app.page1.sprocket', {value: 'Hi'})}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.clear(inputEl)
    await wait(10)
    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: null})
    //expect(inputEl.value).toBe('Hi!')
} )