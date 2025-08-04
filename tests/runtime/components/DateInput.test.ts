/**
 * @vitest-environment jsdom
 */

import {expect, test} from "vitest"
import {DateInput} from '../../../src/runtime/components/index'
import {htmlSnapshot, snapshot, testAppInterface, wait, wrappedTestElement} from '../../testutil/testHelpers'
import {actWait, testContainer} from '../../testutil/rtlHelpers'
import {TextInputState} from '../../../src/runtime/components/TextInput'
import {DateInputState} from '../../../src/runtime/components/DateInput'
import {DateType} from '../../../src/runtime/types'
import {act, render, waitFor} from '@testing-library/react'

const [dateInput, appStoreHook] = wrappedTestElement(DateInput, DateInputState)

const stateAt = (path: string) => appStoreHook.stateAt(path)

const dateType1 = new DateType('startDate', {min: new Date('2020-01-01'), max: new Date('2021-12-31')})

test('DateInput element produces output with properties supplied',
    htmlSnapshot(dateInput('app.page1.start', {value: new Date('2021-11-12')}, {label: 'Starting Date', styles: {color: 'red'}}))
)

test('DateInput element produces readonly output with properties supplied',
    htmlSnapshot(dateInput('app.page1.start', {value: new Date('2021-11-12')}, {label: 'Starting Date', readOnly: true}))
)

test('DateInput element produces output with DataType supplied',
    htmlSnapshot(dateInput('app.page1.start1', {value: new Date('2021-11-12'), dataType: dateType1}, {label: 'Starting Date'}))
)

test('DateInput element produces output with default values where properties omittedxx',
    htmlSnapshot(dateInput('app.page1.finish'))
)

test('DateInput element produces output with default values where properties omitted',
    htmlSnapshot(dateInput('app.page1.finish'))
)

test('DateInput element produces output with description info', () => {
    const dateType = new DateType('tt1', {description: 'A date input for entering dates'})
    const {container} = render(dateInput('app.page1.description', {value: new Date('2021-11-12'), dataType: dateType}, {label: 'Starting Date'}))
    expect(container.innerHTML).toMatchSnapshot()
})

test('DateInput shows value from the state supplied', () => {
    const {el} = testContainer(dateInput('app.page1.widget1', {value: new Date('2021-11-12')}))
    expect(el`app.page1.widget1`.value).toBe('12 Nov 2021')
})

test('DateInput element produces output with properties supplied as state objects', () => {
    const {el} = testContainer(dateInput('app.page1.widget2', {value: new Date('2021-11-12')},
        {label: new TextInputState({value: 'Item Date'})}))
    expect(el`label[for="app.page1.widget2"]`.innerHTML).toBe('Item Date')
})

test('DateInput shows empty value when state value is absent', () => {
    const {el} = testContainer(dateInput('app.page1.widget1', {}))
    expect(el`app.page1.widget1`.value).toBe('')
})

test('DateInput shows empty value when state value is set to undefined', () => {
    const {el} = testContainer(dateInput('app.page1.widget3', {value: undefined}))
    expect(el`app.page1.widget3`.value).toBe('')
})

test('DateInput shows initial value when state value  exists', () => {
    const {el} = testContainer(dateInput('app.page1.widget4', {value: new Date('2021-11-12')}))
    expect(el`app.page1.widget4`.value).toBe('12 Nov 2021')
})

test('DateInput shows empty value when state value is set to null and initial value exists', () => {
    const {el}  = testContainer(dateInput('app.page1.widget5', new DateInput.State({value: new Date('2021-11-12')})._withStateForTest({value: null})))
    expect(el`app.page1.widget5`.value).toBe('')
})

test('DateInput stores updated values in the app store section for its path', async () => {
    const {enter}  = testContainer(dateInput('app.page1.singleDate', {value: new Date('2021-11-12')}))
    await enter('singleDate', '04 Mar 2022')
    expect(stateAt('app.page1.singleDate').value).toStrictEqual(new Date('2022-03-04'))
})

test('DateInput stores null value in the app store when cleared', async () => {
    const {el, user} = testContainer(dateInput('app.page1.termDate', {value: new Date('2021-11-12')}))
    const inputEl = el`[role=spinbutton]`
    await user.clear(inputEl)
    expect(stateAt('app.page1.termDate').dataValue).toBe(null)
})

test('State class has correct properties', () => {
    const emptyState = new DateInput.State({})
    expect(emptyState.value).toBe(null)
    expect(emptyState.dataValue).toBe(null)
    expect(emptyState.defaultValue).toBe(null)

    const state = new DateInput.State({value: new Date('2021-11-12')})
    const appInterface = testAppInterface('testPath', state)
    expect(state.value).toStrictEqual(new Date('2021-11-12'))
    expect(state.defaultValue).toBe(null)

    state.Reset()
    const resetState = state._withStateForTest({value: undefined, errorsShown: false})
    expect(appInterface.updateVersion).toHaveBeenCalledWith({value: undefined, errorsShown: false})
    expect(resetState.value).toStrictEqual(new Date('2021-11-12'))
    expect(resetState.dataValue).toStrictEqual(new Date('2021-11-12'))

    const clearedState = state._withStateForTest({value: null})
    expect(clearedState.value).toBe(null)
    expect(clearedState.dataValue).toBe(null)
})

test('DateInput stores errors shown when blurred and ShowErrors or Reset called', async () => {
    const {el, user, domContainer} = testContainer(dateInput('app.page1.startDate', {value: new Date('2020-05-06'), dataType: dateType1}))

    // expect(stateAt('app.page1.startDate').errorsShown).toBe(false)
    const inputEl = el`app.page1.startDate`
    await act(() => waitFor(() => { user.click(inputEl) }))
    await actWait(10)
    expect(stateAt('app.page1.startDate').errorsShown).toBe(false)

    await user.click(domContainer.ownerDocument.body)
    await wait(10)
    expect(stateAt('app.page1.startDate').errorsShown).toBe(true)

    await act( () => stateAt('app.page1.startDate').ShowErrors(false) )
    expect(stateAt('app.page1.startDate').errorsShown).toBe(false)

    await act( () => stateAt('app.page1.startDate').ShowErrors(true) )
    expect(stateAt('app.page1.startDate').errorsShown).toBe(true)

    await act( () => stateAt('app.page1.startDate').Reset() )
    expect(stateAt('app.page1.startDate').errorsShown).toBe(false)
})

test('DateInput shows errors if errorShown is true', async () => {
    const inputId = 'app.page1.stopDate'
    const {el} = testContainer(dateInput(inputId, {value: new Date('2019-05-06'), dataType: dateType1}, {label: 'The Input'}))

    await actWait(10)

    await actWait( () => stateAt(inputId).ShowErrors(false) )
    expect(el`p.MuiFormHelperText-root.Mui-error`).toBe(null)
    expect(el`label`.className.includes('Mui-error')).toBe(false)

    await actWait( () => stateAt(inputId).ShowErrors(true) )
    expect(el`p.MuiFormHelperText-root.Mui-error`.innerHTML).toBe('Earliest 01 Jan 2020')
    expect(el`label`.className.includes('Mui-error')).toBe(true)
})


