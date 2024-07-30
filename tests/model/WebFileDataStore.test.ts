import WebFileDataStore from '../../src/model/WebFileDataStore'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

test('WebFileDataStore has correct properties with default values', ()=> {
    const store1 = new WebFileDataStore('id1', 'WebFileDataStore 1', {})

    expect(store1.id).toBe('id1')
    expect(store1.name).toBe('WebFileDataStore 1')
    expect(store1.url).toBe(undefined)
})

test('WebFileDataStore has correct properties with given values', ()=> {
    const store1 = new WebFileDataStore('id1', 'WebFileDataStore 1', {url: 'https://example.com/data'})
    expect(store1.url).toBe('https://example.com/data')
})

test('tests if an object is this type', ()=> {
    const store = new WebFileDataStore('id1', 'WebFileDataStore 1', {url: 'https://example.com/data'})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(WebFileDataStore.is(store)).toBe(true)
    expect(WebFileDataStore.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const store = new WebFileDataStore('id1', 'WebFileDataStore 1', {url: 'https://example.com/data'})
    const updatedInFileDataStore1 = store.set('id1', 'name', 'WebFileDataStore 1A')
    expect(updatedInFileDataStore1.name).toBe('WebFileDataStore 1A')
    expect(store.name).toBe('WebFileDataStore 1')
})

test('converts to JSON', ()=> {
    const store = new WebFileDataStore('id1', 'WebFileDataStore 1', {url: 'https://example.com/data'})
    expect(asJSON(store)).toStrictEqual({
        kind: 'WebFileDataStore',
        id: 'id1',
        name: 'WebFileDataStore 1',
        properties: store.properties
    })
})

test('converts from plain object', ()=> {
    const store = new WebFileDataStore('id1', 'WebFileDataStore 1', {url: 'https://example.com/data'})
    const plainObj = asJSON(store)
    const newInFileDataStore = loadJSON(plainObj)
    expect(newInFileDataStore).toStrictEqual<WebFileDataStore>(store)

    const store2 = new WebFileDataStore('id1', 'WebFileDataStore 2', {url: 'https://example.com/data'})
    const plainObj2 = asJSON(store2)
    const newInFileDataStore2 = loadJSON(plainObj2)
    expect(newInFileDataStore2).toStrictEqual<WebFileDataStore>(store2)
})
