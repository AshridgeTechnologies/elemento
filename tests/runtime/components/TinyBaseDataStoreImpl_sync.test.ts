import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, MockedFunction, test, vi} from "vitest"
import TinyBaseDataStoreImpl, {type Properties as DataStoreProperties} from '../../../src/runtime/components/TinyBaseDataStoreImpl'
import {unstable_startWorker} from 'wrangler'
import {testAppInterface, wait, waitUntil} from '../../testutil/testHelpers'
import {matches} from 'lodash'
import DataStore, {Add, InvalidateAll} from '../../../src/shared/DataStore'
import jwtEncode from 'jwt-encode'
import * as authentication from '../../../src/runtime/components/authentication'
import {TinyBaseDataStoreState} from '../../../src/runtime/components/TinyBaseDataStore'
vi.mock('../../../src/runtime/components/authentication')

const mock_getIdToken = authentication.getIdToken as MockedFunction<any>
const mock_onAuthChange = authentication.onAuthChange as MockedFunction<any>

const mockLocalStorage = () => {
    let store = {} as Storage;

    return {
        getItem(key: string) {
            return store[key];
        },

        setItem(key: string, value: string) {
            store[key] = value;
        },

        removeItem(key: string) {
            delete store[key];
        },

        clear() {
            store = {} as Storage;
        },
    };
}

globalThis.localStorage = mockLocalStorage() as Storage

const tokenFor = (userId: string) => jwtEncode({
    type: 'user',
    properties: {
        id: userId,
        email: "a@b.com",
        name: ""
    },
    sub: 'user:' + userId,
    iat: 1516239022
}, 'our-secret')
const authToken = tokenFor('user99')
mock_getIdToken.mockResolvedValue(authToken)

const item = {a:10, b:'foo'}
const collectionName = 'Widgets'
let idSeq = 1000
const newId = () => 'id_' + (++idSeq)
let id: string

const callStoreFn = (worker: any) => (dbTypeName: string, dbName: string, func: string, ...args: any[]) => {
    return worker.fetch(`http://example.com/call/${dbTypeName}/${dbName}/${func}`, {
        method: 'POST',
        body: JSON.stringify(args),
    }).then( (resp: Response) => resp.json() ).then( (result: any) => {
        if (result.error) throw new Error(result.error)
        return result.data
    })
}
const startWorker = async (port: number, dbType: string) => {
    const worker = await unstable_startWorker({ config: 'tests/wrangler.jsonc', dev: {server: {port}, logLevel: 'log'}});
    await Promise.all(['db1', 'db2', 'db3'].map(dbName => callStoreFn(worker)(dbType, dbName, 'test_clear', 'Widgets') ))
    console.log('Cleared databases')
    await wait(1000)
    return worker
}

beforeEach(()=> id = newId())

