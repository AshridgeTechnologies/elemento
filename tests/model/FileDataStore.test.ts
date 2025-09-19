import {expect, test} from "vitest"
import {Page, FileDataStore} from '../testutil/modelHelpers'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

test('FileDataStore has correct properties with default values', ()=> {
    const store1 = new FileDataStore('id1', 'FileDataStore 1', {})

    expect(store1.id).toBe('id1')
    expect(store1.name).toBe('FileDataStore 1')
})

test('tests if an object is this type', ()=> {
    const store = new FileDataStore('id1', 'FileDataStore 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(FileDataStore.is(store)).toBe(true)
    expect(FileDataStore.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const store = new FileDataStore('id1', 'FileDataStore 1', {})
    const updatedInFileDataStore1 = store.set('id1', 'name', 'FileDataStore 1A')
    expect(updatedInFileDataStore1.name).toBe('FileDataStore 1A')
    expect(store.name).toBe('FileDataStore 1')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const store = new FileDataStore('id1', 'FileDataStore 1', {})
    const updatedInFileDataStore = store.set('id2', 'name', ex`FileDataStore 1A`)
    expect(updatedInFileDataStore).toStrictEqual(store)
})

test('converts to JSON without optional proerties', ()=> {
    const store = new FileDataStore('id1', 'FileDataStore 1', {})
    expect(asJSON(store)).toStrictEqual({
        kind: 'FileDataStore',
        id: 'id1',
        name: 'FileDataStore 1',
        properties: store.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const store = new FileDataStore('id1', 'FileDataStore 1', {})
    expect(asJSON(store)).toStrictEqual({
        kind: 'FileDataStore',
        id: 'id1',
        name: 'FileDataStore 1',
        properties: store.properties
    })
})

test('converts from plain object', ()=> {
    const store = new FileDataStore('id1', 'FileDataStore 1', {})
    const plainObj = asJSON(store)
    const newInFileDataStore = loadJSON(plainObj)
    expect(newInFileDataStore).toStrictEqual<typeof FileDataStore>(store)

    const store2 = new FileDataStore('id1', 'FileDataStore 2', {})
    const plainObj2 = asJSON(store2)
    const newInFileDataStore2 = loadJSON(plainObj2)
    expect(newInFileDataStore2).toStrictEqual<typeof FileDataStore>(store2)
})
