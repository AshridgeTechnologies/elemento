/**
 * @jest-environment jsdom
 */

import {NumberInput, TextInput} from '../../../src/runtime/components/index'
import {snapshot, testAppInterface, wrappedTestElement} from '../../testutil/testHelpers'
import '@testing-library/jest-dom'
import {actWait, testContainer} from '../../testutil/rtlHelpers'
import {TextInputState} from '../../../src/runtime/components/TextInput'
import {NumberInputState} from '../../../src/runtime/components/NumberInput'
import {NumberType} from '../../../src/runtime/types'
import {render} from '@testing-library/react'
import BigNumber from 'bignumber.js'
import DecimalType from '../../../src/runtime/types/DecimalType'

const [numberInput, appStoreHook] = wrappedTestElement(NumberInput, NumberInputState)

const stateAt = (path: string) => appStoreHook.stateAt(path)

test('NumberInput element produces output with properties supplied',
    snapshot(numberInput('app.page1.width', {value: 27}, {label: 'Width', styles: {border: '1px solid green'}}))
)

test('NumberInput element produces output with default values where properties omitted',
    snapshot(numberInput('app.page1.height'))
)

test('NumberInput element produces output with description info', () => {
    const numberType = new NumberType('tt1', {description: 'A number input for entering numbers'})
    const {container} = render(numberInput('app.page1.description', {value: 27, dataType: numberType}, {label: 'Width'}))
    expect(container.innerHTML).toMatchSnapshot()
})

test('NumberInput shows value from the state supplied', () => {
    const {el} = testContainer(numberInput('app.page1.widget1', {value: 27}))
    expect(el`app.page1.widget1`.value).toBe('27')
})

test('NumberInput shows Decimal value from the state supplied', () => {
    const {el} = testContainer(numberInput('app.page1.widget1', {value: new BigNumber('27.34')}))
    expect(el`app.page1.widget1`.value).toBe('27.34')
})

test('NumberInput shows Decimal value ending in 0 with DecimalType', () => {
    const decimalType = new DecimalType('dt1', {decimalPlaces: 2})
    const {el} = testContainer(numberInput('app.page1.widget1', {value: new BigNumber('27.30'), dataType: decimalType}))
    expect(el`app.page1.widget1`.value).toBe('27.30')
})

test('NumberInput shows Decimal value ending in 0 with DecimalType from number input', () => {
    const decimalType = new DecimalType('dt1', {decimalPlaces: 2})
    const {el} = testContainer(numberInput('app.page1.widget1', {value: 27.3, dataType: decimalType}))
    expect(el`app.page1.widget1`.value).toBe('27.30')
})

test('NumberInput shows Decimal value without extra places if DecimalType does not specify', () => {
    const decimalType = new DecimalType('dt1', {})
    const {el} = testContainer(numberInput('app.page1.widget1', {value: 27.3, dataType: decimalType}))
    expect(el`app.page1.widget1`.value).toBe('27.3')
})

test('NumberInput element produces output with properties supplied as state objects', () => {
    const {el} = testContainer(numberInput('app.page1.widget1', {value: 27},
        {label: new TextInputState({value: 'Item Number'})}))
    expect(el`label[for="app.page1.widget1"]`.innerHTML).toBe('Item Number')
})

test('NumberInput shows empty value when state value is absent', () => {
    const {el} = testContainer(numberInput('app.page1.widget1', {}))
    expect(el`app.page1.widget1`.value).toBe('')
})

test('NumberInput shows empty value when state value is set to undefined', () => {
    const {el} = testContainer(numberInput('app.page1.widget1', {value: undefined}))
    expect(el`app.page1.widget1`.value).toBe('')
})

test('NumberInput shows initial value when state value  exists', () => {
    const {el} = testContainer(numberInput('app.page1.widget1', {value: 99}))
    expect(el`app.page1.widget1`.value).toBe('99')
})

test('NumberInput shows empty value when state value is set to null and initial value exists', () => {
    const {el}  = testContainer(numberInput('app.page1.widget1', new TextInput.State({value: 'Axe'})._withStateForTest({value: null})))
    expect(el`app.page1.widget1`.value).toBe('')
})

test('NumberInput stores updated values in the app store section for its path', async () => {
    const {enter}  = testContainer(numberInput('app.page1.sprocket', {value: 27}))
    await enter('sprocket', '421')
    expect(stateAt('app.page1.sprocket').value).toBe(421)
})

test('NumberInput stores updated Decimal values in the app store section for its path if it has a DecimalType data type', async () => {
    const decimalType1 = new DecimalType('dt1')
    const {enter}  = testContainer(numberInput('app.page1.sprocket', {value: 27, dataType: decimalType1}))
    await enter('sprocket', '421')
    expect(stateAt('app.page1.sprocket').value).toStrictEqual(new BigNumber('421'))
})

test('NumberInput stores null value in the app store when cleared', async () => {
    const {el, user} = testContainer(numberInput('app.page1.sprocket', {value: 27}))
    const inputEl = el`app.page1.sprocket`
    await user.clear(inputEl)
    expect(stateAt('app.page1.sprocket').dataValue).toBe(null)
})

test('NumberInput uses properties from dataType', async () => {
    const {el} = testContainer(numberInput('app.page1.sprocket2', {value: 27}, {label: 'The Input'}))

    const numberType = new NumberType('nt1', {min: 2, max: 10, format: 'integer'})
    await actWait(10)
    await actWait( () => stateAt('app.page1.sprocket2').props.dataType = numberType )

    await actWait( () => stateAt('app.page1.sprocket2').Reset() )
    expect(el`input`.min).toBe('2')
    expect(el`input`.max).toBe('10')
    expect(el`input`.type).toBe('number')
})

test('State class has correct properties', () => {
    const emptyState = new NumberInput.State({})
    expect(emptyState.value).toBe(0)
    expect(emptyState.dataValue).toBe(null)
    expect(emptyState.defaultValue).toBe(0)

    const state = new NumberInput.State({value: 77})
    const appInterface = testAppInterface('testPath', state)
    expect(state.value).toBe(77)
    expect(state.defaultValue).toBe(0)

    state.Reset()
    const resetState = state._withStateForTest({value: undefined, errorsShown: false})
    expect(appInterface.updateVersion).toHaveBeenCalledWith(resetState)
    expect(resetState.value).toBe(77)
    expect(resetState.dataValue).toBe(77)

    const clearedState = state._withStateForTest({value: null})
    expect(clearedState.value).toBe(0)
    expect(clearedState.dataValue).toBe(null)
})