describe('sync via server - authorized sync', () => {
    const port = 9501
    const syncServer = `localhost:${port}/do/`
    const dbType = 'TinyBaseDurableObject_A'
    const debugSync = false
    const createStore = (props: object = {})=> new TinyBaseDataStoreImpl({ databaseTypeName: dbType,  databaseInstanceName: 'db1', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer, ...props})

    let worker: any
    let store1: TinyBaseDataStoreImpl, store2: TinyBaseDataStoreImpl
    let callStore: any

    beforeAll(async () => {
        worker = await startWorker(port, dbType)
        callStore = callStoreFn(worker)
    })

    afterAll(async () => {
        await worker.dispose();
    })

    afterEach(async ()=> {
        await store1?.close()
        await store2?.close()
        // @ts-ignore
        store1 = store2 = undefined
    })

    test('call store works', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        const storedItem = await callStore(dbType, 'db1', 'getById', collectionName, id)
        expect(storedItem).toEqual({id, ...item})
    })

    test('sync local with existing data', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)

        store1 = await createStore().init()
        expect(store1.isReadWrite).toBe(false)
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id, true)), 100, 2000)
        await checkWidget({id, ...item})

        await callStore(dbType, 'db1', 'update', collectionName, id, {b: 'bar'})
        await checkWidget({id, ...item, b: 'bar'})
    })

    test('local receives update when change on server', async () => {
        store1 = createStore()
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id)), 100, 2000)

        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        await checkWidget({id, ...item})

        await callStore(dbType, 'db1', 'update', collectionName, id, {b: 'bar'})
        await checkWidget({id, ...item, b: 'bar'})
    })

    test('server ignores illegal changes on client', async () => {
        store1 = createStore()
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id)), 100, 2000)

        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        await checkWidget({id, ...item})

        // @ts-ignore
        store1.theDb.setCell(collectionName, id, 'json_data', JSON.stringify({id, ...item, b: 'bar'}))
        await expect(await store1.getById(collectionName, id)).toStrictEqual({id, ...item, b: 'bar'})  // will be updated on client
        console.log('Client update done')
        await wait(200)

        const itemOnServer = await callStore(dbType, 'db1', 'getById', collectionName, id)
        expect(itemOnServer).toStrictEqual({id, ...item})  // not updated on server
    })

    test('can subscribe to changes', async () => {
        store1 = await createStore().init()
        await wait(100)
        const onNextWidgets = vi.fn()
        store1.observable('Widgets').subscribe(onNextWidgets)
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id)), 100, 2000)

        await wait(500)
        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        await wait(500)
        await checkWidget({id, ...item})
        expect(onNextWidgets).toHaveBeenNthCalledWith(1, {collection: 'Widgets', type: Add, id, changes: {id, ...item}})

        await callStore(dbType, 'db1', 'update', collectionName, id, {b: 'bar'})
        await checkWidget({id, ...item, b: 'bar'})
    })

    // Note: this test checks for some incorrect update behaviour, but does not detect others that only show in a real browser
    test('does not send multiple change notifications after auth change', async () => {
        let onAuthChangeCallback: any
        mock_onAuthChange.mockImplementationOnce( (cb: any) => onAuthChangeCallback = cb)

        store1 = await createStore({persist: true}).init()
        await wait(100)
        const onNextWidgets = vi.fn()
        store1.observable('Widgets').subscribe(onNextWidgets)

        onAuthChangeCallback()
        await wait(1000)
        expect(onNextWidgets).toHaveBeenCalledTimes(1)
        expect(onNextWidgets).toHaveBeenLastCalledWith({collection: 'Widgets', type: InvalidateAll})

        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        await wait(1000)
        expect(onNextWidgets).toHaveBeenCalledTimes(2)
        expect(onNextWidgets).toHaveBeenLastCalledWith({collection: 'Widgets', type: Add, id, changes: {id, ...item}})
    }, 10000)

    test('only synchronizes with stores with correct database name', async () => {
        store1 = createStore()
        store2 = createStore({databaseInstanceName: 'db2'})
        const checkWidget = (store: any, expected: object) => waitUntil(async ()=> matches(expected)(await store.getById('Widgets', id, true)), 100, 2000)

        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        await checkWidget(store1, {id, ...item})
        await wait(500)
        await expect(store2.getById('Widgets', id, true)).resolves.toBe(null)
    })

    test('synchronizes with two stores with same database name', async () => {
        console.log('id', id)
        store1 = await createStore().init()
        store2 = await createStore().init()
        const checkWidget = (store: DataStore, expected: object) => waitUntil(async ()=> matches(expected)(await store.getById('Widgets', id, true)), 100, 2000)

        await wait(200)
        console.log('add about to send')
        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        console.log('add done')
        await wait(200)
        await checkWidget(store1, {id, ...item})
        await checkWidget(store2, {id, ...item})
        await wait(200)
    })

    test('synchronizes with two stores with same database name but different userIds', async () => {
        const id1 = newId()
        const id2 = newId()
        const userId1 = 'user1'
        const userId2 = 'user2'
        const authToken1 = tokenFor('user1')
        const authToken2 = tokenFor('user2')
        mock_getIdToken.mockResolvedValueOnce(authToken1)
                        .mockResolvedValueOnce(authToken2)

        console.log('id1', id1, 'id2', id2)
        const item1 = {id: id1, userId: userId1, a:10, b:'foo'}
        const item2 = {id: id2, userId: userId2, a:20, b:'bar'}
        store1 = await createStore().init()
        store2 = await createStore().init()
        const checkWidget = (store: DataStore, id: string, expected: object) => waitUntil(async ()=> matches(expected)(await store.getById('Widgets', id, true)), 100, 2000)

        await wait(200)
        await callStore(dbType, 'db1', 'addAll', collectionName, {[id1]: item1, [id2]: item2})
        await wait(200)
        console.log('item1 retrieved', await store1.getById('Widgets', id1, true))
        await checkWidget(store1, id1, item1)
        await checkWidget(store2, id2, item2)
        await expect(store1.getById('Widgets', id2, true)).resolves.toBeNull()
        await expect(store2.getById('Widgets', id1, true)).resolves.toBeNull()
    })

    test('rejects sync if not logged in', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)

        mock_getIdToken.mockResolvedValueOnce(null)
        store1 = await createStore().init()
        await wait(500)
        expect(await store1.getById('Widgets', id, true)).toBe(null)
    })

    test('rejects sync if not authorized', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)

        mock_getIdToken.mockResolvedValueOnce(tokenFor('bad_user'))
        store1 = await createStore().init()
        await wait(500)
        expect(await store1.getById('Widgets', id, true)).toBe(null)
    })
})

