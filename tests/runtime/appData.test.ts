import React from 'react'
import renderer, {act} from 'react-test-renderer'
import {
    _dangerouslyResetState,
    getState,
    updateState,
    useObjectState,
    useObjectStateWithDefaults,
    useStore
} from '../../src/runtime/appData'

function StatefulComponent(props:{path?: string, exposeState: (state: any) => void}) {
    const {path, exposeState} = props
    const state = path === undefined ? useStore() : useObjectState(path)
    exposeState(state)
    return null
}

function stateFor(path?: string) {
    let state: any = undefined
    act( () => {renderer.create(React.createElement(StatefulComponent, {path, exposeState: s => state = s}))} )
    return state
}

function StatefulComponentWithDefaults(props:{path: string, defaults: object, exposeState: (state: any) => void}) {
    const {path, defaults, exposeState} = props
    const state = useObjectStateWithDefaults(path, defaults)
    exposeState(state)
    return null
}

function stateWithDefaultsFor(path: string, defaults: object) {
    let state: any = undefined
    act( () => {renderer.create(React.createElement(StatefulComponentWithDefaults, {path, defaults, exposeState: s => state = s}))} )
    return state
}

beforeEach( () => {
    act( () => { _dangerouslyResetState() })
})

test('get whole initial state', ()=> {
    expect(stateFor()).toStrictEqual({app: {}})
})

test('get initial app state', ()=> {
    expect(stateFor('app')).toStrictEqual({})
})

test('can set app state and get it again', ()=> {
    act( () => {updateState('app', {foo: 27}) } )
    expect(stateFor('app')).toStrictEqual({foo: 27})
})

test('can use non-existent state below app level and get defaults', ()=> {
    let newState = stateWithDefaultsFor('app.page1', {description: { value: 'Fiddle'}})
    expect(newState).toStrictEqual({description: { value: 'Fiddle'}})
    expect(stateFor('app.page1')).toBeUndefined()
})

test('can use existing state below app level and get existing value without changing the state', ()=> {
    act( () => {updateState('app.page1.description', {color: 'red', length: 23}) } )
    const existingState = getState()
    let newState = stateWithDefaultsFor('app.page1', {description: { color: 'blue', length: 1}})
    expect(newState).toStrictEqual({description: {color: 'red', length: 23}})
    expect(stateFor('app.page1.description')).toStrictEqual({color: 'red', length: 23})
    expect(stateFor('app.page1')).toStrictEqual({description: {color: 'red', length: 23}})
    expect(stateFor()).toStrictEqual({app: {page1: {description: {color: 'red', length: 23}}}})
    expect(getState()).toBe(existingState)
})

test('can use partially existing state below app level and get value with defaults', ()=> {
    act( () => {updateState('app.page1.description', {color: 'red'}) } )
    let newState = stateWithDefaultsFor('app.page1', {description: { color: 'blue', length: 1}})
    expect(newState).toStrictEqual({description: {color: 'red', length: 1}})
    expect(stateFor('app.page1.description')).toStrictEqual({color: 'red'})
    expect(stateFor('app.page1')).toStrictEqual({description: {color: 'red'}})
    expect(stateFor()).toStrictEqual({app: {page1: {description: {color: 'red'}}}})
})

test('can set state below app level and get it again', ()=> {
    act( () => {updateState('app.page1.description', {color: 'red', length: 23}) } )
    expect(stateFor('app.page1.description')).toStrictEqual({color: 'red', length: 23})
    expect(stateFor('app.page1')).toStrictEqual({description: {color: 'red', length: 23}})
    expect(stateFor('app')).toStrictEqual({page1: {description: {color: 'red', length: 23}}})
    expect(getState()).toStrictEqual({app: {page1: {description: {color: 'red', length: 23}}}})
})

test('can update state below app level and keep existing objects', ()=> {
    act( () => {updateState('app.page1.description', {color: 'red', length: 23}) } )
    const page1State = stateFor('app.page1')
    act( () => {updateState('app.page2.description', {color: 'blue', length: 499}) } )
    const page1StateAfter = stateFor('app.page1')
    expect(page1StateAfter).toBe(page1State)

    expect(getState()).toStrictEqual({app: {
        page1: {description: {color: 'red', length: 23}},
        page2: {description: {color: 'blue', length: 499}},
        }})
})

test('can update state below app level and keep existing objects below the part changed', ()=> {
    act( () => {updateState('app.page1.description', {color: 'red', length: 23}) } )
    const page1DescriptionState = stateFor('app.page1.description')
    act( () => {updateState('app.page1', {route: 66}) } )
    const page1DescriptionStateAfter = stateFor('app.page1.description')
    expect(page1DescriptionStateAfter).toBe(page1DescriptionState)

    expect(getState()).toStrictEqual({app: {
        page1: {route: 66, description: {color: 'red', length: 23}},
        }})
})

test('can update state below app level and whole state is the same if nothing changed', ()=> {
    act( () => {updateState('app.page1.description', {color: 'red', length: 23}) } )
    const existingState = getState()
    act( () => {updateState('app.page1.description', {color: 'red'}) } )
    expect(getState()).toBe(existingState)
})