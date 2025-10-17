/**
 * @vitest-environment jsdom
 */
import {expect, test, vi} from "vitest"
import {Calculation} from '../../../src/runtime/components/index'
import {testAppInterface as testAppInterface, valueObj, wait, wrappedTestElement} from '../../testutil/testHelpers'
import {render} from '@testing-library/react'

import {testContainer} from '../../testutil/rtlHelpers'
import {act} from '@testing-library/react/pure'

const [calculation] = wrappedTestElement(Calculation)

test('Calculation element produces empty output with show not supplied', () => {
    const {container} = render(calculation('app.page1.width', {
        initialValue: 'Hi there!',
        styles: {width: 23},
        label: 'Item Description',
    }))
    expect(container.innerHTML).toBe("")
})

test('Calculation element produces output with properties supplied', () => {
    const {container} = render(calculation('app.page1.width', {
        initialValue: 'Hi there!',
        styles: {width: 23},
        label: 'Item Description',
        show: true
    }))
    expect(container.innerHTML).toMatchSnapshot()
})

test('Calculation element produces output with multiline', () => {
    const {container} = render(calculation('app.page1.description', {
        initialValue: 'Hi there!\nHow are you?',
        label: 'Item Description',
        show: true}))
    expect(container.innerHTML).toMatchSnapshot()
})

test('Calculation element produces output with default values where properties omitted',
    () => {
        const {container} = render(calculation('app.page1.width', {show: true}))
        expect(container.innerHTML).toMatchSnapshot()
    }
)

test('Calculation shows value from the state supplied', () => {
    const {el} = testContainer(calculation('app.page1.widget1', {initialValue:'Hello!', show: true}))
    expect(el`app.page1.widget1`.textContent).toBe('Hello!')
})

test('Calculation shows empty value when state value is absent', () => {
    const {el} = testContainer(calculation('app.page1.widget1', {show: true}))
    expect(el`app.page1.widget1`.textContent).toBe('')
})

test('Calculation asynchronously checks and triggers when action from UI element when value true', async () => {
    const action = vi.fn()
    testContainer(calculation('app.page1.widget1', {initialValue: true, whenTrueAction: action}))
    expect(action).not.toHaveBeenCalled()
    await act( () => wait(10))
    expect(action).toHaveBeenCalled()
})

test('Calculation does not triggers when action from UI element when value false', () => {
    const action = vi.fn()
    testContainer(calculation('app.page1.widget1', {initialValue: null, whenTrueAction: action}))
    expect(action).not.toHaveBeenCalled()
})

test('State class has correct properties and functions', () => {
    const state = new Calculation.State({initialValue: {a: 10, b: 'bee'}})
    expect(state.value).toStrictEqual({a: 10, b: 'bee'})
})

test('State class does nothing on trigger if no when true action', () => {
    const state = new Calculation.State({initialValue: true})
    const appInterface = testAppInterface('testPath', state)
    state.checkTriggered()
    expect(appInterface.update).not.toHaveBeenCalled()
})

test('State class does nothing on trigger if false and previous value missing but updates previous value', () => {
    const action = vi.fn()
    const state = new Calculation.State({initialValue: false, whenTrueAction: action})
    const appInterface = testAppInterface('testPath', state)
    state.checkTriggered()
    expect(action).not.toHaveBeenCalled()
    expect(state.latest()._stateForTest.previousValueTruthy).toBe(false)
})

test('State class does nothing on trigger if false and does not update previous value if false', () => {
    const action = vi.fn()
    const state = new Calculation.State({initialValue: false, whenTrueAction: action}).withState({previousValueTruthy: false})
    const appInterface = testAppInterface('testPath', state)
    state.checkTriggered()
    expect(action).not.toHaveBeenCalled()
    expect(appInterface.update).not.toHaveBeenCalled()
})

test('State class runs action on trigger if truthy and previous value false and updates previous value', () => {
    const action = vi.fn()
    const state = new Calculation.State({initialValue: 1, whenTrueAction: action}).withState({previousValueTruthy: false})
    const appInterface = testAppInterface('testPath', state)
    state.checkTriggered()
    expect(action).toHaveBeenCalled()
    expect(state.latest()._stateForTest.previousValueTruthy).toBe(true)
})

test('State class does not run action on trigger if truthy and previous value truthy and does not update previous value', () => {
    const action = vi.fn()
    const state = new Calculation.State({initialValue: 2, whenTrueAction: action}).withState({previousValueTruthy: true})
    const appInterface = testAppInterface('testPath', state)
    state.checkTriggered()
    expect(action).not.toHaveBeenCalled()
    expect(appInterface.update).not.toHaveBeenCalled()
})

test('State class does not run action on trigger if falsy and previous value truthy but updates previous value', () => {
    const action = vi.fn()
    const state = new Calculation.State({initialValue: null, whenTrueAction: action}).withState({previousValueTruthy: true})
    const appInterface = testAppInterface('testPath', state)
    state.checkTriggered()
    expect(action).not.toHaveBeenCalled()
    expect(state.latest()._stateForTest.previousValueTruthy).toBe(false)
})

test('State class gives correct value when its value is a value object', () => {
    const state = new Calculation.State({initialValue: valueObj('car')})
    expect(state.value).toBe('car')
})

test('string conversion uses the value toString', () => {
    const initialValue = [1, 2, 3]
    const state = new Calculation.State({initialValue})
    expect('x' + state).toBe('x1,2,3')
})

