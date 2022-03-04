/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import SelectInput from '../../src/runtime/SelectInput'
import {snapshot, testContainer} from '../testutil/testHelpers'
import {fireEvent, render, within} from '@testing-library/react'
import {stateProxy, useStore} from '../../src/runtime/appData'

let container: any
const selectInput = (id: string) => container.querySelector(`[id="${id}"] + input`)

test('SelectInput element produces output with properties supplied',
    snapshot(createElement(SelectInput, {values: ['Green', 'Blue', 'Pink'], state: stateProxy('app.page1.background', {value: 'Pink'}), label: 'Background'}))
)

test('SelectInput element produces output with default values where properties omitted',
    snapshot(createElement(SelectInput, {state: stateProxy('app.page1.height', {value: undefined})}))
)

test('SelectInput shows value from the state supplied', () => {
    container = testContainer(createElement(SelectInput, {values: ['Green', 'Red'], state: stateProxy('app.page1.widget1', {value: 'Red'}, {defaultValue: ''})}))
    expect(selectInput('app.page1.widget1').value).toBe('Red')
})

test('SelectInput element produces output with properties supplied as state objects', () => {
    const {getByRole, container: localContainer} = render(createElement(SelectInput, {
        state: stateProxy('app.page1.widget1', {value: 'Red'}),
        label: stateProxy('path.x', {value: 'Item Number'}),
        values: stateProxy('path.x', {value: ['Green', 'Red']})
    }))
    container = localContainer
    expect(container.querySelector('label').innerHTML).toBe('Item Number')
    fireEvent.mouseDown(getByRole('button'))
    const options = within(getByRole('listbox')).queryAllByRole('option').map( el => el.textContent)
    expect(options.slice(1)).toStrictEqual(['Green', 'Red'])
})


test('SelectInput shows value of empty string if value in state is undefined', () => {
    container = testContainer(createElement(SelectInput, {values: ['Green', 'Red'], state: stateProxy('app.page1.widget1', {value: undefined}, {defaultValue: ''})}))
    expect(selectInput('app.page1.widget1').value).toBe('')
})

test('SelectInput shows value of empty string if value in state is absent', () => {
    container = testContainer(createElement(SelectInput, {values: ['Green', 'Red'], state: stateProxy('app.page1.widget1', {}, {defaultValue: ''})}))
    expect(selectInput('app.page1.widget1').value).toBe('')
})

test('SelectInput shows initial value when state value is set to undefined and initial value exists', () => {
    container = testContainer(createElement(SelectInput, {values: ['Green', 'Red'], state: stateProxy('app.page1.widget1', {value: undefined}, {defaultValue: '', value: 'Red'})}))
    expect(selectInput('app.page1.widget1').value).toBe('Red')
})

test('SelectInput shows empty value when state value is set to null and initial value exists', () => {
    container = testContainer(createElement(SelectInput, {values: ['Green', 'Red'], state: stateProxy('app.page1.widget1', {value: null}, {defaultValue: '', value: 'Red'})}))
    expect(selectInput('app.page1.widget1').value).toBe('')
})

test('SelectInput stores updated values in the app store section for its path', () => {
    const {getByRole, container: localContainer} = render(createElement(SelectInput, {state: stateProxy('app.page1.sprocket', {value: 'Pink'}), values: ['Green', 'Blue', 'Pink']}))
    container = localContainer
    fireEvent.mouseDown(getByRole('button'))

    fireEvent.click(within(getByRole('listbox')).getByText('Blue'))

    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: 'Blue'})
    // expect(selectInput('app.page1.sprocket').value).toBe('Blue')
} )

test('SelectInput stores null value in the app store when cleared', async () => {
    const {getByRole, container: localContainer} = render(createElement(SelectInput, {state: stateProxy('app.page1.sprocket', {value: 'Pink'}), values: ['Green', 'Blue', 'Pink']}))
    container = localContainer
    fireEvent.mouseDown(getByRole('button'))

    fireEvent.click(within(getByRole('listbox')).getAllByRole('option')[0])

    expect((useStore.getState() as any).app.page1.sprocket).toStrictEqual({value: null})
    //expect(inputEl.value).toBe('66')
} )