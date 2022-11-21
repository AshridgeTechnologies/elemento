/**
 * @jest-environment jsdom
 */

import {NumberInput, TextInput} from '../../../src/runtime/components/index'
import {snapshot, testAppInterface, wrappedTestElement} from '../../testutil/testHelpers'
import userEvent from '@testing-library/user-event'
import {testContainer, wait} from '../../testutil/rtlHelpers'
import {TextInputState} from '../../../src/runtime/components/TextInput'
import {NumberInputState} from '../../../src/runtime/components/NumberInput'

const [numberInput, appStoreHook] = wrappedTestElement(NumberInput, NumberInputState)

const stateAt = (path: string) => appStoreHook.stateAt(path)

test('NumberInput element produces output with properties supplied',
    snapshot(numberInput('app.page1.width', {value: 27}, {label: 'Width'}))
)

test('NumberInput element produces output with default values where properties omitted',
    snapshot(numberInput('app.page1.height'))
)

test('NumberInput shows value from the state supplied', () => {
    let container = testContainer(numberInput('app.page1.widget1', {value: 27}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('27')
})

test('NumberInput element produces output with properties supplied as state objects', () => {
    let container = testContainer(numberInput('app.page1.widget1', {value: 27},
        {label: new TextInputState({value: 'Item Number'})}))
    expect(container.querySelector('label[for="app.page1.widget1"]').innerHTML).toBe('Item Number')
})

test('NumberInput shows empty value when state value is absent', () => {
    let container = testContainer(numberInput('app.page1.widget1', {}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('NumberInput shows empty value when state value is set to undefined', () => {
    let container = testContainer(numberInput('app.page1.widget1', {value: undefined}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('NumberInput shows initial value when state value  exists', () => {
    let container = testContainer(numberInput('app.page1.widget1', {value: 99}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('99')
})

test('NumberInput shows empty value when state value is set to null and initial value exists', () => {
    let container = testContainer(numberInput('app.page1.widget1', new TextInput.State({value: 'Axe'})._withStateForTest({value: null})))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('NumberInput stores updated values in the app store section for its path', async () => {
    let container = testContainer(numberInput('app.page1.sprocket', {value: 27}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.type(inputEl, '6')
    expect(stateAt('app.page1.sprocket').value).toBe(276)
} )

test('NumberInput stores null value in the app store when cleared', async () => {
    let container = testContainer(numberInput('app.page1.sprocket', {value: 27}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.clear(inputEl)
    expect(stateAt('app.page1.sprocket')._controlValue).toBe(null)
} )

test('State class has correct properties', () => {
    const emptyState = new NumberInput.State({})
    expect(emptyState.value).toBe(0)
    expect(emptyState._controlValue).toBe(undefined)
    expect(emptyState.defaultValue).toBe(0)

    const state = new NumberInput.State({value: 77})
    const appInterface = testAppInterface(); state.init(appInterface)
    expect(state.value).toBe(77)
    expect(state.defaultValue).toBe(0)

    state.Reset()
    const resetState = state._withStateForTest({value: undefined})
    expect(appInterface.updateVersion).toHaveBeenCalledWith(resetState)
    expect(resetState.value).toBe(77)
    expect(resetState._controlValue).toBe(77)

    const clearedState = state._withStateForTest({value: null})
    expect(clearedState.value).toBe(0)
    expect(clearedState._controlValue).toBe(null)
})
