import {stateProxy} from '../../src/runtime/appData'

test('valueOf and value at each level returns value if present and self if not', () => {
    const state = stateProxy('app.page1', {color: {value: 'red'}}, {color: {value: 'blue', defaultValue: '', length: 1}})
    expect(state.valueOf()).toMatchObject({color: { value: 'red', length: 1}})
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.color.valueOf()).toBe('red')
    expect(state.color.value).toBe('red')
    expect(state.color + ' dawn').toBe('red dawn')
})

test('valueOf and value at each level returns initial value if present and self if not', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {color: {value: 'blue', defaultValue: '', length: 1}})
    expect(state.valueOf()).toMatchObject({color: { defaultValue: '', length: 1}})
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.color.valueOf()).toBe('blue')
    expect(state.color.value).toBe('blue')
    expect(state.color + ' sky').toBe('blue sky')
})

test('valueOf and value at each level returns default value if initial value not present', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {color: {defaultValue: '', length: 1}})
    expect(state.valueOf()).toMatchObject({color: { defaultValue: '', length: 1}})
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.color.valueOf()).toBe('')
    expect(state.color.value).toBe('')
    expect(state.color + ' sky').toBe(' sky')
})

test('valueOf and value at each level returns default value if initial value undefined', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {color: {value: undefined, defaultValue: '', length: 1}})
    expect(state.valueOf()).toMatchObject({color: { defaultValue: '', length: 1}})
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.color.valueOf()).toBe('')
    expect(state.color.value).toBe('')
    expect(state.color + ' sky').toBe(' sky')
})

test('valueOf and value at each level returns default value if empty', () => {
    const state = stateProxy('app.page1', {color: {value: null}}, {color: {value: 'blue', defaultValue: '', length: 1}})
    expect(state.valueOf()).toMatchObject({color: { value: '', defaultValue: '', length: 1}})
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.color.valueOf()).toBe('')
    expect(state.color.value).toBe('')
    expect(state.color + ' sky').toBe(' sky')
})

// _controlValue
test('_controlValue returns value if present and self if not', () => {
    const state = stateProxy('app.page1', {color: {value: 'red'}}, {color: {value: 'blue', defaultValue: '', length: 1}})
    expect(state.color._controlValue).toBe('red')
})

test('_controlValue returns initial value if present and self if not', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {color: {value: 'blue', defaultValue: '', length: 1}})
    expect(state.color._controlValue).toBe('blue')
})

test('_controlValue returns default value if initial value not present', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {color: {defaultValue: '', length: 1}})
    expect(state.color._controlValue).toBe(null)
})

test('_controlValue returns default value if initial value undefined', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {color: {value: undefined, defaultValue: '', length: 1}})
    expect(state.color._controlValue).toBe(null)
})

test('_controlValue returns default value if empty', () => {
    const state = stateProxy('app.page1', {color: {value: null}}, {color: {value: 'blue', defaultValue: '', length: 1}})
    expect(state.color._controlValue).toBe(null)
})

test('can get nested properties of value in state directly', () => {
    const state = stateProxy('app.page1.data', {a: 10, value: {b: 20, c: { d: 30, value: {e: 40}}}}, {})
    expect(state).toMatchObject({a: 10, value: {b: 20, c: { d: 30, value: {e: 40}}}})
    expect(state.valueOf()).toMatchObject({b: 20, c: { d: 30, value: {e: 40}}})
    expect(state.a).toBe(10)
    expect(state.b).toBe(20)
    expect(state.c.d).toBe(30)
    expect(state.c.e).toBe(40)
})

test('can get nested properties of value in initial value directly', () => {
    const state = stateProxy('app.page1.data',{value: undefined}, {a: 10, value: {b: 20, c: {d: 30, value: {e: 40}}}})
    expect(state).toMatchObject({a: 10, value: {b: 20, c: { d: 30, value: {e: 40}}}})
    expect(state.valueOf()).toMatchObject({b: 20, c: { d: 30, value: {e: 40}}})
    expect(state.a).toBe(10)
    expect(state.b).toBe(20)
    expect(state.c.d).toBe(30)
    expect(state.c.e).toBe(40)
})
