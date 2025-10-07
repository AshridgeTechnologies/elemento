/**
 * @vitest-environment jsdom
 */
import {expect, test} from "vitest"
import {Data} from '../../../src/runtime/components/index'
import {snapshot, testAppInterfaceNew as testAppInterface, wrappedTestElementNew} from '../../testutil/testHelpers'
import {render} from '@testing-library/react'
import AppStateStore from '../../../src/runtime/state/AppStateStore'

const [data, appStoreHook] = wrappedTestElementNew(Data)

const stateAt = (path: string) => appStoreHook.stateAt(path)

const theStore = new AppStateStore()
let idSeq = 1
const createState = (props: object) => theStore.getOrCreate((idSeq++).toString(), Data.State, props)

test('Data element produces output with simple value',
    snapshot(data('app.page1.data1', {initialValue: 'Hi there!', display: true}))
)

test('Data element produces output with record value',
    snapshot(data('app.page1.data2', {initialValue: {a: 10, b: 'Bee1', c: true}, display: true}))
)

test('Data element produces empty output with default value for display', () => {
    const {container} = render(data('app.page1.height', {initialValue: 'Hi!'}))
    expect(container.innerHTML).toBe('')
})

test('Set replaces value', () => {
    const state = createState({initialValue: {a: 10, b: 'Bee1', c: true}})
    expect(state.value).toStrictEqual({a: 10, b: 'Bee1', c: true})

    state.Set({a:20, b:'Cee'})
    expect(state.latest().value).toStrictEqual({a:20, b:'Cee'})
})

test('Reset returns to initial value', () => {
    const state = createState({initialValue: {a: 10, b: 'Bee1', c: true}})
    state.updateState({value: {a:5, c:'Cee'}})
    expect(state.latest().value).toStrictEqual({a:5, c:'Cee'})

    state.Set({a:20, b:'Cee'})
    expect(state.latest().value).toStrictEqual({a:20, b:'Cee'})

    state.Reset()
    expect(state.latest().value).toStrictEqual({a: 10, b: 'Bee1', c: true})
})

test('Set can set array', () => {
    const state = createState({initialValue: []})
    expect(state.value).toStrictEqual([])

    state.Set(['a', 20])
    expect(state.latest().value).toStrictEqual(['a', 20])
})

test('Update changes only props given', () => {
    const state = createState({initialValue: {a: 10, b: 'Bee1', c: true}})
    expect(state.value).toStrictEqual({a: 10, b: 'Bee1', c: true})

    state.Update({a:20, b:'Cee'})
    expect(state.latest().value).toStrictEqual({a:20, b:'Cee', c: true})
})

test('Update can update an array', () => {
    const state = createState({initialValue: [10, 20, 30]})
    expect(state.value).toStrictEqual([10, 20, 30])

    state.Update({0:99, '2':'Cee'})
    expect(state.latest().value).toStrictEqual([99, 20, 'Cee'])
})

test('valueOf returns the value', () => {
    const initialValue = {a: 10, b: 'Bee1', c: true}
    const state = new Data.State({initialValue})
    expect(state.valueOf()).toBe(initialValue)
})

test('string conversion uses the value toString', () => {
    const initialValue = [1, 2, 3]
    const state = new Data.State({initialValue})
    expect('x' + state).toBe('x1,2,3')
})

test('properties of the value are copied onto the Data instance', () => {
    const initialValue = {a: 10, b: 'Bee1', c: true}
    const state = new Data.State({initialValue}) as any
    expect(state.a).toBe(10)
    expect(state.b).toBe('Bee1')
    expect(state.c).toBe(true)
})

test('no properties are copied onto the Data instance for a null value', () => {
    const state = new Data.State({initialValue: null})
    expect(state.value).toBe(null)
})

test('no properties are copied onto the Data instance for a primitive value', () => {
    const propNamesWithNull = Object.getOwnPropertyNames(new Data.State({initialValue: null}))
    const state = new Data.State({initialValue: 42})
    expect(state.value).toBe(42)
    const propNamesWith42 = Object.getOwnPropertyNames(state)
    expect(propNamesWith42).toStrictEqual(propNamesWithNull)
})

test('properties of the value are copied onto the Data instance after an update', () => {
    const initialValue = {a: 10, b: 'Bee1', c: true}
    // @ts-ignore
    const state = new Data.State({initialValue}).withState({value: {b: 'Bee2', c: false, d: '99'}}) as any
    expect(state.a).toBe(undefined)
    expect(state.b).toBe('Bee2')
    expect(state.c).toBe(false)
    expect(state.d).toBe('99')
})
