import React from 'react'
import renderer, {act} from 'react-test-renderer'
import {_dangerouslyResetState, getState, setState, updateState, useObjectStateWithDefaults} from '../../src/runtime/appData'
import {stateFor} from '../util/testHelpers'


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
    expect(newState).toMatchObject({_path: 'app.page1', description: { value: 'Fiddle', _path: 'app.page1.description'}})
    expect(stateFor('app.page1')).toBeUndefined()
})

test('can use existing state below app level and get existing value without changing the state', ()=> {
    act( () => {updateState('app.page1.description', {color: 'red', length: 23}) } )
    const existingState = getState()
    let newState = stateWithDefaultsFor('app.page1', {description: { color: 'blue', length: 1}})
    expect(newState).toMatchObject({_path: 'app.page1', description: {color: 'red', length: 23, _path: 'app.page1.description'}})
    expect(stateFor('app.page1.description')).toStrictEqual({color: 'red', length: 23})
    expect(stateFor('app.page1')).toStrictEqual({description: {color: 'red', length: 23}})
    expect(stateFor()).toStrictEqual({app: {page1: {description: {color: 'red', length: 23}}}})
    expect(getState()).toBe(existingState)
})

test('can use partially existing state below app level and get value with defaults', ()=> {
    act( () => {updateState('app.page1.description', {color: 'red'}) } )
    let newState = stateWithDefaultsFor('app.page1', {description: { color: 'blue', length: 1}})
    expect(newState).toMatchObject({_path: 'app.page1', description: {color: 'red', length: 1, _path: 'app.page1.description'}})
    expect(stateFor('app.page1.description')).toStrictEqual({color: 'red'})
    expect(stateFor('app.page1')).toStrictEqual({description: {color: 'red'}})
    expect(stateFor()).toStrictEqual({app: {page1: {description: {color: 'red'}}}})
})

test('state with defaults does not add properties to the base store', () => {
    act( () => {updateState('app.page1.description', {color: 'red'}) } )
    stateWithDefaultsFor('app.page1', {description: { color: 'blue', length: 1}})
    act( () => {updateState('app.page1.color', {value: 'red'}) } )
    stateWithDefaultsFor('app.page1', {color: { value: 'blue', length: 1}})
    expect(stateFor('app.page1.description')).toStrictEqual({color: 'red'})
    expect(stateFor('app.page1.color')).toStrictEqual({value: 'red'})
})


test('state with defaults has valueOf method at each level that returns value if present and self if not', () => {
    act( () => {updateState('app.page1.color', {value: 'red'}) } )
    let newState = stateWithDefaultsFor('app.page1', {color: { value: 'blue', length: 1}})
    expect(newState.valueOf()).toMatchObject({color: { value: 'red', length: 1}})
    expect(newState.hasOwnProperty('valueOf')).toBe(false)
    expect(newState.color.valueOf()).toBe('red')
    expect(newState.color + ' dawn').toBe('red dawn')
})

test('state with defaultValue has valueOf method at each level that returns default value if present and self if not', () => {
    act( () => {updateState('app.page1.color', {value: undefined}) } )
    let newState = stateWithDefaultsFor('app.page1', {color: { defaultValue: 'blue', length: 1}})
    expect(newState.valueOf()).toMatchObject({color: { defaultValue: 'blue', length: 1}})
    expect(newState.hasOwnProperty('valueOf')).toBe(false)
    expect(newState.color.valueOf()).toBe('blue')
    expect(newState.color + ' sky').toBe('blue sky')
})

test('can set state below app level and get it again', ()=> {
    act( () => {updateState('app.page1.description', {color: 'red', length: 23}) } )
    expect(stateFor('app.page1.description')).toStrictEqual({color: 'red', length: 23})
    expect(stateFor('app.page1')).toStrictEqual({description: {color: 'red', length: 23}})
    expect(stateFor('app')).toStrictEqual({page1: {description: {color: 'red', length: 23}}})
    expect(getState()).toStrictEqual({app: {page1: {description: {color: 'red', length: 23}}}})
})

