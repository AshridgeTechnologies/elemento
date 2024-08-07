/**
 * @jest-environment jsdom
 */

import {SelectInput} from '../../../src/runtime/components/index'
import {snapshot, testAppInterface, valueObj, wrappedTestElement} from '../../testutil/testHelpers'
import {fireEvent, render, within} from '@testing-library/react'
import {actWait, testContainer} from '../../testutil/rtlHelpers'
import {SelectInputState} from '../../../src/runtime/components/SelectInput'
import {ChoiceType} from '../../../src/runtime/types'

const [selectInput, appStoreHook] = wrappedTestElement(SelectInput, SelectInputState)

const stateAt = (path: string) => appStoreHook.stateAt(path)

let container: any
const theSelect = (id: string) => container.querySelector(`[id="${id}"] + input`)

test('SelectInput element produces output with properties supplied',
    snapshot(selectInput('app.page1.background', {value: 'Pink'}, {label: 'Background', values: ['Green', 'Blue', 'Pink'], styles: {color: 'red'}}))
)

test('SelectInput element produces output with default values where properties omitted',
    snapshot(selectInput('app.page1.height', {value: undefined}))
)

test('SelectInput takes values from data type', () => {
    const selectType = new ChoiceType('ct1', {description: 'A select input for choosing something', values: ['Green', 'Blue', 'Pink']})
    const {container} = render(selectInput('app.page1.description', {value: 'Green', dataType: selectType}, {label: 'Color'}))
    expect(container.innerHTML).toMatchSnapshot()
})

test('SelectInput element produces output with description info from data type', () => {
    const selectType = new ChoiceType('ct1', {description: 'A select input for choosing something'})
    const {container} = render(selectInput('app.page1.description', {value: 'Green', dataType: selectType}, {label: 'Color', values: ['Green', 'Red']}))
    expect(container.innerHTML).toMatchSnapshot()
})

test('SelectInput shows value from the state supplied', () => {
    container = testContainer(selectInput('app.page1.widget1', {value: 'Red',}, {values: ['Green', 'Red'],}))
    expect(theSelect('app.page1.widget1').value).toBe('Red')
})

test('SelectInput element produces output with properties supplied as state objects', () => {
    const {getByRole, container: localContainer} = render(selectInput('app.page1.widget1',
        {
        value: 'Red'},
    {
        values: valueObj(['Green', 'Red']),
        label: valueObj('Item Number')
    }))
    container = localContainer
    expect(container.querySelector('label').innerHTML).toBe('Item Number')
    fireEvent.mouseDown(getByRole('combobox'))
    const options = within(getByRole('listbox')).queryAllByRole('option').map( el => el.textContent)
    expect(options.slice(1)).toStrictEqual(['Green', 'Red'])
})

test('SelectInput shows value of empty string if value in state is undefined', () => {
    container = testContainer(selectInput('app.page1.widget1', {value: undefined}, {values: ['Green', 'Red'],}))
    expect(theSelect('app.page1.widget1').value).toBe('')
})

test('SelectInput shows value of empty string if value in state is absent', () => {
    container = testContainer(selectInput('app.page1.widget1', {}, {values: ['Green', 'Red'],}))
    expect(theSelect('app.page1.widget1').value).toBe('')
})

test('SelectInput shows initial value when state value has initial value', () => {
    container = testContainer(selectInput('app.page1.widget1', {value: 'Red'}, {values: ['Green', 'Red']}))
    expect(theSelect('app.page1.widget1').value).toBe('Red')
})

test('SelectInput shows empty value when state value is set to null and initial value exists', () => {
    container = testContainer(selectInput('app.page1.widget1', new SelectInput.State({value: 'Red'})._withStateForTest({value: null}), {values: ['Green', 'Red']}))
    expect(theSelect('app.page1.widget1').value).toBe('')
})

test('SelectInput stores updated values in the app store section for its path', async () => {
    let getByRole: any
    await actWait( () =>
        ({getByRole, container} = render(selectInput('app.page1.sprocket', {value: 'Pink'}, {values: ['Green', 'Blue', 'Pink']}))))
    await actWait( () => fireEvent.mouseDown(getByRole('combobox')))
    await actWait( () => fireEvent.click(within(getByRole('listbox')).getByText('Blue')))

    expect(stateAt('app.page1.sprocket').value).toBe('Blue')
} )

test('SelectInput stores null value in the app store when cleared', async () => {
    let getByRole: any
    await actWait( () =>
        ({getByRole, container} = render(selectInput('app.page1.sprocket', {value: 'Pink'}, {values: ['Green', 'Blue', 'Pink']}))))
    await actWait( () => fireEvent.mouseDown(getByRole('combobox')))
    await actWait( () => fireEvent.click(within(getByRole('listbox')).getByText('None')))

    expect(stateAt('app.page1.sprocket').dataValue).toBe(null)
} )

test('State class has correct properties', () => {
    const state = new SelectInput.State({value: 'green'})
    const appInterface = testAppInterface('testPath', state)
    expect(state.value).toBe('green')
    expect(state.defaultValue).toBe('')

    state.Reset()
    expect(appInterface.updateVersion).toHaveBeenCalledWith({value: undefined, errorsShown: false})
})
