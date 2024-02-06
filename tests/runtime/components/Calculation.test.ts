/**
 * @jest-environment jsdom
 */

import {Calculation} from '../../../src/runtime/components/index'
import {testAppInterface, valueObj, wrappedTestElement} from '../../testutil/testHelpers'
import {render} from '@testing-library/react'
import '@testing-library/jest-dom'
import {testContainer} from '../../testutil/rtlHelpers'
import {CalculationState} from '../../../src/runtime/components/Calculation'

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

test('State class has correct properties and functions', () => {
    const state = new Calculation.State({value: {a: 10, b: 'bee'}})
    const appInterface = testAppInterface(); state.init(appInterface, 'testPath')
    expect(state.value).toStrictEqual({a: 10, b: 'bee'})
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