describe('sync via server - full sync', () => {
    const port = 9502
    const syncServer = `localhost:${port}/do/`
    const dbType = 'TinyBaseDurableObject_Full'
    const debugSync = false
    const createStore = (databaseName = 'db1')=> new TinyBaseDataStoreImpl({ databaseTypeName: dbType,  databaseInstanceName: databaseName, collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer})

    let worker: any
    let store1: TinyBaseDataStoreImpl, store2: TinyBaseDataStoreImpl
    let callStore: any

    beforeAll(async () => {
        worker = await startWorker(port, dbType)
        callStore = callStoreFn(worker)
    })

    afterAll(async () => {
        try {
            await worker.dispose();
        } catch (e) {
            console.error('Error in worker.dispose',e)
        }
    })
    
    afterEach(async ()=> {
        await store1?.close()
        await store2?.close()
        // @ts-ignore
        store1 = store2 = undefined
    })

    test('call store works', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        const storedItem = await callStore(dbType, 'db1', 'getById', collectionName, id)
        expect(storedItem).toEqual({id, ...item})
    })

    test('init is not called more than once', async () => {
        mock_onAuthChange.mockClear()
        store1 = createStore()
        store1.init()
        store1.init()
        await wait(100)

        expect(mock_onAuthChange).toHaveBeenCalledTimes(1)
    })

    test('init returns promise that resolves when store is ready', async () => {
        store1 = createStore()
        store1.getById(collectionName, '123', true)
        store1.getById(collectionName, '567', true)
        await wait(100)
    })

    test('sync local with existing data', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)

        store1 = await createStore().init()
        expect(store1.isReadWrite).toBe(true)
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById(collectionName, id, true)), 100, 2000)
        await checkWidget({id, ...item})

        await callStore(dbType, 'db1', 'update', collectionName, id, {b: 'bar'})
        await checkWidget({id, ...item, b: 'bar'})
    })

    test('sync local with existing data if readonly', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)

        mock_getIdToken.mockResolvedValueOnce(tokenFor('readonly_user'))
        store1 = await createStore().init()
        expect(store1.isReadWrite).toBe(false)
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id, true)), 100, 2000)
        await checkWidget({id, ...item})

        await callStore(dbType, 'db1', 'update', collectionName, id, {b: 'bar'})
        await checkWidget({id, ...item, b: 'bar'})
    })

    test('local receives update when change on server', async () => {
        store1 = createStore()
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id)), 100, 2000)

        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        await checkWidget({id, ...item})

        await callStore(dbType, 'db1', 'update', collectionName, id, {b: 'bar'})
        await checkWidget({id, ...item, b: 'bar'})
    })

    test('server syncs changes on client', async () => {
        store1 = createStore()
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id)), 100, 2000)

        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        await checkWidget({id, ...item})
        await wait(1000)  // ensure synchronization gets changes in correct time sequence

        const updatedItem = {id, ...item, b: 'bar'}
        console.log('Client update starting')
        // @ts-ignore
        store1.theDb.setCell(collectionName, id, 'json_data', JSON.stringify(updatedItem))
        await expect(await store1.getById(collectionName, id)).toStrictEqual(updatedItem)  // will be updated on client
        console.log('Client update done')

        await expect(await store1.getById(collectionName, id)).toStrictEqual(updatedItem)  // will (still) be updated on client
        const itemOnServer = await callStore(dbType, 'db1', 'getById', collectionName, id)
        expect(itemOnServer).toStrictEqual(updatedItem)  // updated on server
    })

    test('server syncs changes between two clients if init after create store', async () => {
        store1 = createStore()
        store2 = createStore()
        await store1.init()
        await store2.init()
        const checkWidget = (store: any, expected: object) => waitUntil(async ()=> matches(expected)(await store.getById('Widgets', id, true)), 100, 2000)

        await store1.add('Widgets', id, item)
        await checkWidget(store2, {id, ...item})

        await store2.update('Widgets', id, {b: 'bar'})
        await checkWidget(store1, {id, ...item, b: 'bar'})
    })

    test('add on client is synced to server database', async () => {
        store1 = createStore()
        await store1.init()
        const checkWidget = (store: any, expected: object) => waitUntil(async ()=> matches(expected)(await store.getById('Widgets', id, true)), 100, 2000)

        await store1.add('Widgets', id, item)
        await checkWidget(store1, {id, ...item})

        await wait(500)
        const itemOnServer = await callStore(dbType, 'db1', 'getById', collectionName, id, true)
        expect(itemOnServer).toStrictEqual({id, ...item})  // added on server
    })

    test('can subscribe to changes', async () => {
        store1 = await createStore().init()
        await wait(100)
        const onNextWidgets = vi.fn()
        store1.observable('Widgets').subscribe(onNextWidgets)
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id)), 100, 2000)

        await wait(500)
        // expect(onNextWidgets).toHaveBeenLastCalledWith({collection: 'Widgets', type: InvalidateAll})
        // expect(onNextWidgets).toHaveBeenCalledTimes(1)
        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        await wait(500)
        await checkWidget({id, ...item})
        expect(onNextWidgets).toHaveBeenNthCalledWith(1, {collection: 'Widgets', type: Add, id, changes: {id, ...item}})

        await callStore(dbType, 'db1', 'update', collectionName, id, {b: 'bar'})
        await checkWidget({id, ...item, b: 'bar'})
    })

    test('only synchronizes with stores with correct database name', async () => {
        store1 = createStore()
        store2 = createStore('db2')
        const checkWidget = (store: any, expected: object) => waitUntil(async ()=> matches(expected)(await store.getById('Widgets', id, true)), 100, 2000)

        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        await checkWidget(store1, {id, ...item})
        await wait(500)
        await expect(store2.getById('Widgets', id, true)).resolves.toBe(null)
    })

    test('synchronizes with two stores with same database name', async () => {
        console.log('id', id)
        store1 = await createStore().init()
        store2 = await createStore().init()
        const checkWidget = (store: DataStore, expected: object) => waitUntil(async ()=> matches(expected)(await store.getById('Widgets', id, true)), 100, 2000)

        await wait(200)
        console.log('add about to send')
        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        console.log('add done')
        await wait(200)
        await checkWidget(store1, {id, ...item})
        await checkWidget(store2, {id, ...item})
        await wait(200)
    })

    test('synchronizes with two stores with same database name but different userIds', async () => {
        const id1 = newId()
        const id2 = newId()
        const userId1 = 'user1'
        const userId2 = 'user2'
        const authToken1 = tokenFor('user1')
        const authToken2 = tokenFor('user2')
        mock_getIdToken.mockResolvedValueOnce(authToken1)
                        .mockResolvedValueOnce(authToken2)

        console.log('id1', id1, 'id2', id2)
        const item1 = {id: id1, userId: userId1, a:10, b:'foo'}
        const item2 = {id: id2, userId: userId2, a:20, b:'bar'}
        store1 = await createStore().init()
        store2 = await createStore().init()
        const checkWidget = (store: DataStore, id: string, expected: object) => waitUntil(async ()=> matches(expected)(await store.getById('Widgets', id, true)), 100, 2000)

        await wait(200)
        await callStore(dbType, 'db1', 'addAll', collectionName, {[id1]: item1, [id2]: item2})
        await wait(200)
        console.log('item1 retrieved', await store1.getById('Widgets', id1, true))
        await checkWidget(store1, id1, item1)
        await checkWidget(store1, id2, item2)
        await checkWidget(store2, id1, item1)
        await checkWidget(store2, id2, item2)
    })

    test('rejects sync if not logged in', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)

        mock_getIdToken.mockResolvedValueOnce(null)
        store1 = await createStore().init()
        await wait(500)
        expect(await store1.getById('Widgets', id, true)).toBe(null)
    })

    test('rejects sync if not authorized', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)

        mock_getIdToken.mockResolvedValueOnce(tokenFor('bad_user'))
        store1 = await createStore().init()
        await wait(500)
        expect(await store1.getById('Widgets', id, true)).toBe(null)
    })

    test('does sync without login if authorized', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)

        mock_getIdToken.mockResolvedValueOnce(tokenFor('bad_user'))
        store1 = await createStore().init()
        await wait(500)
        expect(await store1.getById('Widgets', id, true)).toBe(null)
    })

    test('updates data and notifies when login without observers', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        let onAuthChangeCallback: any
        mock_onAuthChange.mockImplementationOnce( (cb: any) => onAuthChangeCallback = cb)

        mock_getIdToken.mockResolvedValueOnce(null)
        store1 = await createStore().init()
        await wait(500)
        expect(await store1.getById('Widgets', id, true)).toBe(null)

        mock_getIdToken.mockResolvedValueOnce(tokenFor('readonly_user'))
        onAuthChangeCallback()

        await wait(500)
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id)), 100, 2000)
        await checkWidget({id, ...item})
    })

    test('updates data and notifies observers when login', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        let onAuthChangeCallback: any
        mock_onAuthChange.mockImplementationOnce( (cb: any) => onAuthChangeCallback = cb)

        mock_getIdToken.mockResolvedValueOnce(null)
        store1 = await createStore().init()
        await wait(500)
        expect(await store1.getById('Widgets', id, true)).toBe(null)

        const onChange = vi.fn()
        store1.observable('Widgets').subscribe(onChange)
        mock_getIdToken.mockResolvedValueOnce(tokenFor('readonly_user'))
        onAuthChangeCallback()

        await wait(500)
        expect(onChange).toHaveBeenCalledWith({collection: 'Widgets', type: 'InvalidateAll'})
    })

    test('updates data and notifies observers when logout', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        let onAuthChangeCallback: any
        mock_onAuthChange.mockImplementationOnce( (cb: any) => onAuthChangeCallback = cb)

        mock_getIdToken.mockResolvedValueOnce(tokenFor('readonly_user'))
        store1 = await createStore().init()
        const onChange = vi.fn()
        store1.observable('Widgets').subscribe(onChange)
        await wait(500)
        expect(await store1.getById('Widgets', id, true)).toEqual({id, ...item})

        mock_getIdToken.mockResolvedValueOnce(null)
        onAuthChangeCallback()

        expect(onChange).toHaveBeenCalledWith({collection: 'Widgets', type: 'InvalidateAll'})
        await waitUntil(async ()=> (await store1.getById('Widgets', id, true)) === null, 100, 2000)
    })

    test('server ignores illegal changes on client if readonly', async () => {
        mock_getIdToken.mockResolvedValueOnce(tokenFor('readonly_user'))
        store1 = await createStore().init()
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id)), 100, 2000)

        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        await wait(1000)
        await checkWidget({id, ...item})

        // @ts-ignore
        store1.theDb.setCell(collectionName, id, 'json_data', JSON.stringify({id, ...item, b: 'bar'}))
        await expect(await store1.getById(collectionName, id)).toStrictEqual({id, ...item, b: 'bar'})  // will be updated on client
        console.log('Client update done')
        await wait(200)

        const itemOnServer = await callStore(dbType, 'db1', 'getById', collectionName, id)
        expect(itemOnServer).toStrictEqual({id, ...item})  // not updated on server
    })

    test('client warns for illegal changes', async () => {
        mock_getIdToken.mockResolvedValueOnce(tokenFor('readonly_user'))
        store1 = await createStore().init()
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id)), 100, 2000)

        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        await wait(1000)
        await checkWidget({id, ...item})

        await expect(store1.update(collectionName, id, {b: 'bar'})).rejects.toHaveProperty('message', `Read only access`)
        await expect(await store1.getById(collectionName, id)).toStrictEqual({id, ...item, b: 'foo'})  // will not be updated on client
        await wait(200)

        const itemOnServer = await callStore(dbType, 'db1', 'getById', collectionName, id)
        expect(itemOnServer).toStrictEqual({id, ...item})  // not updated on server
    })

})

