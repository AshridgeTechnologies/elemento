import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
import AppState from '../../src/runtime/AppState'

test('get initial app state', ()=> {
    const store = new AppState({app: {}})
    expect(store.select('app')).toStrictEqual({})
})

test('can set app state and get it again', ()=> {
    const store = new AppState({app1: {}})
    const obj = {foo: 27}
    const newStore = store.update('app1', obj)
    expect(newStore.select('app1')).toBe(obj)
    expect(store.select('app1')).toStrictEqual({})
    expect(newStore).not.toBe(store)
})

test('can set and get lower level state', ()=> {
    const store = new AppState({app: {}})
    const obj = {color: 'red', length: 23}
    const newStore = store.update('app.page1.description', obj)
    expect(newStore).not.toBe(store)
    expect(newStore.select('app')).toStrictEqual({})
    expect(newStore.select('app.page1.description').color).toBe('red')
    expect(newStore.select('app.page1.description')).toBe(obj)
})

test('can update an item in state', ()=> {
    let store = new AppState({app: {}})
    const obj1 = {color: 'red', length: 23}
    store = store.update('app.page1.description', obj1)
    expect(store.select('app.page1.description')).toBe(obj1)
    const obj2 = {length: undefined, width: 99}
    store = store.update('app.page1.description', obj2)
    expect(store.select('app.page1.description')).toBe(obj2)
})

test('can update value in state to null', ()=> {
    let store = new AppState({app: {}})
    store = store.update('app.page1.description', {value: 2})
    expect(store.select('app.page1.description')).toStrictEqual({value: 2})
    store = store.update('app.page1.description', {value: null})
    expect(store.select('app.page1.description')).toStrictEqual({value: null})
})

test('can update state and keep other existing objects', ()=> {
    let store = new AppState({app: {}})
    const description = {color: 'red', length: 23}
    store = store.update('app.page1.description', description)
    const page = {title: 'foo'}
    store = store.update('app.page1', page)
    const page1State = store.select('app.page1')
    store = store.update('app.page1.description', {color: 'blue', length: 499})
    const page1StateAfter = store.select('app.page1')
    expect(page1StateAfter).toBe(page1State)
})

test('can set state object to a primitive', ()=> {
    let store = new AppState({app: {}})
    store = store.update('app.page1.description', 'It is red')
    const newStore = store.update('app.page1.description', 'It is blue')

    expect(newStore.select('app.page1.description')).toBe('It is blue')
})

test('can update state and whole state is the same if nothing changed', ()=> {
    let store = new AppState({app: {}})
    const obj = {color: 'red', length: 23}
    store = store.update('app.page1.description', obj)
    const newStore = store.update('app.page1.description', obj)

    expect(newStore).toBe(store)
})

test('can update state and state changes if update is same values but different object', ()=> {
    let store = new AppState({app: {}})
    const obj = {color: 'red', length: 23}
    store = store.update('app.page1.description', obj)
    const newStore = store.update('app.page1.description', {color: 'red', length: 23})

    expect(newStore).not.toBe(store)
})

test('can update primitive value state', ()=> {
    let store = new AppState({app: {}})
    store = store.update('app.page1.description', 'It is red')
    const obj = {color: 'red'}
    const newStore = store.update('app.page1.description', obj)
    expect(newStore.select('app.page1.description')).toBe(obj)
})

