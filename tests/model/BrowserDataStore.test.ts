import BrowserDataStore from '../../src/model/BrowserDataStore'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON} from '../testutil/testHelpers'

test('BrowserDataStore has correct properties with default values', ()=> {
    const store1 = new BrowserDataStore('id1', 'BrowserDataStore 1', {})

    expect(store1.id).toBe('id1')
    expect(store1.kind).toBe('BrowserDataStore')
    expect(store1.name).toBe('BrowserDataStore 1')
})

test('tests if an object is this type', ()=> {
    const store = new BrowserDataStore('id1', 'BrowserDataStore 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(BrowserDataStore.is(store)).toBe(true)
    expect(BrowserDataStore.is(page)).toBe(false)
})

test('converts to JSON and back', ()=> {
    const store = new BrowserDataStore('id1', 'BrowserDataStore 1', {})
    const plainObj = asJSON(store)
    const newInBrowserDataStore = loadJSON(plainObj)
    expect(newInBrowserDataStore).toStrictEqual<BrowserDataStore>(store)
})
