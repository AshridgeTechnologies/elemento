/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import SelectInput from '../../src/runtime/SelectInput'
import {snapshot, testContainer} from '../util/testHelpers'
import {fireEvent, render, within} from '@testing-library/react'
import {proxify, useStore} from '../../src/runtime/appData'

let container: any
const selectInput = (id: string) => container.querySelector(`[id="${id}"] + input`)

test('SelectInput element produces output with properties supplied',
    snapshot(createElement(SelectInput, {values: ['Green', 'Blue', 'Pink'], state: proxify({value: 'Pink'}, 'app.page1.background'), label: 'Background'}))
)

test('SelectInput element produces output with default values where properties omitted',
    snapshot(createElement(SelectInput, {state: proxify({value: undefined}, 'app.page1.height') }))
)

test('SelectInput shows value from the state supplied', () => {
    container = testContainer(createElement(SelectInput, {values: ['Green', 'Red'], state: proxify({value: 'Red'}, 'app.page1.widget1')}))
    expect(selectInput('app.page1.widget1').value).toBe('Red')
})

test('SelectInput element produces output with properties supplied as state objects', () => {
    const {getByRole, container: localContainer} = render(createElement(SelectInput, {
        state: proxify({value: 'Red'}, 'app.page1.widget1'),
        label: proxify({value: 'Item Number'}, 'path.x'),
        values: proxify({value: ['Green', 'Red']}, 'path.x')
    }))
    container = localContainer
    expect(container.querySelector('label').innerHTML).toBe('Item Number')
    fireEvent.mouseDown(getByRole('button'))
    const options = within(getByRole('listbox')).queryAllByRole('option').map( el => el.textContent)
    expect(options.slice(1)).toStrictEqual(['Green', 'Red'])
})


test('SelectInput shows value of empty string if value in state is undefined', () => {
    container = testContainer(createElement(SelectInput, {values: ['Green', 'Red'], state: proxify({value: undefined}, 'app.page1.widget1')}))
    expect(selectInput('app.page1.widget1').value).toBe('')
})

test('SelectInput shows value of empty string if value in state is absent', () => {
    container = testContainer(createElement(SelectInput, {values: ['Green', 'Red'], state: proxify({},'app.page1.widget1')}))
    expect(selectInput('app.page1.widget1').value).toBe('')
})

test('SelectInput stores updated values in the app store section for its path', () => {
    const {getByRole, container: localContainer} = render(createElement(SelectInput, {state: proxify({value: 'Pink'}, 'app.page1.sprocket'), values: ['Green', 'Blue', 'Pink']}))
    container = localContainer
    fireEvent.mouseDown(getByRole('button'))

    fireEvent.click(within(getByRole('listbox')).getByText('Blue'))

    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: 'Blue'})
    // expect(selectInput('app.page1.sprocket').value).toBe('Blue')
} )
