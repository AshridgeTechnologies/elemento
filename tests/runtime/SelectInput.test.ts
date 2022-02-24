/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import SelectInput from '../../src/runtime/SelectInput'
import {snapshot, testContainer} from '../util/testHelpers'
import {fireEvent, render, within} from '@testing-library/react'
import {useStore} from '../../src/runtime/appData'

let container: any
const selectInput = (id: string) => container.querySelector(`[id="${id}"] + input`)

test('SelectInput element produces output with properties supplied',
    snapshot(createElement(SelectInput, {values: ['Green', 'Blue', 'Pink'], state: {value: 'Pink', _path: 'app.page1.background'}, label: 'Background'}))
)

test('SelectInput element produces output with default values where properties omitted',
    snapshot(createElement(SelectInput, {state: {value: undefined, _path: 'app.page1.height' }}))
)

test('SelectInput shows value from the state supplied', () => {
    container = testContainer(createElement(SelectInput, {values: ['Green', 'Red'], state: {value: 'Red', _path: 'app.page1.widget1'}}))
    expect(selectInput('app.page1.widget1').value).toBe('Red')
})

test('SelectInput shows value of empty string if value in state is undefined', () => {
    container = testContainer(createElement(SelectInput, {values: ['Green', 'Red'], state: {value: undefined, _path: 'app.page1.widget1'}}))
    expect(selectInput('app.page1.widget1').value).toBe('')
})

test('SelectInput shows value of empty string if value in state is absent', () => {
    container = testContainer(createElement(SelectInput, {values: ['Green', 'Red'], state: {_path: 'app.page1.widget1'}}))
    expect(selectInput('app.page1.widget1').value).toBe('')
})

test('SelectInput stores updated values in the app store section for its path', () => {
    const {getByRole, container: localContainer} = render(createElement(SelectInput, {state: {value: 'Pink', _path: 'app.page1.sprocket'}, values: ['Green', 'Blue', 'Pink']}))
    container = localContainer
    fireEvent.mouseDown(getByRole('button'))

    fireEvent.click(within(getByRole('listbox')).getByText('Blue'))

    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: 'Blue'})
    // expect(selectInput('app.page1.sprocket').value).toBe('Blue')
} )