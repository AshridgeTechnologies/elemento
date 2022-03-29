import {stateProxy} from '../../src/runtime/stateProxy'
import {Changes} from '../../src/runtime/DataStore'

const dummyUpdateFn = (path: string, changes: Changes, replace?: boolean) => {
    throw new Error('Dummy update fn called')
}

test('valueOf and value at each level returns value if present and self if not', () => {
    const state = stateProxy('app.page1', {color: {value: 'red'}}, {color: {value: 'blue', defaultValue: '', length: 1}}, dummyUpdateFn)
    expect(state.valueOf()).toMatchObject({color: { value: 'red', length: 1}})
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.color.valueOf()).toBe('red')
    expect(state.color.value).toBe('red')
    expect(state.color + ' dawn').toBe('red dawn')
})

test('valueOf and value at each level returns initial value if present and self if not', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {color: {value: 'blue', defaultValue: '', length: 1}}, dummyUpdateFn)
    expect(state.valueOf()).toMatchObject({color: { defaultValue: '', length: 1}})
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.color.valueOf()).toBe('blue')
    expect(state.color.value).toBe('blue')
    expect(state.color + ' sky').toBe('blue sky')
})

test('valueOf and value at each level returns default value if initial value not present', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {color: {defaultValue: '', length: 1}}, dummyUpdateFn)
    expect(state.valueOf()).toMatchObject({color: { defaultValue: '', length: 1}})
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.color.valueOf()).toBe('')
    expect(state.color.value).toBe('')
    expect(state.color + ' sky').toBe(' sky')
})

test('valueOf and value at each level returns default value if initial value undefined', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {color: {value: undefined, defaultValue: '', length: 1}}, dummyUpdateFn)
    expect(state.valueOf()).toMatchObject({color: { defaultValue: '', length: 1}})
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.color.valueOf()).toBe('')
    expect(state.color.value).toBe('')
    expect(state.color + ' sky').toBe(' sky')
})

test('valueOf and value at each level returns default value if empty', () => {
    const state = stateProxy('app.page1', {color: {value: null}}, {color: {value: 'blue', defaultValue: '', length: 1}}, dummyUpdateFn)
    expect(state.valueOf()).toMatchObject({color: { value: '', defaultValue: '', length: 1}})
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.color.valueOf()).toBe('')
    expect(state.color.value).toBe('')
    expect(state.color + ' sky').toBe(' sky')
})

// _controlValue
test('_controlValue returns value if present and self if not', () => {
    const state = stateProxy('app.page1', {color: {value: 'red'}}, {color: {value: 'blue', defaultValue: '', length: 1}}, dummyUpdateFn)
    expect(state.color._controlValue).toBe('red')
})

test('_controlValue returns initial value if present and self if not', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {color: {value: 'blue', defaultValue: '', length: 1}}, dummyUpdateFn)
    expect(state.color._controlValue).toBe('blue')
})

test('_controlValue returns default value if initial value not present', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {color: {defaultValue: '', length: 1}}, dummyUpdateFn)
    expect(state.color._controlValue).toBe(null)
})

test('_controlValue returns default value if initial value undefined', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {color: {value: undefined, defaultValue: '', length: 1}}, dummyUpdateFn)
    expect(state.color._controlValue).toBe(null)
})

test('_controlValue returns default value if empty', () => {
    const state = stateProxy('app.page1', {color: {value: null}}, {color: {value: 'blue', defaultValue: '', length: 1}}, dummyUpdateFn)
    expect(state.color._controlValue).toBe(null)
})

test('can get nested properties of value in state directly', () => {
    const state = stateProxy('app.page1.data', {a: 10, value: {b: 20, c: { d: 30, value: {e: 40}}}}, {}, dummyUpdateFn)
    expect(state).toMatchObject({a: 10, value: {b: 20, c: { d: 30, value: {e: 40}}}})
    expect(state.valueOf()).toMatchObject({b: 20, c: { d: 30, value: {e: 40}}})
    expect(state.a).toBe(10)
    expect(state.b).toBe(20)
    expect(state.c.d).toBe(30)
    expect(state.c.e).toBe(40)
})

test('can get nested properties of value in initial value directly', () => {
    const state = stateProxy('app.page1.data',{value: undefined}, {a: 10, value: {b: 20, c: {d: 30, value: {e: 40}}}}, dummyUpdateFn)
    expect(state).toMatchObject({a: 10, value: {b: 20, c: { d: 30, value: {e: 40}}}})
    expect(state.valueOf()).toMatchObject({b: 20, c: { d: 30, value: {e: 40}}})
    expect(state.a).toBe(10)
    expect(state.b).toBe(20)
    expect(state.c.d).toBe(30)
    expect(state.c.e).toBe(40)
})

// defaults

test('can use non-existent state below app level and get defaults', ()=> {
    const storedState = {}
    const state = stateProxy('app.page1', storedState, {description: { value: 'Fiddle'}}, dummyUpdateFn)
    expect(state).toMatchObject({description: { value: 'Fiddle'}})
    expect(state._path).toBe('app.page1')
    expect(state.description._path).toBe('app.page1.description')
    expect(storedState).toStrictEqual({})  // check original not changed by proxy
})

test('can use partially existing state below app level and get value with defaults', ()=> {
    const storedState = {description: {color: 'red'}}
    let state = stateProxy('app.page1', storedState, {description: { color: 'blue', length: 1}}, dummyUpdateFn)
    expect(state).toMatchObject({description: {color: 'red', length: 1,}})
    expect(storedState).toStrictEqual({description: {color: 'red'}})
})


// updates
test('can update state via _update', function () {
    const updateFn = jest.fn()
    const state = stateProxy('app.page1.data', {a: 10, value: {b: 20, c: { d: 30, value: {e: 40}}}}, {}, updateFn)
    state._update({a: 11})
    expect(updateFn).toHaveBeenCalledWith('app.page1.data', {a:11}, false)
})

test('can partially update nested state through _update', () => {
    const updateFn = jest.fn()
    let componentState = stateProxy('app.page1', {description: {value: 'Doddle', answer: 42}}, {description: { value: 'Fiddle'}}, updateFn)
    expect(componentState.description).toMatchObject({value: 'Doddle', answer: 42})
    componentState.description._update({value: 'Bingo'})
    expect(updateFn).toHaveBeenCalledWith('app.page1.description', {value: 'Bingo'}, false)
})

test('can set nested state through _update', () => {
    const updateFn = jest.fn()
    let componentState = stateProxy('app.page1', {description: {value: 'Doddle', answer: 42}}, {description: { value: 'Fiddle'}}, updateFn)
    expect(componentState.description).toMatchObject({value: 'Doddle', answer: 42})
    componentState.description._update({value: 'Bingo'}, true)
    expect(updateFn).toHaveBeenCalledWith('app.page1.description', {value: 'Bingo'}, true)
})

test('can update app state via _updateApp', function () {
    const updateFn = jest.fn()
    const state = stateProxy('app.page1.data', {a: 10, value: {b: 20, c: { d: 30, value: {e: 40}}}}, {}, updateFn)
    state._updateApp({top: {levelTwo: 22}})
    expect(updateFn).toHaveBeenCalledWith('app', {top: {levelTwo: 22}}, false)
})

//TODO
test.skip('can update nested state in a value via _update', function () {
    const updateFn = jest.fn()
    const state = stateProxy('app.page1.data', {a: 10, value: {b: 20, c: { d: 30, value: {e: 40}}}}, {}, updateFn)
    state.value.c._update({d: 31})
    expect(updateFn).toHaveBeenCalledWith('app.page1.data.value.c', {d:31}, false)
})

