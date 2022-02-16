/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import SelectInput from '../../src/runtime/SelectInput'
import {snapshot, testContainer} from '../util/testHelpers'
import {updateState, useStore} from '../../src/runtime/appData'
import {fireEvent, getByRole, render, within} from '@testing-library/react'

let container: any
const selectInput = (id: string) => container.querySelector(`[id="${id}"] + input`)

test('SelectInput element produces output with properties supplied',
    snapshot(createElement(SelectInput, {path: 'app.page1.background', values: ['Green', 'Blue', 'Pink'], initialValue: 'Pink', label: 'Background'}))
)

test('SelectInput element produces output with default values where properties omitted',
    snapshot(createElement(SelectInput, {path: 'app.page1.height'}))
)

test('SelectInput shows empty option if no initial value or value in the app store section for its path', () => {
    container = testContainer(createElement(SelectInput, {path: 'app.page1.widget1', values: ['Green']}))
    expect(selectInput('app.page1.widget1').value).toBe('')
})

test('SelectInput shows initial value if no value in the app store section for its path', () => {
    container = testContainer(createElement(SelectInput, {path: 'app.page1.widget1', values: ['Green', 'Blue', 'Pink'], initialValue: 'Pink'}))
    expect(selectInput('app.page1.widget1').value).toBe('Pink')
})

test('SelectInput shows existing value from the app store section for its path', () => {
    updateState('app.page1.widget2', {value: 'Blue'})
    container = testContainer(createElement(SelectInput, {path: 'app.page1.widget2', values: ['Green', 'Blue', 'Pink'], initialValue: 'Pink'}))
    expect(selectInput('app.page1.widget2').value).toBe('Blue')
})

test('SelectInput stores updated values in the app store section for its path', () => {
    const {getByRole, container: localContainer} = render(createElement(SelectInput, {path: 'app.page1.sprocket', values: ['Green', 'Blue', 'Pink'], initialValue: 'Pink'}))
    container = localContainer
    fireEvent.mouseDown(getByRole('button'))

    fireEvent.click(within(getByRole('listbox')).getByText('Blue'))

    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: 'Blue'})
    expect(selectInput('app.page1.sprocket').value).toBe('Blue')
} )