test('can set an item in state below app level to undefined and get it again and use defaults', ()=> {
    act( () => {updateState('app.page1.description', {color: 'red', length: 23}) } )
    expect(stateFor('app.page1.description')).toStrictEqual({color: 'red', length: 23})
    act( () => {updateState('app.page1.description', {length: undefined}) } )
    expect(stateFor('app.page1.description')).toStrictEqual({color: 'red', length: undefined})
    let newState = stateWithDefaultsFor('app.page1', {description: { color: 'blue', length: 111}})
    expect(newState).toMatchObject({_path: 'app.page1', description: {color: 'red', length: 111, _path: 'app.page1.description'}})
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

test('can update element in an array below app level and keep other existing objects', ()=> {
    act( () => {setState('app.page1.parts', [{color: 'red', length: 23}, {color: 'blue', length: 34}]) } )
    const page1Parts0State = stateFor('app.page1.parts.0')
    act( () => {updateState('app.page1.parts.1', {length: 44}) } )
    const page1Parts0StateAfter = stateFor('app.page1.parts[0]')  // test alternative index notation
    expect(page1Parts0StateAfter).toBe(page1Parts0State)

    expect(getState()).toStrictEqual({app: {
        page1: {parts: [{color: 'red', length: 23}, {color: 'blue', length: 44}]},
        }})
})

test('can update state below app level and whole state is the same if nothing changed', ()=> {
    act( () => {updateState('app.page1.description', {color: 'red', length: 23}) } )
    const existingState = getState()
    act( () => {updateState('app.page1.description', {color: 'red'}) } )
    expect(getState()).toBe(existingState)
})

test('can partially update nested state through result of useObjectStateWithDefaults', () => {
    act( () => {updateState('app.page1.description', {value: 'Doddle', answer: 42}) } )
    let componentState = stateWithDefaultsFor('app.page1', {description: { value: 'Fiddle'}})
    expect(componentState.description).toMatchObject({value: 'Doddle', answer: 42})
    act( () => {componentState.description._update({value: 'Bingo'}) } )
    expect(getState()).toStrictEqual({app: {
            page1: {description: {value: 'Bingo', answer: 42}},
        }})
})

test('error if try to update primitive value state', ()=> {
    act( () => {setState('app.page1.description', 'It is red') } )
    expect( () => act( () => {updateState('app.page1.description', {color: 'red'}) } ) ).toThrow(`app.page1.description: cannot update existing value 'It is red' with {color: 'red'}`)
})

describe('setState', () => {

    test('can set state below app level and get it again', ()=> {
        act( () => {setState('app.page1.description', {color: 'red', length: 23}) } )
        expect(stateFor('app.page1.description')).toStrictEqual({color: 'red', length: 23})
        expect(stateFor('app.page1')).toStrictEqual({description: {color: 'red', length: 23}})
        expect(stateFor('app')).toStrictEqual({page1: {description: {color: 'red', length: 23}}})
        expect(getState()).toStrictEqual({app: {page1: {description: {color: 'red', length: 23}}}})
    })

    test('can set state with array and get it again', ()=> {
        act( () => {setState('app.page1.description', ['red', 'green', 'blue']) } )
        expect(stateFor('app.page1.description')).toStrictEqual(['red', 'green', 'blue'])
        expect(stateFor('app.page1')).toStrictEqual({description: ['red', 'green', 'blue']})
        expect(stateFor('app')).toStrictEqual({page1: {description: ['red', 'green', 'blue']}})
        expect(getState()).toStrictEqual({app: {page1: {description: ['red', 'green', 'blue']}}})
    })

    test('can set state below app level and keep existing objects', ()=> {
        act( () => {setState('app.page1.description', {color: 'red', length: 23}) } )
        const page1State = stateFor('app.page1')
        act( () => {setState('app.page2.description', {color: 'blue', length: 499}) } )
        const page1StateAfter = stateFor('app.page1')
        expect(page1StateAfter).toBe(page1State)

        expect(getState()).toStrictEqual({app: {
                page1: {description: {color: 'red', length: 23}},
                page2: {description: {color: 'blue', length: 499}},
            }})
    })

    test('can set state below app level and remove existing objects below the part changed', ()=> {
        act( () => {setState('app.page1.description', {color: 'red', length: 23}) } )
        act( () => {setState('app.page1', {route: 66}) } )

        expect(getState()).toStrictEqual({app: {
                page1: {route: 66},
            }})
    })

    test('can set state below app level and whole state is the same if nothing changed', ()=> {
        act( () => {setState('app.page1.description', {color: 'red', length: 23}) } )
        const existingState = getState()
        act( () => {setState('app.page1.description', {color: 'red', length: 23}) } )
        expect(getState()).toBe(existingState)
    })

    test('can set nested state through result of useObjectStateWithDefaults', () => {
        act( () => {setState('app.page1.description', {value: 'Doddle', answer: 42}) } )
        let componentState = stateWithDefaultsFor('app.page1', {description: { value: 'Fiddle'}})
        expect(componentState.description).toMatchObject({value: 'Doddle', answer: 42})
        act( () => {componentState.description._update({value: 'Bingo'}, true) } )
        expect(getState()).toStrictEqual({app: {
                page1: {description: {value: 'Bingo'}},
            }})
    })

})


