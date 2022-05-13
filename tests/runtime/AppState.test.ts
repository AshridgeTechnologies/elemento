import AppState from '../../src/runtime/AppState'
import {_DELETE} from '../../src/runtime/runtimeFunctions'

test('sets store to initial state', ()=> {
    const initialState = {app: {}}
    expect(new AppState(initialState).state).toBe(initialState)
})

test('get initial app state', ()=> {
    const store = new AppState({app: {}})
    expect(store.select('app')).toStrictEqual({})
})

test('can set app state and get it again', ()=> {
    const store = new AppState({app: {}})
    const newStore = store.update('app', {foo: 27})
    expect(newStore.select('app')).toStrictEqual({foo: 27})
    expect(store.select('app')).toStrictEqual({})
    expect(newStore).not.toBe(store)
})

test('can set and get lower level state', ()=> {
    const store = new AppState({app: {}})
    const newStore = store.update('app.page1.description', {color: 'red', length: 23})
    expect(store.select('app')).toStrictEqual({})
    expect(newStore.select('app.page1.description.color')).toBe('red')
    expect(newStore.select('app.page1.description')).toStrictEqual({color: 'red', length: 23})
    expect(newStore.select('app.page1')).toStrictEqual({description: {color: 'red', length: 23}})
    expect(newStore.select('app')).toStrictEqual({page1: {description: {color: 'red', length: 23}}})
    expect(newStore.select('')).toStrictEqual({app: {page1: {description: {color: 'red', length: 23}}}})
    expect(store.select('')).toStrictEqual({app: {}})
    expect(newStore).not.toBe(store)
})

test('can update an item in state below app level', ()=> {
    let store = new AppState({app: {}})
    store = store.update('app.page1.description', {color: 'red', length: 23})
    expect(store.select('app.page1.description')).toStrictEqual({color: 'red', length: 23})
    store = store.update('app.page1.description', {length: undefined, width: 99})
    expect(store.select('app.page1.description')).toStrictEqual({color: 'red', length: undefined, width: 99})
})

test('can update an item in state below app level to null', ()=> {
    let store = new AppState({app: {}})
    store = store.update('app.page1.description', {color: 'red', length: 23})
    expect(store.select('app.page1.description')).toStrictEqual({color: 'red', length: 23})
    store = store.update('app.page1.description', {length: null, width: 99})
    expect(store.select('app.page1.description')).toStrictEqual({color: 'red', length: null, width: 99})
})

test('can update value in state below app level to null', ()=> {
    let store = new AppState({app: {}})
    store = store.update('app.page1.description', {value: 2})
    expect(store.select('app.page1.description')).toStrictEqual({value: 2})
    store = store.update('app.page1.description', {value: null})
    expect(store.select('app.page1.description')).toStrictEqual({value: null})
})

test('can update state below app level and keep existing objects', ()=> {
    let store = new AppState({app: {}})
    store = store.update('app.page1.description', {color: 'red', length: 23})
    const page1State = store.select('app.page1')
    store = store.update('app.page2.description', {color: 'blue', length: 499})
    const page1StateAfter = store.select('app.page1')
    expect(page1StateAfter).toBe(page1State)

    expect(store.select('')).toStrictEqual({app: {
        page1: {description: {color: 'red', length: 23}},
        page2: {description: {color: 'blue', length: 499}},
        }})
})

test('can update state below app level and keep existing objects below the part changed', ()=> {
    let store = new AppState({app: {}})
    store = store.update('app.page1.description', {color: 'red', length: 23})
    const page1DescriptionState = store.select('app.page1.description')
    store = store.update('app.page1', {route: 66})
    const page1DescriptionStateAfter = store.select('app.page1.description')
    expect(page1DescriptionStateAfter).toBe(page1DescriptionState)

    expect(store.select('')).toStrictEqual({app: {
        page1: {route: 66, description: {color: 'red', length: 23}},
        }})
})

test('can remove elements in state below app level and keep existing objects below the part changed', ()=> {
    let store = new AppState({app: {}})
    store = store.update('app.page1.description', {
        value: {
            id1: {a: 10},
            id2: {a: 20},
        }
    })
    store = store.update('app.page1.description', {value: {id2: _DELETE}})

    expect(store.select('')).toStrictEqual({app: {
        page1: {description: {value: {
                    id1: {a: 10},
                }}},
        }})
})

