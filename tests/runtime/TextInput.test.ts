/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import TextInput from '../../src/runtime/TextInput'
import {snapshot, testContainer, wait} from '../util/testHelpers'
import {render} from '@testing-library/react'
import {useStore, proxify} from '../../src/runtime/appData'
import userEvent from '@testing-library/user-event'

test('TextInput element produces output with properties supplied',
    snapshot(createElement(TextInput, {state: proxify({value: 'Hi there!'}, 'app.page1.width'), maxLength: 10, label: 'Item Description'}))
)

test('TextInput element produces output with properties supplied as state objects', () => {
    let container = testContainer(createElement(TextInput, {
        state: proxify({value: 'Hello!'}, 'app.page1.widget1'),
        maxLength: proxify({value: 10}, 'path.x'),
        label: proxify({value: 'Item Description'}, 'path.x')
    }))
    expect(container.querySelector('input[id="app.page1.widget1"]').maxLength).toBe(10)
    expect(container.querySelector('label[for="app.page1.widget1"]').innerHTML).toBe('Item Description')
})

test('TextInput element produces output with multiline', async () => {
    const {container} = render(createElement(TextInput, {state: proxify({value: 'Hi there!'}, 'app.page1.description'), multiline: true, label: 'Item Description'}))
    expect(container.innerHTML).toMatchSnapshot()
})

test('TextInput element produces output with default values where properties omitted',
    snapshot(createElement(TextInput, {state: proxify({value: ''}, 'app.page1.height')}))
)

test('TextInput shows value from the state supplied', () => {
    let container = testContainer(createElement(TextInput, {state: proxify({value: 'Hello!'}, 'app.page1.widget1')}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('Hello!')
})

test('TextInput shows empty value when state value is absent', () => {
    let container = testContainer(createElement(TextInput, {state: proxify({}, 'app.page1.widget1')}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('TextInput shows empty value when state value is set to undefined', () => {
    let container = testContainer(createElement(TextInput, {state: proxify({value: undefined}, 'app.page1.widget1')}))
    expect(container.querySelector('input[id="app.page1.widget1"]').value).toBe('')
})

test('TextInput stores updated values in the app store section for its path', async () => {
    let container = testContainer(createElement(TextInput, {state: proxify({value: 'Hi'}, 'app.page1.sprocket')}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.type(inputEl, '!')
    await wait(10)
    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: 'Hi!'})
    //expect(inputEl.value).toBe('Hi!')
} )

test('TextInput stores undefined value in the app store when cleared', async () => {
    let container = testContainer(createElement(TextInput, {state: proxify({value: 'Hi'}, 'app.page1.sprocket')}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.clear(inputEl)
    await wait(10)
    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: undefined})
    //expect(inputEl.value).toBe('Hi!')
} )