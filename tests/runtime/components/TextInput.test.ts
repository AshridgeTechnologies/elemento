/**
 * @jest-environment jsdom
 */

import {NumberInput, TextInput} from '../../../src/runtime/components/index'
import {componentJSON, snapshot, testAppInterface, wrappedTestElement} from '../../testutil/testHelpers'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {testContainer, wait} from '../../testutil/rtlHelpers'
import {TextInputState} from '../../../src/runtime/components/TextInput'


const [textInput, appStoreHook] = wrappedTestElement(TextInput, TextInputState)

const stateAt = (path: string) => appStoreHook.stateAt(path)

test('TextInput element produces output with properties supplied', () => {
        const component = textInput('app.page1.width', {value: 'Hi there!'}, {
            maxLength: 11,
            width: 23,
            label: 'Item Description'
        })
        expect(componentJSON(component)).toMatchSnapshot()
})

test('TextInput element produces output with properties supplied as state objects', () => {
    let container = testContainer(textInput('app.page1.widget1', {value: 'Hello!'}, {
        maxLength: new NumberInput.State({value: 10}),
        label: new TextInputState({value: 'Item Description'})
    }))
    expect(container.querySelector('input[id="app.page1.widget1"]').maxLength).toBe(10)
    expect(container.querySelector('label[for="app.page1.widget1"]').innerHTML).toBe('Item Description')
})

test('TextInput element produces output with multiline', () => {
    const {container} = render(textInput('app.page1.description', {value: 'Hi there!'}, {multiline: true, label: 'Item Description'}))
    expect(container.innerHTML).toMatchSnapshot()
})

test('TextInput element produces output with default values where properties omitted',
    snapshot(textInput('app.page1.height', {value: undefined}))
)

test('TextInput shows value from the state supplied', () => {
    let container = testContainer(textInput('app.page1.widget1', {value: 'Hello!'}, {}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('Hello!')
})

test('TextInput shows empty value when state value is absent', () => {
    let container = testContainer(textInput('app.page1.widget1', {}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('TextInput shows empty value when state value is set to undefined', () => {
    let container = testContainer(textInput('app.page1.widget1', {value: undefined}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('TextInput shows initial value when state value is set to undefined and initial value exists', () => {
    let container = testContainer(textInput('app.page1.widget1', {value: 'Axe'}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('Axe')
})

test('TextInput shows empty value when state value is set to null and initial value exists', () => {
    let container = testContainer(textInput('app.page1.widget1', new TextInput.State({value: 'Axe'})._withStateForTest({value: null})))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('TextInput stores updated values in the app store section for its path', async () => {
    let container = testContainer(textInput('app.page1.sprocket', {value: 'Hi'}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.type(inputEl, '!')
    await wait(10)
    expect(stateAt('app.page1.sprocket').value).toBe('Hi!')
} )

test('TextInput stores null value in the app store when cleared', async () => {
    let container = testContainer(textInput('app.page1.sprocket', {value: 'Hi'}))
    await wait(0)

    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.clear(inputEl)
    await wait(10)
    expect(stateAt('app.page1.sprocket')._controlValue).toBe(null)
} )

test('State class has correct properties and functions', () => {
    const state = new TextInput.State({value: 'car'})
    const appInterface = testAppInterface(); state.init(appInterface)
    expect(state.value).toBe('car')
    expect(state.defaultValue).toBe('')

    state.Reset()
    expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateForTest({value: undefined}))
})
