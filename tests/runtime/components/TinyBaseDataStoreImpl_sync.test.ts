import {afterAll, beforeAll, beforeEach, describe, expect, MockedFunction, test, vi} from "vitest"
import TinyBaseDataStoreImpl from '../../../src/runtime/components/TinyBaseDataStoreImpl'
import {unstable_startWorker} from 'wrangler'
import {wait, waitUntil} from '../../testutil/testHelpers'
import {matches} from 'lodash'
import DataStore, {Add} from '../../../src/shared/DataStore'
import jwtEncode from 'jwt-encode'
import * as authentication from '../../../src/runtime/components/authentication'
vi.mock('../../../src/runtime/components/authentication')

const mock_getIdToken = authentication.getIdToken as MockedFunction<any>

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
    const worker = await unstable_startWorker({ config: 'tests/wrangler.jsonc',
    dev: {server: {port}}});
    await Promise.all(['db1', 'db2', 'db3'].map(dbName => callStoreFn(worker)(dbType, dbName, 'test_clear', 'Widgets') ))
    console.log('Cleared databases')
    await wait(200)
    return worker
}

beforeEach(()=> id = newId())

describe('sync via server - authorized sync', () => {
    const port = 9501
    const syncServer = `localhost:${port}/do/`
    const dbType = 'TinyBaseDurableObject_A'
    const debugSync = false
    const createStore = (databaseName = 'db1')=> new TinyBaseDataStoreImpl({ databaseTypeName: dbType,  databaseInstanceName: databaseName, collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer})

    let worker: any
    let callStore: any

    beforeAll(async () => {
        worker = await startWorker(port, dbType)
        callStore = callStoreFn(worker)
    })

    afterAll(async () => {
        await worker.dispose();
    })

    test('call store works', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        const storedItem = await callStore(dbType, 'db1', 'getById', collectionName, id)
        expect(storedItem).toEqual({id, ...item})
    })

    test('sync local with existing data', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)

        const store1 = await createStore().init()
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id, true)), 100, 2000)
        await checkWidget({id, ...item})

        await callStore(dbType, 'db1', 'update', collectionName, id, {b: 'bar'})
        await checkWidget({id, ...item, b: 'bar'})
    })

    test('local receives update when change on server', async () => {
        const store1 = createStore()
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id)), 100, 2000)

        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        await checkWidget({id, ...item})

        await callStore(dbType, 'db1', 'update', collectionName, id, {b: 'bar'})
        await checkWidget({id, ...item, b: 'bar'})
    })

    test('server ignores illegal changes on client', async () => {
        const store1 = createStore()
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
        const store1 = await createStore().init()
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
        const store1 = createStore()
        const store2 = createStore('db2')
        const checkWidget = (store: any, expected: object) => waitUntil(async ()=> matches(expected)(await store.getById('Widgets', id, true)), 100, 2000)

        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        await checkWidget(store1, {id, ...item})
        await wait(500)
        await expect(store2.getById('Widgets', id, true)).resolves.toBe(null)
    })

    test('synchronizes with two stores with same database name', async () => {
        console.log('id', id)
        const store1 = await createStore().init()
        const store2 = await createStore().init()
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
        // const authToken1 = 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjMwMGE4N2E4LWZmMTEtNDJiMS1iMDYzLWM1ZmFlNzRjYTA0MCIsInR5cCI6IkpXVCJ9.eyJtb2RlIjoiYWNjZXNzIiwidHlwZSI6InVzZXIiLCJwcm9wZXJ0aWVzIjp7ImlkIjoiYUBiLmNvbSIsImVtYWlsIjoiYUBiLmNvbSIsIm5hbWUiOiIifSwiYXVkIjoiZWxlbWVudG8tYXBwIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4Nzg3Iiwic3ViIjoidXNlcjo5YWM5ZmNiYzQwNDAwNzY1IiwiZXhwIjoxNzUxNzk1MDkyfQ.nchcru6F1xCQ-C4lOBZmpLVyKvjZfPXwX8e3OLwaeQ7qSboFiY41_fd8bMKl5jHuuUPHUifk84uULkmT7YdplA'
        // const authToken2 = 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjMwMGE4N2E4LWZmMTEtNDJiMS1iMDYzLWM1ZmFlNzRjYTA0MCIsInR5cCI6IkpXVCJ9.eyJtb2RlIjoiYWNjZXNzIiwidHlwZSI6InVzZXIiLCJwcm9wZXJ0aWVzIjp7ImlkIjoiYUBiLmNvbSIsImVtYWlsIjoiYUBiLmNvbSIsIm5hbWUiOiIifSwiYXVkIjoiZWxlbWVudG8tYXBwIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4Nzg3Iiwic3ViIjoidXNlcjo5YWM5ZmNiYzQwNDAwNzY1IiwiZXhwIjoxNzUxNzk1MDkyfQ.nchcru6F1xCQ-C4lOBZmpLVyKvjZfPXwX8e3OLwaeQ7qSboFiY41_fd8bMKl5jHuuUPHUifk84uULkmT7YdplA'
        const authToken1 = tokenFor('user1')
        const authToken2 = tokenFor('user2')
        mock_getIdToken.mockResolvedValueOnce(authToken1)
                        .mockResolvedValueOnce(authToken2)

        console.log('id1', id1, 'id2', id2)
        const item1 = {id: id1, userId: userId1, a:10, b:'foo'}
        const item2 = {id: id2, userId: userId2, a:20, b:'bar'}
        const store1 = await createStore().init()
        const store2 = await createStore().init()
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

})

