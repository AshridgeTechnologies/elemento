/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import NumberInput from '../../src/runtime/NumberInput'
import {snapshot, testContainer} from '../util/testHelpers'
import {updateState, useStore} from '../../src/runtime/appData'
import {act, render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('NumberInput element produces output with properties supplied',
    snapshot(createElement(NumberInput, {path: 'app.page1.width', initialValue: 27, max: 100, label: 'Width'}))
)

test('NumberInput element produces output with default values where properties omitted',
    snapshot(createElement(NumberInput, {path: 'app.page1.height'}))
)

test('NumberInput shows 0 if no initial value or value in the app store section for its path', () => {
    let container = testContainer(createElement(NumberInput, {path: 'app.page1.widget1'}))
    const inputEl = container.querySelector('input[id="app.page1.widget1"]')
    expect(inputEl.value).toBe('0')
})

test('NumberInput shows initial value if no value in the app store section for its path', () => {
    let container = testContainer(createElement(NumberInput, {path: 'app.page1.widget1', initialValue: 27}))
    const inputEl = container.querySelector('input[id="app.page1.widget1"]')
    expect(inputEl.value).toBe('27')
})

test('NumberInput shows existing value from the app store section for its path', () => {
    updateState('app.page1.widget2', {value: 33})
    let container: any
    act(() =>  { ({container} = render(createElement(NumberInput, {path: 'app.page1.widget2', initialValue: 27})) ) })
    const inputEl = container.querySelector('input[id="app.page1.widget2"]')
    expect(inputEl.value).toBe('33')

})

test('NumberInput shows updated value from the app store section for its path', () => {
    updateState('app.page1.widget3', {value: 44})
    let container = testContainer(createElement(NumberInput, {path: 'app.page1.widget3', initialValue: 27}))
    const inputEl = container.querySelector('input[id="app.page1.widget3"]')
    expect(inputEl.value).toBe('44')
    act( () => { updateState('app.page1.widget3', {value: 55}) })
    expect(inputEl.value).toBe('55')
})

test('NumberInput stores updated values in the app store section for its path', async () => {
    let container = testContainer(createElement(NumberInput, {path: 'app.page1.sprocket', initialValue: 27}))
    const inputEl = container.querySelector('input[id="app.page1.sprocket"]')
    const user = userEvent.setup()
    await user.clear(inputEl)
    await user.type(inputEl, '66')
    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: 66})
    expect(inputEl.value).toBe('66')
} )