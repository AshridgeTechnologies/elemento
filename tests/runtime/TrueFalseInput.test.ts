/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import TrueFalseInput from '../../src/runtime/TrueFalseInput'
import {snapshot, testContainer} from '../util/testHelpers'
import userEvent from '@testing-library/user-event'
import {useStore} from '../../src/runtime/appData'

test('TrueFalseInput element produces output with properties supplied',
    snapshot(createElement(TrueFalseInput, {state: {value: true, _path: 'app.page1.width'}, label: 'Covered'}))
)

test('TrueFalseInput element produces output with default values where properties omitted',
    snapshot(createElement(TrueFalseInput, {state: {value: false, _path: 'app.page1.height'}}))
)

test('TrueFalseInput shows false if that value is in the state', () => {
    let container = testContainer(createElement(TrueFalseInput, {state: {value: false, _path: 'app.page1.widget1'}}))
    expect(container.querySelector('input[id="app.page1.widget1"]').checked).toBe(false)
})

test('TrueFalseInput shows true if that value is in the state', () => {
    let container = testContainer(createElement(TrueFalseInput, {state: {value: true, _path: 'app.page1.widget1'}}))
    expect(container.querySelector('input[id="app.page1.widget1"]').checked).toBe(true)
})

test('TrueFalseInput shows false if no value is in the state', () => {
    let container = testContainer(createElement(TrueFalseInput, {state: {_path: 'app.page1.widget1'}}))
    expect(container.querySelector('input[id="app.page1.widget1"]').checked).toBe(false)
})

test('TrueFalseInput shows false if an undefined value is in the state', () => {
    let container = testContainer(createElement(TrueFalseInput, {state: {value: undefined, _path: 'app.page1.widget1'}}))
    expect(container.querySelector('input[id="app.page1.widget1"]').checked).toBe(false)
})

test('TrueFalseInput stores updated values in the app store section for its path', async () => {
    let container = testContainer(createElement(TrueFalseInput, {state: {value: false, _path: 'app.page1.sprocket'}}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.click(inputEl)
    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: true})
    // expect(inputEl.checked).toBe(true)
    // await user.click(inputEl)
    // expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: false})
    // expect(inputEl.checked).toBe(false)
} )

