/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import TrueFalseInput from '../../src/runtime/TrueFalseInput'
import {snapshot, testContainer} from '../util/testHelpers'
import {updateState, useStore} from '../../src/runtime/appData'
import {act, render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('TrueFalseInput element produces output with properties supplied',
    snapshot(createElement(TrueFalseInput, {path: 'app.page1.width', initialValue: true, label: 'Covered'}))
)

test('TrueFalseInput element produces output with default values where properties omitted',
    snapshot(createElement(TrueFalseInput, {path: 'app.page1.height'}))
)

test('TrueFalseInput shows false if no initial value or value in the app store section for its path', () => {
    let container = testContainer(createElement(TrueFalseInput, {path: 'app.page1.widget1'}))
    const inputEl = container.querySelector('input[id="app.page1.widget1"]')
    expect(inputEl.checked).toBe(false)
})

test('TrueFalseInput shows initial value if no value in the app store section for its path', () => {
    let container = testContainer(createElement(TrueFalseInput, {path: 'app.page1.widget1', initialValue: true}))
    const inputEl = container.querySelector('input[id="app.page1.widget1"]')
    expect(inputEl.checked).toBe(true)
})

test('TrueFalseInput shows existing value from the app store section for its path', () => {
    updateState('app.page1.widget2', {value: true})
    let container: any
    act(() =>  { ({container} = render(createElement(TrueFalseInput, {path: 'app.page1.widget2', initialValue: false})) ) })
    const inputEl = container.querySelector('input[id="app.page1.widget2"]')
    expect(inputEl.checked).toBe(true)

})

test('TrueFalseInput shows updated value from the app store section for its path', () => {
    updateState('app.page1.widget3', {value: false})
    let container = testContainer(createElement(TrueFalseInput, {path: 'app.page1.widget3', initialValue: false}))
    const inputEl = container.querySelector('input[id="app.page1.widget3"]')
    expect(inputEl.checked).toBe(false)
    act( () => { updateState('app.page1.widget3', {value: true}) })
    expect(inputEl.checked).toBe(true)
})

test('TrueFalseInput stores updated values in the app store section for its path', async () => {
    let container = testContainer(createElement(TrueFalseInput, {path: 'app.page1.sprocket', initialValue: false}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.click(inputEl)
    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: true})
    expect(inputEl.checked).toBe(true)
    await user.click(inputEl)
    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: false})
    expect(inputEl.checked).toBe(false)
} )
