/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import NumberInput from '../../src/runtime/NumberInput'
import {snapshot, testContainer, wait} from '../util/testHelpers'
import userEvent from '@testing-library/user-event'
import {useStore} from '../../src/runtime/appData'

test('NumberInput element produces output with properties supplied',
    snapshot(createElement(NumberInput, {state: {value: 27, _path: 'app.page1.width'}, max: 100, label: 'Width'}))
)

test('NumberInput element produces output with default values where properties omitted',
    snapshot(createElement(NumberInput, {state: {value: 0, _path: 'app.page1.height'}}))
)

test('NumberInput shows value from the state supplied', () => {
    let container = testContainer(createElement(NumberInput, {state: {value: 27, _path: 'app.page1.widget1'}}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('27')
})

test('NumberInput shows empty value when state value is absent', () => {
    let container = testContainer(createElement(NumberInput, {state: {_path: 'app.page1.widget1'}}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('NumberInput shows empty value when state value is set to undefined', () => {
    let container = testContainer(createElement(NumberInput, {state: {value: undefined, _path: 'app.page1.widget1'}}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('NumberInput stores updated values in the app store section for its path', async () => {
    let container = testContainer(createElement(NumberInput, {state: {value: 27, _path: 'app.page1.sprocket'}}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.type(inputEl, '6')
    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: 276})
    //expect(inputEl.value).toBe('66')
} )

test('NumberInput stores undefined value in the app store when cleared', async () => {
    let container = testContainer(createElement(NumberInput, {state: {value: 27, _path: 'app.page1.sprocket'}}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.clear(inputEl)
    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: undefined})
    //expect(inputEl.value).toBe('66')
} )
