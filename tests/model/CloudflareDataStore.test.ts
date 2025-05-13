import {expect, test} from "vitest"
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON} from '../testutil/testHelpers'
import CloudflareDataStore from '../../src/model/CloudflareDataStore'

test('CloudflareDataStore has correct properties with default values', ()=> {
    const store1 = new CloudflareDataStore('id1', 'CloudflareDataStore 1', {
        collections: `Widgets: user-private\nSprockets: Sales,Warehouse`
    })

    expect(store1.id).toBe('id1')
    expect(store1.kind).toBe('CloudflareDataStore')
    expect(store1.name).toBe('CloudflareDataStore 1')
    expect(store1.collections).toBe(`Widgets: user-private\nSprockets: Sales,Warehouse`)
})

test('tests if an object is this type', ()=> {
    const store = new CloudflareDataStore('id1', 'CloudflareDataStore 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(CloudflareDataStore.is(store)).toBe(true)
    expect(CloudflareDataStore.is(page)).toBe(false)
})

test('converts to JSON and back', ()=> {
    const store = new CloudflareDataStore('id1', 'CloudflareDataStore 1', {})
    const plainObj = asJSON(store)
    const newDataStore = loadJSON(plainObj)
    expect(newDataStore).toStrictEqual<CloudflareDataStore>(store)
})
