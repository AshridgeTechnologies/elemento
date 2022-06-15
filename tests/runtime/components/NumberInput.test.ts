/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {NumberInput} from '../../../src/runtime/components/index'
import {snapshot, testProxy} from '../../testutil/testHelpers'
import userEvent from '@testing-library/user-event'
import {stateProxy, update} from '../../../src/runtime/stateProxy'
import {testContainer} from '../../testutil/rtlHelpers'

test('NumberInput element produces output with properties supplied',
    snapshot(createElement(NumberInput, {state: testProxy('app.page1.width', {value: 27}), label: 'Width'}))
)

test('NumberInput element produces output with default values where properties omitted',
    snapshot(createElement(NumberInput, {state: testProxy('app.page1.height', {value: 0})}))
)

test('NumberInput shows value from the state supplied', () => {
    let container = testContainer(createElement(NumberInput, {state: testProxy('app.page1.widget1', {value: 27})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('27')
})

test('NumberInput element produces output with properties supplied as state objects', () => {
    let container = testContainer(createElement(NumberInput, {
        state: testProxy('app.page1.widget1', {value: 27}),
        label: testProxy('path.x', {value: 'Item Number'})
    }))
    expect(container.querySelector('label[for="app.page1.widget1"]').innerHTML).toBe('Item Number')
})

test('NumberInput shows empty value when state value is absent', () => {
    let container = testContainer(createElement(NumberInput, {state: testProxy('app.page1.widget1', {})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('NumberInput shows empty value when state value is set to undefined', () => {
    let container = testContainer(createElement(NumberInput, {state: testProxy('app.page1.widget1', {value: undefined})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('NumberInput shows initial value when state value is set to undefined and initial value exists', () => {
    let container = testContainer(createElement(NumberInput, {state: testProxy('app.page1.widget1', {value: undefined})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('99')
})

test('NumberInput shows empty value when state value is set to null and initial value exists', () => {
    let container = testContainer(createElement(NumberInput, {state: testProxy('app.page1.widget1', {value: null})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('NumberInput stores updated values in the app store section for its path', async () => {
    const updateFn = jest.fn()
    const proxy = stateProxy('app.page1.sprocket', {value: 27}, updateFn)
    let container = testContainer(createElement(NumberInput, {state: proxy}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.type(inputEl, '6')
    expect(updateFn).toHaveBeenCalledWith('app.page1.sprocket', {value: 276}, false)
} )

test('NumberInput stores null value in the app store when cleared', async () => {
    const updateFn = jest.fn()
    const proxy = stateProxy('app.page1.sprocket', {value: 27}, updateFn)
    let container = testContainer(createElement(NumberInput, {state: proxy}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.clear(inputEl)
    expect(updateFn).toHaveBeenCalledWith('app.page1.sprocket', {value: null}, false)
} )

test('State class has correct properties', () => {
    const state = new NumberInput.State({value: 77})
    expect(state.value).toBe(77)
    expect(state.defaultValue).toBe(0)

    expect(state.Reset()).toStrictEqual(update({value: undefined}))
})
