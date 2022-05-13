import {ResultWithUpdates, stateProxy, update} from '../../src/runtime/stateProxy'
import {wait} from '../testutil/rtlHelpers'

const dummyUpdateFn = () => {
    throw new Error('Dummy update fn called')
}

class Color {
    constructor(public props: {value: string, length: number}) {}

    get value() { return this.props.value}
    get defaultValue() { return 'grey'}
    get density() { return 1}
}

test('uses _type if present in initialValues', () => {
    const state = stateProxy('app.page1.color', {}, {_type: Color, value: 'blue'}, dummyUpdateFn)
    expect(state.valueOf()).toBe('blue')
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.value).toBe('blue')
    expect(state.density).toBe(1)
    expect(state.constructor).toBe(Color)
    expect(state.props).not.toHaveProperty('_type')
})

test('uses _type to get default value', () => {
    const state = stateProxy('app.page1.color', {}, {_type: Color}, dummyUpdateFn)
    expect(state.valueOf()).toBe('grey')
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.value).toBe('grey')
    expect(state.density).toBe(1)
})

test('uses _type if present in stored value', () => {
    const state = stateProxy('app.page1.color', {_type: Color, value: 'blue'}, {}, dummyUpdateFn)
    expect(state.valueOf()).toBe('blue')
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.value).toBe('blue')
    expect(state.density).toBe(1)
})

test('uses _type to get default value if not supplied in stored value', () => {
    const state = stateProxy('app.page1.color', {_type: Color}, {}, dummyUpdateFn)
    expect(state.valueOf()).toBe('grey')
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.value).toBe('grey')
    expect(state.density).toBe(1)
})

test('valueOf and value at each level returns value if present and self if not', () => {
    const state = stateProxy('app.page1', {color: {value: 'red'}}, {
        color: {
            _type: Color,
            value: 'blue'
        }
    }, dummyUpdateFn)
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.color.valueOf()).toBe('red')
    expect(state.color.value).toBe('red')
    expect(state.color.density).toBe(1)
    expect(state.color + ' dawn').toBe('red dawn')
})

test('valueOf and value at each level returns initial value if present and self if not', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {
        color: {
            _type: Color,
            value: 'blue'
        }
    }, dummyUpdateFn)
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.color.valueOf()).toBe('blue')
    expect(state.color.value).toBe('blue')
    expect(state.color + ' sky').toBe('blue sky')
})

test('valueOf and value at each level returns default value if initial value not present', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {color: {_type: Color}}, dummyUpdateFn)
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.color.valueOf()).toBe('grey')
    expect(state.color.value).toBe('grey')
    expect(state.color + ' sky').toBe('grey sky')
})

test('valueOf and value at each level returns default value if initial value undefined', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {
        color: {
            _type: Color,
            value: undefined
        }
    }, dummyUpdateFn)
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.color.valueOf()).toBe('grey')
    expect(state.color.value).toBe('grey')
    expect(state.color + ' sky').toBe('grey sky')
})

test('valueOf and value at each level returns default value if empty', () => {
    const state = stateProxy('app.page1', {color: {value: null}}, {color: {_type: Color, value: 'blue'}}, dummyUpdateFn)
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.color.valueOf()).toBe('grey')
    expect(state.color.value).toBe('grey')
    expect(state.color + ' sky').toBe('grey sky')
})

test('valueOf and value at each level returns default value if empty using _type in stored value', () => {
    const state = stateProxy('app.page1', {color: {_type: Color, value: null}}, {}, dummyUpdateFn)
    expect(state.hasOwnProperty('valueOf')).toBe(false)
    expect(state.color.valueOf()).toBe('grey')
    expect(state.color.value).toBe('grey')
    expect(state.color + ' sky').toBe('grey sky')
})

test('creates proxy with correct type at each level', () => {
    const state = stateProxy('app.page1', {color: {_type: Color, value: 'red'}}, {}, dummyUpdateFn)
    expect(state.constructor).toBe(Object)
    expect(state.color.constructor).toBe(Color)
    expect(state.color).toBeInstanceOf(Color)
    expect(state.color.props._type).toBe(undefined)
    expect(state.color.props.constructor).toBe(Object)
})

// _controlValue
test('_controlValue returns value if present and self if not', () => {
    const state = stateProxy('app.page1', {color: {value: 'red'}}, {color: {type: Color, value: 'blue'}}, dummyUpdateFn)
    expect(state.color._controlValue).toBe('red')
})

test('_controlValue returns initial value if present and self if not', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {
        color: {
            type: Color,
            value: 'blue'
        }
    }, dummyUpdateFn)
    expect(state.color._controlValue).toBe('blue')
})

test('_controlValue returns default value if initial value not present', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {color: {type: Color,}}, dummyUpdateFn)
    expect(state.color._controlValue).toBe(undefined)
})

test('_controlValue returns default value if initial value undefined', () => {
    const state = stateProxy('app.page1', {color: {value: undefined}}, {
        color: {
            type: Color,
            value: undefined
        }
    }, dummyUpdateFn)
    expect(state.color._controlValue).toBe(undefined)
})

test('_controlValue returns default value if empty', () => {
    const state = stateProxy('app.page1', {type: Color, color: {value: null}}, {}, dummyUpdateFn)
    expect(state.color._controlValue).toBe(null)
})

