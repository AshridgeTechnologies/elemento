/**
 * @jest-environment jsdom
 */

import {Calculation} from '../../../src/runtime/components/index'
import {testAppInterface, valueObj, wait, wrappedTestElement} from '../../testutil/testHelpers'
import {render} from '@testing-library/react'
import '@testing-library/jest-dom'
import {testContainer} from '../../testutil/rtlHelpers'
import {CalculationState} from '../../../src/runtime/components/Calculation'
import {act} from '@testing-library/react/pure'

const [calculation] = wrappedTestElement(Calculation, CalculationState)

test('Calculation element produces output with properties supplied', () => {
    const {container} = render(calculation('app.page1.width', {value: 'Hi there!'}, {
            styles: {width: 23},
            label: 'Item Description'
        }))
    expect(container.innerHTML).toMatchSnapshot()
})

test('Calculation element produces output with multiline', () => {
    const {container} = render(calculation('app.page1.description', {value: 'Hi there!\nHow are you?'}, {label: 'Item Description'}))
    expect(container.innerHTML).toMatchSnapshot()
})

test('Calculation element produces output with default values where properties omitted',
    () => {
        const {container} = render(calculation('app.page1.width', {}))
        expect(container.innerHTML).toMatchSnapshot()
    }
)

test('Calculation shows value from the state supplied', () => {
    const {el} = testContainer(calculation('app.page1.widget1', {value:'Hello!'}, {}))
    expect(el`app.page1.widget1`.textContent).toBe('Hello!')
})

test('Calculation shows empty value when state value is absent', () => {
    const {el} = testContainer(calculation('app.page1.widget1', {}))
    expect(el`app.page1.widget1`.textContent).toBe('')
})

test('Calculation asynchronously checks and triggers when action from UI element when value true', async () => {
    const action = jest.fn()
    testContainer(calculation('app.page1.widget1', {value: true, whenTrueAction: action}))
    expect(action).not.toHaveBeenCalled()
    await act( () => wait(10))
    expect(action).toHaveBeenCalled()
})

test('Calculation does not triggers when action from UI element when value false', () => {
    const action = jest.fn()
    testContainer(calculation('app.page1.widget1', {value: null, whenTrueAction: action}))
    expect(action).not.toHaveBeenCalled()
})

test('State class has correct properties and functions', () => {
    const state = new Calculation.State({value: {a: 10, b: 'bee'}})
    const appInterface = testAppInterface(); state.init(appInterface, 'testPath')
    expect(state.value).toStrictEqual({a: 10, b: 'bee'})
})

test('State class does nothing on trigger if no when true action', () => {
    const state = new Calculation.State({value: true})
    const appInterface = testAppInterface(); state.init(appInterface, 'testPath')
    state.checkTriggered()
    expect(appInterface.updateVersion).not.toHaveBeenCalled()
})

test('State class does nothing on trigger if false and previous value missing but updates previous value', () => {
    const action = jest.fn()
    const state = new Calculation.State({value: false, whenTrueAction: action})
    const appInterface = testAppInterface(); state.init(appInterface, 'testPath')
    state.checkTriggered()
    expect(action).not.toHaveBeenCalled()
    expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateForTest({previousValueTruthy: false}))
})

test('State class does nothing on trigger if false and does not update previous value if false', () => {
    const action = jest.fn()
    const state = new Calculation.State({value: false, whenTrueAction: action})._withStateForTest({previousValueTruthy: false})
    const appInterface = testAppInterface(); state.init(appInterface, 'testPath')
    state.checkTriggered()
    expect(action).not.toHaveBeenCalled()
    expect(appInterface.updateVersion).not.toHaveBeenCalled()
})

test('State class runs action on trigger if truthy and previous value false and updates previous value', () => {
    const action = jest.fn()
    const state = new Calculation.State({value: 1, whenTrueAction: action})._withStateForTest({previousValueTruthy: false})
    const appInterface = testAppInterface(); state.init(appInterface, 'testPath')
    state.checkTriggered()
    expect(action).toHaveBeenCalled()
    expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateForTest({previousValueTruthy: true}))
})

test('State class does not run action on trigger if truthy and previous value truthy and does not update previous value', () => {
    const action = jest.fn()
    const state = new Calculation.State({value: 2, whenTrueAction: action})._withStateForTest({previousValueTruthy: true})
    const appInterface = testAppInterface(); state.init(appInterface, 'testPath')
    state.checkTriggered()
    expect(action).not.toHaveBeenCalled()
    expect(appInterface.updateVersion).not.toHaveBeenCalled()
})

test('State class does not run action on trigger if falsy and previous value truthy but updates previous value', () => {
    const action = jest.fn()
    const state = new Calculation.State({value: null, whenTrueAction: action})._withStateForTest({previousValueTruthy: true})
    const appInterface = testAppInterface(); state.init(appInterface, 'testPath')
    state.checkTriggered()
    expect(action).not.toHaveBeenCalled()
    expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateForTest({previousValueTruthy: false}))
})

test('State class gives correct value when its value is a value object', () => {
    const state = new Calculation.State({value: valueObj('car')})
    expect(state.value).toBe('car')
})

test('string conversion uses the value toString', () => {
    const value = [1, 2, 3]
    const state = new Calculation.State({value})
    expect('x' + state).toBe('x1,2,3')
})

test('State class is equal if value structurally equal and when true action the same instance', () => {
    const value = {a: 10, b: 'foo'}
    const when1 = () => {}
    const when2 = () => {}
    const state1 = new CalculationState({value})
    expect(state1.updateFrom(new CalculationState({value}))).toBe(state1)
    expect(state1.updateFrom(new CalculationState({value: {...value}}))).toBe(state1)
    expect(state1.updateFrom(new CalculationState({value: {...value, c: true}}))).not.toBe(state1)

    const state2 = new CalculationState({value, whenTrueAction: when1})
    expect(state2.updateFrom(new CalculationState({value, whenTrueAction: when1}))).toBe(state2)
    expect(state2.updateFrom(new CalculationState({value: {...value}, whenTrueAction: when1}))).toBe(state2)
    expect(state2.updateFrom(new CalculationState({value, whenTrueAction: when2}))).not.toBe(state2)
})
