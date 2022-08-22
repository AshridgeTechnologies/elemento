import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON} from '../testutil/testHelpers'
import FirestoreDataStore from '../../src/model/FirestoreDataStore'

test('FirestoreDataStore has correct properties with default values', ()=> {
    const store1 = new FirestoreDataStore('id1', 'FirestoreDataStore 1', {
        collectionSecurity: `Widgets: user-private\nSprockets: Sales,Warehouse`
    })

    expect(store1.id).toBe('id1')
    expect(store1.kind).toBe('FirestoreDataStore')
    expect(store1.name).toBe('FirestoreDataStore 1')
    expect(store1.collectionSecurity).toBe(`Widgets: user-private\nSprockets: Sales,Warehouse`)
})

test('tests if an object is this type', ()=> {
    const store = new FirestoreDataStore('id1', 'FirestoreDataStore 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(FirestoreDataStore.is(store)).toBe(true)
    expect(FirestoreDataStore.is(page)).toBe(false)
})

test('converts to JSON and back', ()=> {
    const store = new FirestoreDataStore('id1', 'FirestoreDataStore 1', {})
    const plainObj = asJSON(store)
    const newInBrowserDataStore = loadJSON(plainObj)
    expect(newInBrowserDataStore).toStrictEqual<FirestoreDataStore>(store)
})
