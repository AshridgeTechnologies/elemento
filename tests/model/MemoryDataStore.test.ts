import {expect, test} from "vitest"
import {MemoryDataStore} from '../testutil/modelHelpers'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

test('MemoryDataStore has correct properties with default values', ()=> {
    const store1 = new MemoryDataStore('id1', 'MemoryDataStore 1', {})

    expect(store1.id).toBe('id1')
    expect(store1.name).toBe('MemoryDataStore 1')
    expect(store1.initialValue).toBe(undefined)
    expect(store1.display).toBe(false)
})

test('MemoryDataStore has correct properties with specified values', ()=> {
    const store1 = new MemoryDataStore('id1', 'MemoryDataStore 1', {initialValue: ex`{ Widgets: { w1: {a: 10}} }`, display: true})

    expect(store1.id).toBe('id1')
    expect(store1.name).toBe('MemoryDataStore 1')
    expect(store1.initialValue).toStrictEqual( ex`{ Widgets: { w1: {a: 10}} }`)
    expect(store1.display).toBe(true)
})

test('tests if an object is this type', ()=> {
    const store = new MemoryDataStore('id1', 'MemoryDataStore 1', {initialValue: ex`{ Widgets: { w1: {a: 10}} }`})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(MemoryDataStore.is(store)).toBe(true)
    expect(MemoryDataStore.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const store = new MemoryDataStore('id1', 'MemoryDataStore 1', {initialValue: ex`{ Widgets: { w1: {a: 10}} }`, display: true})
    const updatedInMemoryDataStore1 = store.set('id1', 'name', 'MemoryDataStore 1A')
    expect(updatedInMemoryDataStore1.name).toBe('MemoryDataStore 1A')
    expect(updatedInMemoryDataStore1.initialValue).toStrictEqual(ex`{ Widgets: { w1: {a: 10}} }`)
    expect(store.name).toBe('MemoryDataStore 1')
    expect(store.initialValue).toStrictEqual(ex`{ Widgets: { w1: {a: 10}} }`)

    const updatedInMemoryDataStore2 = updatedInMemoryDataStore1.set('id1', 'initialValue', ex`shazam`)
    expect(updatedInMemoryDataStore2.name).toBe('MemoryDataStore 1A')
    expect(updatedInMemoryDataStore2.initialValue).toStrictEqual(ex`shazam`)
    expect(updatedInMemoryDataStore1.name).toBe('MemoryDataStore 1A')
    expect(updatedInMemoryDataStore1.initialValue).toStrictEqual(ex`{ Widgets: { w1: {a: 10}} }`)
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const store = new MemoryDataStore('id1', 'MemoryDataStore 1', {initialValue: ex`{ Widgets: { w1: {a: 10}} }`})
    const updatedInMemoryDataStore = store.set('id2', 'name', ex`MemoryDataStore 1A`)
    expect(updatedInMemoryDataStore).toStrictEqual(store)
})

test('converts to JSON without optional proerties', ()=> {
    const store = new MemoryDataStore('id1', 'MemoryDataStore 1', {})
    expect(asJSON(store)).toStrictEqual({
        kind: 'MemoryDataStore',
        id: 'id1',
        name: 'MemoryDataStore 1',
        properties: store.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const store = new MemoryDataStore('id1', 'MemoryDataStore 1', {initialValue: ex`{ Widgets: { w1: {a: 10}} }`, display: true})
    expect(asJSON(store)).toStrictEqual({
        kind: 'MemoryDataStore',
        id: 'id1',
        name: 'MemoryDataStore 1',
        properties: store.properties
    })
})

test('converts from plain object', ()=> {
    const store = new MemoryDataStore('id1', 'MemoryDataStore 1', {initialValue: ex`{ Widgets: { w1: {a: 10}} }`, display: ex`false && true`})
    const plainObj = asJSON(store)
    const newInMemoryDataStore = loadJSON(plainObj)
    expect(newInMemoryDataStore).toStrictEqual<typeof MemoryDataStore>(store)

    const store2 = new MemoryDataStore('id1', 'MemoryDataStore 2', {display: false})
    const plainObj2 = asJSON(store2)
    const newInMemoryDataStore2 = loadJSON(plainObj2)
    expect(newInMemoryDataStore2).toStrictEqual<typeof MemoryDataStore>(store2)
})
