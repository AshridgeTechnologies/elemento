/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import TextInput from '../../src/runtime/TextInput'
import {snapshot, testContainer} from '../util/testHelpers'
import {updateState, useStore} from '../../src/runtime/appData'
import {act, render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('TextInput element produces output with properties supplied',
    snapshot(createElement(TextInput, {path: 'app.page1.width', initialValue: 'Hi there!', maxLength: 10, label: 'Item Description'}))
)

test('TextInput element produces output with multiline', async () => {
    const {container} = render(createElement(TextInput, {path: 'app.page1.description', initialValue: 'Hi there!', multiline: true, label: 'Item Description'}))
    expect(container.innerHTML).toMatchSnapshot()
})

test('TextInput element produces output with default values where properties omitted',
    snapshot(createElement(TextInput, {path: 'app.page1.height'}))
)

test('TextInput shows initial value if no value in the app store section for its path', () => {
    let container = testContainer(createElement(TextInput, {path: 'app.page1.widget1', initialValue: 'Hello!'}))
    const inputEl = container.querySelector('input[id="app.page1.widget1"]')
    expect(inputEl.value).toBe('Hello!')
})

test('TextInput shows existing value from the app store section for its path', () => {
    updateState('app.page1.widget2', {value: 'Letty'})
    let container: any
    act(() =>  { ({container} = render(createElement(TextInput, {path: 'app.page1.widget2', initialValue: 'Howdy!'})) ) })
    const inputEl = container!.querySelector('input[id="app.page1.widget2"]')
    expect(inputEl.value).toBe('Letty')
})

test('TextInput shows updated value from the app store section for its path', () => {
    updateState('app.page1.widget3', {value: 'Letty'})
    let container = testContainer(createElement(TextInput, {path: 'app.page1.widget3', initialValue: 'Ho there!'}))
    const inputEl = container.querySelector('input[id="app.page1.widget3"]')
    expect(inputEl.value).toBe('Letty')
    act( () => { updateState('app.page1.widget3', {value: 'Billy'}) })
    expect(inputEl.value).toBe('Billy')
})

test('TextInput stores updated values in the app store section for its path', () => {
    let container = testContainer(createElement(TextInput, {path: 'app.page1.sprocket', initialValue: 'Hi!'}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    userEvent.type(inputEl, ' How are you?')
    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: 'Hi! How are you?'})
    expect(inputEl.value).toBe('Hi! How are you?')
} )