describe('sync via server - auth sync without login', () => {
    const port = 9505
    const syncServer = `localhost:${port}/do/`
    const dbType = 'TinyBaseDurableObject_B'
    const debugSync = false
    const createStore = (databaseName = 'db1') => new TinyBaseDataStoreImpl({
        databaseTypeName: dbType,
        databaseInstanceName: databaseName,
        collections: 'Widgets;Gadgets',
        persist: false,
        sync: true,
        syncServer
    })

    let worker: any
    let store1: TinyBaseDataStoreImpl
    let callStore: any

    beforeAll(async () => {
        worker = await startWorker(port, dbType)
        callStore = callStoreFn(worker)
        mock_getIdToken.mockResolvedValue(null)
    })

    afterAll(async () => {
        try {
            await worker.dispose();
        } catch (e) {
            console.error('Error in worker.dispose', e)
        }
    })

    afterEach(async () => {
        await store1?.close()
        // @ts-ignore
        store1 = undefined
    })

    test('sync local with existing data', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)

        store1 = await createStore().init()
        expect(store1.isReadWrite).toBe(false)
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById(collectionName, id)), 100, 1500)
        await checkWidget({id, ...item})

        await callStore(dbType, 'db1', 'update', collectionName, id, {b: 'bar'})
        await checkWidget({id, ...item, b: 'bar'})
    }, 10000)

})