describe('sync via server - full sync', () => {
    const port = 9502
    const syncServer = `localhost:${port}/do/`
    const dbType = 'TinyBaseFullSyncDurableObject'
    const debugSync = false
    const createStore = (databaseName = 'db1')=> new TinyBaseDataStoreImpl({ databaseTypeName: dbType,  databaseInstanceName: databaseName, collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer})

    let worker: any
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

    test('call store works', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        const storedItem = await callStore(dbType, 'db1', 'getById', collectionName, id)
        expect(storedItem).toEqual({id, ...item})
    })

    test('sync local with existing data', async () => {
        await callStore(dbType, 'db1', 'add', collectionName, id, item)

        const store1 = await createStore().init()
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id, true)), 100, 2000)
        await checkWidget({id, ...item})

        await callStore(dbType, 'db1', 'update', collectionName, id, {b: 'bar'})
        await checkWidget({id, ...item, b: 'bar'})
    })

    test('local receives update when change on server', async () => {
        const store1 = createStore()
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id)), 100, 2000)

        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        await checkWidget({id, ...item})

        await callStore(dbType, 'db1', 'update', collectionName, id, {b: 'bar'})
        await checkWidget({id, ...item, b: 'bar'})
    })

    test('server syncs changes on client', async () => {
        const store1 = createStore()
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id)), 100, 2000)

        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        await checkWidget({id, ...item})
        await wait(1000)  // ensure synchroniszation gets changes in correct time sequence

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

    test('can subscribe to changes', async () => {
        const store1 = await createStore().init()
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
        const store1 = createStore()
        const store2 = createStore('db2')
        const checkWidget = (store: any, expected: object) => waitUntil(async ()=> matches(expected)(await store.getById('Widgets', id, true)), 100, 2000)

        await callStore(dbType, 'db1', 'add', collectionName, id, item)
        await checkWidget(store1, {id, ...item})
        await wait(500)
        await expect(store2.getById('Widgets', id, true)).resolves.toBe(null)
    })

    test('synchronizes with two stores with same database name', async () => {
        console.log('id', id)
        const store1 = await createStore().init()
        const store2 = await createStore().init()
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
        const store1 = await createStore().init()
        const store2 = await createStore().init()
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

})