test('can get nested properties of value in state directly', () => {
    const state = stateProxy('app.page1.data', {a: 10, value: {b: 20, c: {d: 30, value: {e: 40}}}}, {}, dummyUpdateFn)
    expect(state).toMatchObject({a: 10, value: {b: 20, c: { d: 30, value: {e: 40}}}})
    expect(state.valueOf()).toMatchObject({b: 20, c: { d: 30, value: {e: 40}}})
    expect(state.a).toBe(10)
    expect(state.b).toBe(20)
    expect(state.c.d).toBe(30)
    expect(state.c.e).toBe(40)
})

test('can get nested properties of value in initial value directly', () => {
    const state = stateProxy('app.page1.data', {value: undefined}, {
        a: 10,
        value: {b: 20, c: {d: 30, value: {e: 40}}}
    }, dummyUpdateFn)
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
    const state = stateProxy('app.page1', storedState, {description: {value: 'Fiddle'}}, dummyUpdateFn)
    expect(state).toMatchObject({description: { value: 'Fiddle'}})
    expect(state._path).toBe('app.page1')
    expect(state.description._path).toBe('app.page1.description')
    expect(storedState).toStrictEqual({})  // check original not changed by proxy
})

test('can use partially existing state below app level and get value with defaults', ()=> {
    const storedState = {description: {color: 'red'}}
    let state = stateProxy('app.page1', storedState, {description: {color: 'blue', length: 1}}, dummyUpdateFn)
    expect(state).toMatchObject({description: {color: 'red', length: 1,}})
    expect(storedState).toStrictEqual({description: {color: 'red'}})
})


// updates
test('can update state via _update', function () {
    const updateFn = jest.fn()
    const state = stateProxy('app.page1.data', {a: 10, value: {b: 20, c: {d: 30, value: {e: 40}}}}, {}, updateFn)
    state._update({a: 11})
    expect(updateFn).toHaveBeenCalledWith('app.page1.data', {a:11}, false)
})

test('can partially update nested state through _update', () => {
    const updateFn = jest.fn()
    let componentState = stateProxy('app.page1', {
        description: {
            value: 'Doddle',
            answer: 42
        }
    }, {description: {value: 'Fiddle'}}, updateFn)
    expect(componentState.description).toMatchObject({value: 'Doddle', answer: 42})
    componentState.description._update({value: 'Bingo'})
    expect(updateFn).toHaveBeenCalledWith('app.page1.description', {value: 'Bingo'}, false)
})

test('can set nested state through _update', () => {
    const updateFn = jest.fn()
    let componentState = stateProxy('app.page1', {
        description: {
            value: 'Doddle',
            answer: 42
        }
    }, {description: {value: 'Fiddle'}}, updateFn)
    expect(componentState.description).toMatchObject({value: 'Doddle', answer: 42})
    componentState.description._update({value: 'Bingo'}, true)
    expect(updateFn).toHaveBeenCalledWith('app.page1.description', {value: 'Bingo'}, true)
})

test('can call an update function on the state object and apply the updates', () => {
    const updateFn = jest.fn()
    let componentState = stateProxy('app.page1', {
        description: {
            value: 'Doddle',
            makeDifficult() { return update({value: 'Hard'})}
        }
    }, {}, updateFn)
    expect(componentState.description).toMatchObject({value: 'Doddle'})
    componentState.description.makeDifficult()
    expect(updateFn).toHaveBeenCalledWith('app.page1.description', {value: 'Hard'}, false)

})

test('can call an update function on the state object and apply the updates with replace', () => {
    const updateFn = jest.fn()
    let componentState = stateProxy('app.page1', {
        description: {
            value: 'Doddle',
            makeDifficult() { return update({value: 'Hard'}, true)}
        }
    }, {}, updateFn)
    expect(componentState.description).toMatchObject({value: 'Doddle'})
    componentState.description.makeDifficult()
    expect(updateFn).toHaveBeenCalledWith('app.page1.description', {value: 'Hard'}, true)

})

test('can call a function on the state object and get immediate results with updates', async () => {
    const updateFn = jest.fn()
    let componentState = stateProxy('app.page1', {
        description: {
            value: 'Doddle',
            makeDifficultLater() { return new ResultWithUpdates('Ramping up',
                update({value: 'Getting tricky now'}),
                Promise.resolve(update({value: 'Really difficult now'})))}
        }
    }, {}, updateFn)
    expect(componentState.description).toMatchObject({value: 'Doddle'})

    const immediateResult = componentState.description.makeDifficultLater()
    expect(immediateResult).toBe('Ramping up')
    expect(updateFn).toHaveBeenCalledTimes(1)
    expect(updateFn).toHaveBeenCalledWith('app.page1.description', {value: 'Getting tricky now'}, false)

    await wait(5)
    expect(updateFn).toHaveBeenCalledTimes(2)
    expect(updateFn).toHaveBeenCalledWith('app.page1.description', {value: 'Really difficult now'}, false)

})

//TODO
test.skip('can update nested state in a value via _update', function () {
    const updateFn = jest.fn()
    const state = stateProxy('app.page1.data', {a: 10, value: {b: 20, c: {d: 30, value: {e: 40}}}}, {}, updateFn)
    state.value.c._update({d: 31})
    expect(updateFn).toHaveBeenCalledWith('app.page1.data.value.c', {d:31}, false)
})

