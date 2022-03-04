/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import TrueFalseInput from '../../src/runtime/TrueFalseInput'
import {snapshot, testContainer} from '../testutil/testHelpers'
import userEvent from '@testing-library/user-event'
import {stateProxy, useStore} from '../../src/runtime/appData'

test('TrueFalseInput element produces output with properties supplied',
    snapshot(createElement(TrueFalseInput, {state: stateProxy('app.page1.width', {value: true}), label: 'Covered'}))
)

test('TrueFalseInput element produces output with default values where properties omitted',
    snapshot(createElement(TrueFalseInput, {state: stateProxy('app.page1.height', {value: false})}))
)

test('TrueFalseInput shows false if that value is in the state', () => {
    let container = testContainer(createElement(TrueFalseInput, {state: stateProxy('app.page1.widget1', {value: false}, {defaultValue: false})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').checked).toBe(false)
})

test('TrueFalseInput shows true if that value is in the state', () => {
    let container = testContainer(createElement(TrueFalseInput, {state: stateProxy('app.page1.widget1', {value: true}, {defaultValue: false})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').checked).toBe(true)
})

test('TrueFalseInput shows false if no value is in the state', () => {
    let container = testContainer(createElement(TrueFalseInput, {state: stateProxy('app.page1.widget1', {}, {defaultValue: false})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').checked).toBe(false)
})

test('TrueFalseInput shows false if an undefined value is in the state', () => {
    let container = testContainer(createElement(TrueFalseInput, {state: stateProxy('app.page1.widget1', {value: undefined}, {defaultValue: false})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').checked).toBe(false)
})

test('TrueFalseInput shows initial value when state value is set to undefined and initial value exists', () => {
    let container = testContainer(createElement(TrueFalseInput, {state: stateProxy('app.page1.widget1', {value: undefined}, {defaultValue: false, value: true})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').checked).toBe(true)
})

test('TrueFalseInput shows empty value when state value is set to null and initial value exists', () => {
    let container = testContainer(createElement(TrueFalseInput, {state: stateProxy('app.page1.widget1', {value: null}, {defaultValue: false, value: true})}))
    expect(container.querySelector('input[id="app.page1.widget1"]').checked).toBe(false)
})

test('TrueFalseInput element produces output with other properties supplied as state objects', () => {
    let container = testContainer(createElement(TrueFalseInput, {
        state: stateProxy('app.page1.widget1', {value: true}, {defaultValue: false}),
        label: stateProxy('path.x', {value: 'Is it OK'})
    }))
    expect(container.querySelector('label').textContent).toBe('Is it OK')
})

test('TrueFalseInput stores updated values in the app store section for its path', async () => {
    let container = testContainer(createElement(TrueFalseInput, {state: stateProxy('app.page1.sprocket', {value: false}, {defaultValue: false})}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.click(inputEl)
    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: true})
    // expect(inputEl.checked).toBe(true)
    // await user.click(inputEl)
    // expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: false})
    // expect(inputEl.checked).toBe(false)
} )