test('can update element in an array below app level and keep other existing objects', ()=> {
    let store = new AppState({app: {}})
    store = store.update('app.page1.parts', [{color: 'red', length: 23}, {color: 'blue', length: 34}], true)
    const page1Parts0State = store.select('app.page1.parts.0')
    store = store.update('app.page1.parts.1', {length: 44})
    const page1Parts0StateAfter = store.select('app.page1.parts[0]')  // test alternative index notation
    expect(page1Parts0StateAfter).toBe(page1Parts0State)

    expect(store.select('')).toStrictEqual({app: {
        page1: {parts: [{color: 'red', length: 23}, {color: 'blue', length: 44}]},
        }})
})

test('can set state below app level to a primitive', ()=> {
    let store = new AppState({app: {}})
    store = store.update('app.page1.description', 'It is red', true)
    const newStore = store.update('app.page1.description', 'It is red', true)

    expect(newStore.select('app.page1.description')).toBe('It is red')
})

test('can update state below app level and whole state is the same if nothing changed', ()=> {
    let store = new AppState({app: {}})
    store = store.update('app.page1.description', {color: 'red', length: 23})
    const newStore = store.update('app.page1.description', {color: 'red'})

    expect(newStore).toBe(store)
})

test('error if try to update primitive value state', ()=> {
    let store = new AppState({app: {}})
    store = store.update('app.page1.description', 'It is red', true)
    expect( () => store.update('app.page1.description', {color: 'red'}) ).toThrow(`app.page1.description: cannot update existing value 'It is red' with {color: 'red'}`)
})

test('error if try to update with primitive', ()=> {
    let store = new AppState({app: {}})
    store = store.update('app.page1.description', {color: 'red'})
    expect( () => store.update('app.page1.description', 'It is red') ).toThrow(`app.page1.description: cannot update existing value {color: 'red'} with 'It is red'`)
})

describe('updateState with replace', () => {

    test('can set state below app level and get it again', ()=> {
        let store = new AppState({app: {}})
        store = store.update('app.page1.description', {color: 'red', length: 23}, true)
        expect(store.select('app.page1.description')).toStrictEqual({color: 'red', length: 23})
        expect(store.select('')).toStrictEqual({app: {page1: {description: {color: 'red', length: 23}}}})
    })

    test('can set state with array and get it again', ()=> {
        let store = new AppState({app: {}})
        store = store.update('app.page1.description', ['red', 'green', 'blue'], true)
        expect(store.select('app.page1.description')).toStrictEqual(['red', 'green', 'blue'])
        expect(store.select('app.page1')).toStrictEqual({description: ['red', 'green', 'blue']})
        expect(store.select('app')).toStrictEqual({page1: {description: ['red', 'green', 'blue']}})
        expect(store.select('')).toStrictEqual({app: {page1: {description: ['red', 'green', 'blue']}}})
    })

    test('can set state below app level and keep existing objects', ()=> {
        let store = new AppState({app: {}})
        store = store.update('app.page1.description', {color: 'red', length: 23}, true)
        const page1State = store.select('app.page1')
        store = store.update('app.page2.description', {color: 'blue', length: 499}, true)

        const page1StateAfter = store.select('app.page1')
        expect(page1StateAfter).toBe(page1State)

        expect(store.select('')).toStrictEqual({app: {
                page1: {description: {color: 'red', length: 23}},
                page2: {description: {color: 'blue', length: 499}},
            }})
    })

    test('can set state below app level and remove existing objects below the part changed', ()=> {
        let store = new AppState({app: {}})
        store = store.update('app.page1.description', {color: 'red', length: 23}, true)
        store = store.update('app.page1', {route: 66}, true)

        expect(store.select('')).toStrictEqual({app: {
                page1: {route: 66},
            }})
    })

    test('can set state below app level and whole store is the same if nothing changed', ()=> {
        let store = new AppState({app: {}})
        store = store.update('app.page1.description', {color: 'red', length: 23}, true)
        const newStore = store.update('app.page1.description', {color: 'red', length: 23}, true)

        expect(newStore).toBe(store)
    })
})


