import {afterAll, beforeAll, describe, expect, test} from "vitest"
import TinyBaseDataStoreImpl from '../../../src/runtime/components/TinyBaseDataStoreImpl'
import {unstable_startWorker} from 'wrangler'
import {wait} from '../../testutil/testHelpers'

const syncServer = 'localhost:9090/do/'

let worker: any

beforeAll(async () => {
    worker = await unstable_startWorker({ config: 'tests/wrangler.jsonc',
        dev: {server: {port: 9090}}});
    ['db1', 'db2', 'db3'].forEach(async databaseName => await new TinyBaseDataStoreImpl({databaseName, collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer}).test_clear() )
    await wait(500)
})

afterAll(async () => {
    await worker.dispose();
})

describe('synchronization', () => {

    // this is an incomplete test as both stores use the same websocket key, but would need to start a separate process to test further
    test('synchronizes changes between two stores with the same databaseName', async () => {
        const store1 = new TinyBaseDataStoreImpl({databaseName: 'db1', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer})
        const store1a = new TinyBaseDataStoreImpl({databaseName: 'db1', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer})
        await store1.add('Widgets', 'w1', {a: 47, b: 'Bee87', c: true})

        await wait(500)
        const retrievedObj = await store1a.getById('Widgets', 'w1')
        expect(retrievedObj).toMatchObject({id: 'w1', a: 47, b: 'Bee87', c: true})

        await store1a.add('Widgets', 'w2', {a: 57, b: 'Bee97', c: false})
        await store1a.update('Widgets', 'w1', {c: false})

        expect(await store1a.getById('Widgets', 'w1')).toMatchObject({id: 'w1', a: 47, b: 'Bee87', c: false})
        expect(await store1a.getById('Widgets', 'w2')).toMatchObject({id: 'w2', a: 57, b: 'Bee97', c: false})
    }, 10000)

    test('does not synchronizes changes between two stores with different databaseNames', async () => {
        const store1 = new TinyBaseDataStoreImpl({databaseName: 'db2', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer})
        const store2 = new TinyBaseDataStoreImpl({databaseName: 'db3', collections: 'Widgets;Gadgets', persist: false, sync: true, syncServer})
        await store1.add('Widgets', 'w1', {a: 47, b: 'Bee87', c: true})

        await wait(500)
        await expect(store2.getById('Widgets', 'w1', true)).resolves.toBe(null)
    }, 10000)
})
