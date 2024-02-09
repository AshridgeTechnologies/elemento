/**
 * @jest-environment jsdom
 */

import {Collection, Data, TextInput} from '../../../src/runtime/components/index'
import {snapshot, testAppInterface, wrappedTestElement} from '../../testutil/testHelpers'
import {render} from '@testing-library/react'
import {DataState} from '../../../src/runtime/components/Data'

const [data, appStoreHook] = wrappedTestElement(Data, DataState)

const stateAt = (path: string) => appStoreHook.stateAt(path)

test('Data element produces output with simple value',
    snapshot(data('app.page1.data1', {value: 'Hi there!'}, {display: true}))
)

test('Data element produces output with record value',
    snapshot(data('app.page1.data2', {value: {a: 10, b: 'Bee1', c: true}}, {display: true}))
)

test('Data element produces empty output with default value for display', () => {
    const {container} = render(data('app.page1.height', {value: 'Hi!'}))
    expect(container.innerHTML).toBe('')
})

test('Set returns correct update', () => {
    const state = new Data.State({value: {a: 10, b: 'Bee1', c: true}})
    const appInterface = testAppInterface(); state.init(appInterface, 'testPath')
    expect(state.value).toStrictEqual({a: 10, b: 'Bee1', c: true})

    state.Set({a:20, b:'Cee'})
    const expectedState = state._withStateForTest({value: {a:20, b:'Cee'}})
    expect(expectedState.value).toStrictEqual({a:20, b:'Cee'})
    expect(appInterface.updateVersion).toHaveBeenCalledWith(expectedState)
})

test('Update returns correct update', () => {
    const state = new Data.State({value: {a: 10, b: 'Bee1', c: true}})
    const appInterface = testAppInterface(); state.init(appInterface, 'testPath')
    expect(state.value).toStrictEqual({a: 10, b: 'Bee1', c: true})

    state.Update({a:20, b:'Cee'})
    const expectedState = state._withStateForTest({value: {a:20, b:'Cee', c: true}})
    expect(expectedState.value).toStrictEqual({a:20, b:'Cee', c: true})
    expect(appInterface.updateVersion).toHaveBeenCalledWith(expectedState)
})

test('valueOf returns the value', () => {
    const value = {a: 10, b: 'Bee1', c: true}
    const state = new Data.State({value})
    expect(state.valueOf()).toBe(value)
})

test('string conversion uses the value toString', () => {
    const value = [1, 2, 3]
    const state = new Data.State({value})
    expect('x' + state).toBe('x1,2,3')
})

test('properties of the value are copied onto the Data instance', () => {
    const value = {a: 10, b: 'Bee1', c: true}
    const state = new Data.State({value}) as any
    expect(state.a).toBe(10)
    expect(state.b).toBe('Bee1')
    expect(state.c).toBe(true)
})

test('no properties are copied onto the Data instance for a null value', () => {
    const state = new Data.State({value: null})
    expect(state.value).toBe(null)
})

test('no properties are copied onto the Data instance for a primitive value', () => {
    const propNamesWithNull = Object.getOwnPropertyNames(new Data.State({value: null}))
    const state = new Data.State({value: 42})
    expect(state.value).toBe(42)
    const propNamesWith42 = Object.getOwnPropertyNames(state)
    expect(propNamesWith42).toStrictEqual(propNamesWithNull)
})

test('does deep compare on value in props', () => {
    {
        const state1 = new Data.State({value: {}})
        const state2 = new Data.State({value: {}})
        expect(state1.updateFrom(state2)).toBe(state1)
    }
    {
        const state1 = new Data.State({value: {a: 10}})
        const state2 = new Data.State({value: {a: 10}})
        expect(state1.updateFrom(state2)).toBe(state1)
    }
    {
        const state1 = new Data.State({value: {a: 10}})
        const state2 = new Data.State({value: {a: 10, b: 20}})
        expect(state1.updateFrom(state2)).not.toBe(state1)
    }
})

test('properties of the value are copied onto the Data instance after an update', () => {
    const value = {a: 10, b: 'Bee1', c: true}
    // @ts-ignore
    const state = new Data.State({value}).withState({value: {b: 'Bee2', c: false, d: '99'}}) as any
    expect(state.a).toBe(undefined)
    expect(state.b).toBe('Bee2')
    expect(state.c).toBe(false)
    expect(state.d).toBe('99')
})
