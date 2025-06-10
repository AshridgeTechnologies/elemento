import {afterAll, beforeAll, describe, expect, MockedFunction, test, vi} from "vitest"
import TinyBaseDataStoreImpl from '../../../src/runtime/components/TinyBaseDataStoreImpl'
import {unstable_startWorker} from 'wrangler'
import {wait, waitUntil} from '../../testutil/testHelpers'
import {matches} from 'lodash'
import DataStore, {Add, InvalidateAll} from '../../../src/shared/DataStore'
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

const syncServer = 'localhost:9090/do/'

let worker: any

let idSeq = 1000
const newId = () => 'id_' + (++idSeq)

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

    test('call store works', async () => {
        const id = newId()
        const item = {a:10, b:'foo'}
        await callStore('db1', 'add', collectionName, id, item)
        const storedItem = await callStore('db1', 'getById', collectionName, id)
        expect(storedItem).toEqual({id, ...item})
    })

    test('sync local with existing data', async () => {
        const id = newId()
        const item = {a:10, b:'foo'}
        await callStore('db1', 'add', collectionName, id, item)

        const store1 = new TinyBaseDataStoreImpl({databaseName: 'db1', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer, debugSync})
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id, true)), 100, 2000)
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

    test('server ignores illegal changes on client', async () => {
        const id = newId()
        const item = {a:10, b:'foo'}
        const store1 = new TinyBaseDataStoreImpl({databaseName: 'db1', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer, debugSync})
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id)), 100, 2000)

        await callStore('db1', 'add', collectionName, id, item)
        await checkWidget({id, ...item})

        // @ts-ignore
        store1.theDb.setCell(collectionName, id, 'json_data', JSON.stringify({id, ...item, b: 'bar'}))
        await expect(await store1.getById(collectionName, id)).toStrictEqual({id, ...item, b: 'bar'})  // will be updated on client
        console.log('Client update done')
        await wait(200)

        const itemOnServer = await callStore('db1', 'getById', collectionName, id)
        expect(itemOnServer).toStrictEqual({id, ...item})  // not updated on server
    })

    test('can subscribe to changes', async () => {
        const id = newId()
        const item = {a:10, b:'foo'}
        const store1 = await new TinyBaseDataStoreImpl({databaseName: 'db1', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer, debugSync}).init()
        await wait(100)
        const onNextWidgets = vi.fn()
        store1.observable('Widgets').subscribe(onNextWidgets)
        const checkWidget = (expected: object) => waitUntil(async ()=> matches(expected)(await store1.getById('Widgets', id)), 100, 2000)

        await wait(500)
        // expect(onNextWidgets).toHaveBeenLastCalledWith({collection: 'Widgets', type: InvalidateAll})
        // expect(onNextWidgets).toHaveBeenCalledTimes(1)
        await callStore('db1', 'add', collectionName, id, item)
        await wait(500)
        await checkWidget({id, ...item})
        expect(onNextWidgets).toHaveBeenNthCalledWith(1, {collection: 'Widgets', type: Add, id, changes: {id, ...item}})

        await callStore('db1', 'update', collectionName, id, {b: 'bar'})
        await checkWidget({id, ...item, b: 'bar'})
    })

    test('only synchronizes with stores with correct database name', async () => {
        const id = newId()
        const item = {a:10, b:'foo'}
        const store1 = new TinyBaseDataStoreImpl({databaseName: 'db1', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer, debugSync})
        const store2 = new TinyBaseDataStoreImpl({databaseName: 'db2', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer, debugSync})
        const checkWidget = (store: any, expected: object) => waitUntil(async ()=> matches(expected)(await store.getById('Widgets', id, true)), 100, 2000)

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

        await wait(200)
        console.log('add about to send')
        await callStore('db1', 'add', collectionName, id, item)
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
        const store1 = await new TinyBaseDataStoreImpl({databaseName: 'db1', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer, debugSync}).init()
        const store2 = await new TinyBaseDataStoreImpl({databaseName: 'db1', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer, debugSync}).init()
        const checkWidget = (store: DataStore, id: string, expected: object) => waitUntil(async ()=> matches(expected)(await store.getById('Widgets', id, true)), 100, 2000)

        await wait(200)
        await callStore('db1', 'addAll', collectionName, {[id1]: item1, [id2]: item2})
        await wait(200)
        console.log('item1 retrieved', await store1.getById('Widgets', id1, true))
        await checkWidget(store1, id1, item1)
        await checkWidget(store2, id2, item2)
        await expect(store1.getById('Widgets', id2, true)).resolves.toBeNull()
        await expect(store2.getById('Widgets', id1, true)).resolves.toBeNull()
    })

})