describe('sync via server - full sync without login', () => {
    const port = 9504
    const syncServer = `localhost:${port}/do/`
    const dbType = 'TinyBaseDurableObject_NoAuth'
    const debugSync = false
    const createStore = (databaseName = 'db1') => new TinyBaseDataStoreImpl({
        databaseTypeName: dbType,
        databaseInstanceName: databaseName,
        collections: 'Widgets;Gadgets',
        persist: false,
        sync: true,
        syncServer
    })

    let worker: any
    let store1: TinyBaseDataStoreImpl
    let callStore: any

    beforeAll(async () => {
        worker = await startWorker(port, dbType)
        callStore = callStoreFn(worker)
        mock_getIdToken.mockResolvedValue(null)
    })

    afterAll(async () => {
        try {
            await worker.dispose();
        } catch (e) {
            console.error('Error in worker.dispose', e)
        }
    })

    afterEach(async () => {
        await store1?.close()
        // @ts-ignore
        store1 = undefined
    })

    test('sync local with existing data', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)

        store1 = await createStore().init()
        expect(store1.isReadWrite).toBe(false)
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById(collectionName, id)), 100, 1500)
        await checkWidget({id, ...item})

        await callStore(dbType, 'db1', 'update', collectionName, id, {b: 'bar'})
        await checkWidget({id, ...item, b: 'bar'})
    }, 10000)

})

