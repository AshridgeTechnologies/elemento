import {afterAll, beforeAll, describe, expect, test, vi} from "vitest"
import TinyBaseDataStoreImpl from '../../../src/runtime/components/TinyBaseDataStoreImpl'
import {unstable_startWorker} from 'wrangler'
import {wait, waitUntil} from '../../testutil/testHelpers'
import {matches} from 'lodash'
import DataStore, {Add, InvalidateAll} from '../../../src/runtime/DataStore'

const syncServer = 'localhost:9090/do/'

let worker: any

function newId() {
    return 'id_' + Date.now()
}

const callStore = (dbName: string, func: string, ...args: any[]) => {
    return worker.fetch(`http://example.com/call/tinybase_store/${dbName}/${func}`, {
        method: 'POST',
        body: JSON.stringify(args),
    }).then( (resp: Response) => resp.json() ).then( (result: any) => {
        if (result.error) throw new Error(result.error)
        return result.data
    })
}

beforeAll(async () => {
    worker = await unstable_startWorker({ config: 'tests/wrangler.jsonc',
        dev: {server: {port: 9090}}});
    await Promise.all(['db1', 'db2', 'db3'].map(dbName => callStore(dbName, 'test_clear', 'Widgets') ))
    console.log('Cleared databases')
    await wait(200)
})

afterAll(async () => {
    await worker.dispose();
})

describe('sync via server', () => {
    const collectionName = 'Widgets'
    const debugSync = false

    test('sync local with existing data', async () => {
        const id = newId()
        const item = {a:10, b:'foo'}
        await callStore('db1', 'add', collectionName, id, item)

        const store1 = new TinyBaseDataStoreImpl({databaseName: 'db1', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer, debugSync})
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id)), 100, 2000)
        await checkWidget({id, ...item})

        await callStore('db1', 'update', collectionName, id, {b: 'bar'})
        await checkWidget({id, ...item, b: 'bar'})
    })

    test('local receives update when change on server', async () => {
        const id = newId()
        const item = {a:10, b:'foo'}
        const store1 = new TinyBaseDataStoreImpl({databaseName: 'db1', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer, debugSync})
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id)), 100, 2000)

        await callStore('db1', 'add', collectionName, id, item)
        await checkWidget({id, ...item})

        await callStore('db1', 'update', collectionName, id, {b: 'bar'})
        await checkWidget({id, ...item, b: 'bar'})
    })

    test('can subscribe to changes', async () => {
        const id = newId()
        const item = {a:10, b:'foo'}
        const store1 = await new TinyBaseDataStoreImpl({databaseName: 'db1', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer, debugSync}).init()
        const onNextWidgets = vi.fn()
        store1.observable('Widgets').subscribe(onNextWidgets)
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id)), 100, 2000)

        await wait(100)
        expect(onNextWidgets).toHaveBeenLastCalledWith({collection: 'Widgets', type: InvalidateAll})
        expect(onNextWidgets).toHaveBeenCalledTimes(1)
        await callStore('db1', 'add', collectionName, id, item)
        await wait(500)
        await checkWidget({id, ...item})
        expect(onNextWidgets).toHaveBeenNthCalledWith(2, {collection: 'Widgets', type: Add, id, changes: {id, ...item}})

        await callStore('db1', 'update', collectionName, id, {b: 'bar'})
        await checkWidget({id, ...item, b: 'bar'})
    })

    test('only synchronizes with stores with correct database name', async () => {
        const id = newId()
        const item = {a:10, b:'foo'}
        const store1 = new TinyBaseDataStoreImpl({databaseName: 'db1', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer, debugSync})
        const store2 = new TinyBaseDataStoreImpl({databaseName: 'db2', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer, debugSync})
        const checkWidget = (store: any, expected: object) => waitUntil(async ()=> matches(expected)(await store.getById('Widgets', id)), 100, 2000)

        await callStore('db1', 'add', collectionName, id, item)
        await checkWidget(store1, {id, ...item})
        await wait(500)
        await expect(store2.getById('Widgets', id, true)).resolves.toBe(null)
    })

    test('synchronizes with two stores with same database name', async () => {
        const id = newId()
        console.log('id', id)
        const item = {a:10, b:'foo'}
        const store1 = await new TinyBaseDataStoreImpl({databaseName: 'db1', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer, debugSync}).init()
        const store2 = await new TinyBaseDataStoreImpl({databaseName: 'db1', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer, debugSync}).init()
        const checkWidget = (store: DataStore, expected: object) => waitUntil(async ()=> matches(expected)(await store.getById('Widgets', id, true)), 100, 2000)

        await wait(2000)
        console.log('add about to send')
        await callStore('db1', 'add', collectionName, id, item)
        console.log('add done')
        await wait(2000)
        await checkWidget(store1, {id, ...item})
        await checkWidget(store2, {id, ...item})
        await wait(2000)
    }, 20000)

})
