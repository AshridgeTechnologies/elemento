/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import NumberInput from '../../src/runtime/NumberInput'
import {snapshot, testContainer} from '../util/testHelpers'
import userEvent from '@testing-library/user-event'
import {proxify, useStore} from '../../src/runtime/appData'

test('NumberInput element produces output with properties supplied',
    snapshot(createElement(NumberInput, {state: proxify({value: 27}, 'app.page1.width'), label: 'Width'}))
)

test('NumberInput element produces output with default values where properties omitted',
    snapshot(createElement(NumberInput, {state: proxify({value: 0}, 'app.page1.height')}))
)

test('NumberInput shows value from the state supplied', () => {
    let container = testContainer(createElement(NumberInput, {state: proxify({value: 27}, 'app.page1.widget1')}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('27')
})

test('NumberInput element produces output with properties supplied as state objects', () => {
    let container = testContainer(createElement(NumberInput, {
        state: proxify({value: 27}, 'app.page1.widget1'),
        label: proxify({value: 'Item Number'}, 'path.x')
    }))
    expect(container.querySelector('label[for="app.page1.widget1"]').innerHTML).toBe('Item Number')
})

test('NumberInput shows empty value when state value is absent', () => {
    let container = testContainer(createElement(NumberInput, {state: proxify({}, 'app.page1.widget1')}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('NumberInput shows empty value when state value is set to undefined', () => {
    let container = testContainer(createElement(NumberInput, {state: proxify({value: undefined}, 'app.page1.widget1')}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('NumberInput stores updated values in the app store section for its path', async () => {
    let container = testContainer(createElement(NumberInput, {state: proxify({value: 27}, 'app.page1.sprocket')}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.type(inputEl, '6')
    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: 276})
    //expect(inputEl.value).toBe('66')
} )

test('NumberInput stores undefined value in the app store when cleared', async () => {
    let container = testContainer(createElement(NumberInput, {state: proxify({value: 27}, 'app.page1.sprocket')}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.clear(inputEl)
    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: undefined})
    //expect(inputEl.value).toBe('66')
} )
