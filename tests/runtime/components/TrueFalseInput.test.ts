/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {TrueFalseInput} from '../../../src/runtime/components/index'
import {snapshot, testProxy, testUpdatableProxy} from '../../testutil/testHelpers'
import userEvent from '@testing-library/user-event'
import {testContainer} from '../../testutil/rtlHelpers'
import {update} from '../../../src/runtime/stateProxy'

test('TrueFalseInput element produces output with properties supplied',
    snapshot(createElement(TrueFalseInput, {state: testProxy('app.page1.width', {value: true}), label: 'Covered'}))
)

test('TrueFalseInput element produces output with default values where properties omitted',
    snapshot(createElement(TrueFalseInput, {state: testProxy('app.page1.height', {value: false})}))
)

test('TrueFalseInput shows false if that value is in the state', () => {
    let container = testContainer(createElement(TrueFalseInput, {state: testProxy('app.page1.widget1', {value: false})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').checked).toBe(false)
})

test('TrueFalseInput shows true if that value is in the state', () => {
    let container = testContainer(createElement(TrueFalseInput, {state: testProxy('app.page1.widget1', {value: true})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').checked).toBe(true)
})

test('TrueFalseInput shows false if no value is in the state', () => {
    let container = testContainer(createElement(TrueFalseInput, {state: testProxy('app.page1.widget1', {})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').checked).toBe(false)
})

test('TrueFalseInput shows false if an undefined value is in the state', () => {
    let container = testContainer(createElement(TrueFalseInput, {state: testProxy('app.page1.widget1', {value: undefined})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').checked).toBe(false)
})

test('TrueFalseInput shows initial value when state value is set to undefined and initial value exists', () => {
    let container = testContainer(createElement(TrueFalseInput, {state: testProxy('app.page1.widget1', {value: undefined})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').checked).toBe(true)
})

test('TrueFalseInput shows empty value when state value is set to null and initial value exists', () => {
    let container = testContainer(createElement(TrueFalseInput, {state: testProxy('app.page1.widget1', {value: null})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').checked).toBe(false)
})

test('TrueFalseInput element produces output with other properties supplied as state objects', () => {
    let container = testContainer(createElement(TrueFalseInput, {
        state: testProxy('app.page1.widget1', {value: true}),
        label: testProxy('path.x', {value: 'Is it OK'})
    }))
    expect(container.querySelector('label').textContent).toBe('Is it OK')
})

test('TrueFalseInput stores updated values in the app store section for its path', async () => {
    const [state, updateFn] = testUpdatableProxy('app.page1.sprocket', {value: false}, {_type: TrueFalseInput.State})
    let container = testContainer(createElement(TrueFalseInput, {state}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.click(inputEl)
    expect(updateFn).toHaveBeenCalledWith('app.page1.sprocket', {value: true}, false)
} )

test('State class has correct properties', () => {
    const state = new TrueFalseInput.State({value: true})
    expect(state.value).toBe(true)
    expect(state.defaultValue).toBe(false)

    expect(state.Reset()).toStrictEqual(update({value: undefined}))
})