describe('through TinyBaseDataStoreState', () => {
    const port = 9507
    const syncServer = `localhost:${port}/do/`
    const dbType = 'TinyBaseDurableObject_ReadWrite'

    let worker: any
    let callStore: any
    let store1: TinyBaseDataStoreImpl

    beforeAll(async () => {
        worker = await startWorker(port, dbType)
        callStore = callStoreFn(worker)
        mock_getIdToken.mockResolvedValue(null)
    })

    afterAll(async () => {
        try {
            await worker.dispose();
        } catch (e) {
            console.error('Error in worker.dispose', e)
        }
    })

    afterEach(async () => {
        await store1?.close()
        // @ts-ignore
        store1 = undefined
    })

    test('saves and retrieves', async () => {
        const storeProps: DataStoreProperties = {
            collections: 'Widgets',
            databaseTypeName: dbType,
            databaseInstanceName: 'db1',
            syncServer,
            sync: true,
        }
        const storeState = new TinyBaseDataStoreState(storeProps)
        const appInterface = testAppInterface('path1', storeState)
        // @ts-ignore
        const dataStore = await(storeState.state.initialisedDataStore)
        expect((dataStore as any).isReadWrite).toBe(true)


        await storeState.add('Widgets', id, item)
        await wait(500)
        const retrievedItem = await storeState.getById(collectionName, id, false)
        expect(retrievedItem).toStrictEqual({id, ...item})
    })

    test('saves and retrieves to new database when instance name changes', async () => {
        const storeProps: DataStoreProperties = {
            collections: 'Widgets',
            databaseTypeName: dbType,
            databaseInstanceName: 'db1',
            syncServer,
            sync: true,
        }

        const localItem = (store: TinyBaseDataStoreState, id: string) => store.getById(collectionName, id, true)
        const serverItem = (dbName: string, id: string) => callStore(dbType, dbName, 'getById', collectionName, id, true)

        const storePropsDb2 = {...storeProps, databaseInstanceName: 'db2'}
        const storeState = new TinyBaseDataStoreState(storeProps)
        const appInterface = testAppInterface('path1', storeState)
        // @ts-ignore
        const dataStore = await(storeState.state.initialisedDataStore)
        expect((dataStore as any).isReadWrite).toBe(true)

        await storeState.add(collectionName, id, item)
        expect(await localItem(storeState, id)).toStrictEqual({id, ...item})
        expect(await serverItem(storeProps.databaseInstanceName, id)).toStrictEqual({id, ...item})

        const storeState2 = storeState.updateFrom(new TinyBaseDataStoreState(storePropsDb2))
        const appInterface2 = testAppInterface('path1', storeState2)
        // @ts-ignore
        await(storeState2.state.initialisedDataStore)
        expect(await localItem(storeState2, id)).toBe(null)
        expect(await localItem(storeState, id)).toStrictEqual({id, ...item})
        expect(await serverItem(storeProps.databaseInstanceName, id)).toStrictEqual({id, ...item})
        expect(await serverItem(storePropsDb2.databaseInstanceName, id)).toBe(null)

        const id2 = newId()
        await storeState2.add(collectionName, id2, item)
        expect(await localItem(storeState2, id2)).toStrictEqual({id: id2, ...item})
        expect(await localItem(storeState, id2)).toBe(null)
        expect(await serverItem(storePropsDb2.databaseInstanceName, id2)).toStrictEqual({id: id2, ...item})
        expect(await serverItem(storeProps.databaseInstanceName, id2)).toBe(null)
    })
})
