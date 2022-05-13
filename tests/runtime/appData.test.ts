import {createElement} from 'react'
import renderer, {act} from 'react-test-renderer'
import {StoreProvider, useObjectStateWithDefaults} from '../../src/runtime/appData'
import {update} from '../../src/runtime/stateProxy'

const runInProvider = function (testFn: () => void) {
    function TestComponent() {
        testFn()
        return null
    }

    act(() => {
        renderer.create(createElement(StoreProvider, {children: createElement(TestComponent)}))
    })
}

const testInProvider = (testFn: () => void) => () => runInProvider(testFn)

const stateFor = (path: string = '', defaults: object = {}) => useObjectStateWithDefaults(path, defaults)

const updateStateFor = (path: string, updates: object, replace: boolean = false) => stateFor(path)._update(updates, replace)

test('get whole initial state', testInProvider(() => {
    expect(stateFor('')).toStrictEqual({app: {}})
}))

test('get initial app state', testInProvider(() => {
    expect(stateFor('app')).toStrictEqual({})
}))

test('get initial state at app level sets initial values if supplied', testInProvider(() => {
    expect(stateFor('app', {widgets: {color: 'red', length: 23}})).toStrictEqual({widgets: {color: 'red', length: 23}})
    expect(stateFor('app')).toStrictEqual({widgets: {color: 'red', length: 23}})
}))

test.skip('get initial state at app level updates initial values if supplied', testInProvider(() => {
    expect(stateFor('app', {widgets: {color: 'red', length: 23}})).toStrictEqual({widgets: {color: 'red', length: 23}})
    expect(stateFor('app')).toStrictEqual({widgets: {color: 'red', length: 23}})
    expect(stateFor('app', {widgets: {color: 'blue', length: 23}, sprockets: {height: 27}})).toStrictEqual({widgets: {color: 'blue', length: 23}, sprockets: {height: 27}})
    expect(stateFor('app')).toStrictEqual({widgets: {color: 'blue', length: 23}, sprockets: {height: 27}})
}))

test('get initial state below app level is empty object if no initial values supplied', testInProvider(() => {
    expect(stateFor('app.page1.description')).toStrictEqual({})
}))

test('get initial state below app level sets initial values if supplied', testInProvider(() => {
    expect(stateFor('app.page1.description', {color: 'red', length: 23})).toStrictEqual({color: 'red', length: 23})
    expect(stateFor('app.page1.description')).toStrictEqual({color: 'red', length: 23})
}))

test('can set app state and get it again', testInProvider(() => {
    updateStateFor('app', {foo: 27})
    expect(stateFor('app')).toStrictEqual({foo: 27})
}))

test('can set state below app level and get it again', testInProvider(() => {
    updateStateFor('app.page1.description', {color: 'red', length: 23})
    expect(stateFor('app.page1.description')).toStrictEqual({color: 'red', length: 23})
    expect(stateFor('app.page1')).toStrictEqual({description: {color: 'red', length: 23}})
    expect(stateFor('app')).toStrictEqual({page1: {description: {color: 'red', length: 23}}})
    expect(stateFor()).toStrictEqual({app: {page1: {description: {color: 'red', length: 23}}}})
}))

test('can get state with an element path and normalise first part to "app"', testInProvider(() => {
    updateStateFor('app.page1.description', {color: 'red', length: 23})
    expect(stateFor('BigApp.page1.description')).toStrictEqual({color: 'red', length: 23})
    expect(stateFor()).toStrictEqual({app: {page1: {description: {color: 'red', length: 23}}}})
}))

test('can use non-existent state below app level and set initial values', testInProvider(() => {
    const newState = stateFor('app.page1', {description: {value: 'Fiddle'}})
    expect(newState).toMatchObject({description: {value: 'Fiddle'}})
    expect(newState._path).toBe('app.page1')
    expect(newState.description._path).toBe('app.page1.description')
    expect(stateFor('app.page1')).toStrictEqual({description: {value: 'Fiddle'}})
}))

test('can use partially existing state below app level and update with initial values', testInProvider(() => {
    updateStateFor('app.page1.description', {color: 'red'})
    const newState = stateFor('app.page1', {description: {color: 'blue', length: 1}})
    expect(newState).toMatchObject({description: {color: 'red', length: 1,}})
    expect(stateFor('app.page1.description')).toStrictEqual({color: 'red'})
    expect(stateFor('app.page1')).toStrictEqual({description: {color: 'red'}})
    expect(stateFor()).toStrictEqual({app: {page1: {description: {color: 'red'}}}})
}))

test('state with defaults does not add properties to the base store', testInProvider(() => {
    updateStateFor('app.page1.description', {color: 'red'})
    stateFor('app.page1', {description: {color: 'blue', length: 1}})
    updateStateFor('app.page1.color', {value: 'red'})
    stateFor('app.page1', {color: {value: 'blue', length: 1}})
    expect(stateFor('app.page1.description')).toStrictEqual({color: 'red'})
    expect(stateFor('app.page1.color')).toStrictEqual({value: 'red'})
}))

test('can set an item in state below app level to undefined and get it again and use defaults', testInProvider(() => {
    updateStateFor('app.page1.description', {color: 'red', length: undefined})
    expect(stateFor('app.page1.description')).toStrictEqual({color: 'red', length: undefined})
    const newState = stateFor('app.page1', {description: {color: 'blue', length: 111}})
    expect(newState).toMatchObject({description: {color: 'red', length: 111}})
}))

test('can replace state below app level and get it again', testInProvider(() => {
    updateStateFor('app.page1.description', {color: 'red', length: 23}, true)
    expect(stateFor('app.page1.description')).toStrictEqual({color: 'red', length: 23})
    expect(stateFor('app.page1')).toStrictEqual({description: {color: 'red', length: 23}})
    expect(stateFor('app')).toStrictEqual({page1: {description: {color: 'red', length: 23}}})
}))

test('calls init function on state object if found and applies updates', testInProvider(() => {
    stateFor('app.page1.description', {
        init() {
            return update({color: 'red', length: 23})
        }
    })
    //!!! this behaves really strangely
    // const initColor = objectState1.color.valueOf()
    // expect(initColor).toBeUndefined()
    const stateFor1 = stateFor('app.page1.description')
    expect(stateFor1.color).toBe('red')
}))

test('calls init function on state object with updateFn', testInProvider(() => {
    stateFor('app.page1.description', {
        init(updateFn: any) {
            updateFn({color: 'red', length: 23})
        }
    })
    const stateFor1 = stateFor('app.page1.description')
    expect(stateFor1.color).toBe('red')
}))
