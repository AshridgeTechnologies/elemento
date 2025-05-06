// import {components} from '../../src/serverRuntime/index'
import { unstable_startWorker } from "wrangler"

// const {CloudflareDataStore} = components
import CloudflareDataStore from '../../src/serverRuntime/CloudflareDataStore'
let store: any

beforeEach(async () => {
    const env = {}
    store = new CloudflareDataStore({collections: 'Widgets', env, bindingName: 'DB1'})
})

describe('shared collections', () => {
    let worker: any
    const collectionName = 'Widgets'

    const callStore = (func: string, ...args: any[]) => {
        return worker.fetch(`http://example.com/store/${func}`, {
            method: 'POST',
            body: JSON.stringify(args),
        }).then( (resp: Response) => resp.json() )
    }

    beforeAll(async () => {
        worker = await unstable_startWorker({ config: 'tests/serverRuntime/wrangler.jsonc',
        dev: {server: {port: 9090}}});
    });

    test('add and retrieve', async () => {
        const id = 'id_' + Date.now()
        const item = {a:10, b:'foo'}
        await callStore('add', collectionName, id, item)
        const result = await callStore('getById', collectionName, id)

        expect(result).toStrictEqual({id, ...item})
    })

    afterAll(async () => {
        await worker.dispose();
    });

    test('has initial empty data store', async () => {
        await expect(callStore('getById', collectionName, 'idxxx')).rejects.toHaveProperty('message', `Object with id 'idxxx' not found in collection 'Widgets'`)
    })

    test('errors for unknown collection names', async () => {
        await expect(callStore('getById', 'Sprockets', 'w1')).rejects.toHaveProperty('message', `Collection 'Sprockets' not found`)
    })

    test('returns null if not found and nullIfNotFound set', async () => {
        await expect(callStore('getById', 'Widgets', 'wxxx', true)).resolves.toBe(null)
    })

    test('can add, update and remove', async () => {
        const id1 = 'id1_' + Date.now(), id2 = 'id2_' + Date.now(), id3 = 'id3_' + Date.now()

        await callStore('add', 'Widgets', id1, {a: 10, b: 'Bee1', c: true})
        const retrievedObj = await callStore('getById', 'Widgets', id1)
        expect(retrievedObj).toMatchObject({id: id1, a: 10, b: 'Bee1', c: true})

        await callStore('addAll', 'Widgets', {[id2]: {a: 50, b: 'Bee50', c: true}, [id3]: {a: 60, b: 'Bee60', c: false}})
        expect(await callStore('getById', 'Widgets', id3)).toMatchObject({id: id3, a: 60, b: 'Bee60', c: false})

        await callStore('update', 'Widgets', id1, {a: 20})
        expect(await callStore('getById', 'Widgets', id1)).toMatchObject({id: id1, a: 20, b: 'Bee1', c: true})

        await callStore('remove', 'Widgets', id1)
        await expect(callStore('getById', 'Widgets', id1)).rejects.toHaveProperty('message', `Object with id '${id1}' not found in collection 'Widgets'`)
    })

    // test('can query with simple field values', async () => {
    //     await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
    //     await store.add('Widgets', 'w2', {a: 20, b: 'Bee2', c: true})
    //     await store.add('Widgets', 'w3', {a: 20, b: 'Bee3', c: false})
    //     const result = await store.query('Widgets', {a: 20})
    //     expect(result.length).toBe(2)
    //     expect(result[0]).toMatchObject({id: 'w2', a: 20, b: 'Bee2', c: true})
    //     expect(result[1]).toMatchObject({id: 'w3', a: 20, b: 'Bee3', c: false})
    // })
    //
    // test('can query with complex criteria', async () => {
    //     await store.add('Widgets', 'q1', {a: 100, b: 'Bee10', c: true})
    //     await store.add('Widgets', 'q2', {a: 200, b: 'Bee20', c: true})
    //     await store.add('Widgets', 'q3', {a: 300, b: 'Bee30', c: false})
    //     await store.add('Widgets', 'q4', {a: 400, b: 'Bee40', c: false})
    //     const result = await store.query('Widgets', [
    //         ['a', '>=', 200],
    //         ['a', '<', 400],
    //         ])
    //     expect(result.length).toBe(2)
    //     expect(result[0]).toMatchObject({id: 'q2', a: 200, b: 'Bee20', c: true})
    //     expect(result[1]).toMatchObject({id: 'q3', a: 300, b: 'Bee30', c: false})
    // })
    //
    // test('stores dates', async () => {
    //     const hour = 10
    //     const theDate = new Date(2022, 6, 2, hour, 11, 12)
    //     await store.add('Widgets', 'w1', {a: 10, date: theDate})
    //     const item = await store.getById('Widgets', 'w1')
    //     expect(item.date.getTime()).toStrictEqual(theDate.getTime())
    // })
    //
    // test('stores nulls', async () => {
    //     await store.add('Widgets', 'w99', {a: 10, date: null})
    //     const item = await store.getById('Widgets', 'w99')
    //     expect(item.date).toBeNull()
    // })

})

describe.skip('user-private collections', () => {

    test('cannot access user-private collection unless logged in', async () => {
        // await signOut()
        await expect(store.getById('UserStuff', 'w1')).rejects.toHaveProperty('message', `Cannot access user-private collection 'UserStuff' if not logged in`)
    })

    test('can add, update and remove in a user-private collection', async () => {
        // await signInAs('private/userTestAccount.json')

        await store.add('UserStuff', 'w1', {a: 10, b: 'Bee1', c: true})
        const retrievedObj = await store.getById('UserStuff', 'w1')
        expect(retrievedObj).toMatchObject({id: 'w1', a: 10, b: 'Bee1', c: true})

        await store.addAll('UserStuff', {w2: {a: 50, b: 'Bee50', c: true}, w3: {a: 60, b: 'Bee60', c: false}})
        expect(await store.getById('UserStuff', 'w3')).toMatchObject({id: 'w3', a: 60, b: 'Bee60', c: false})

        await store.update('UserStuff', 'w1', {a: 20, b: 'Bee1', c: true})
        expect(await store.getById('UserStuff', 'w1')).toMatchObject({id: 'w1', a: 20, b: 'Bee1', c: true})

        await store.remove('UserStuff', 'w1')
        await expect(store.getById('UserStuff', 'w1')).rejects.toHaveProperty('message', `Object with id 'w1' not found in collection 'UserStuff'`)
    })

    test('can only access own data in a user-private collection', async () => {
        // await signInAs('private/userTestAccount.json')
        await store.add('UserStuff', 'w1', {a: 10, b: 'Bee1', c: true})
        // await signOut()
        // await signInAs('private/userTestAccount2.json')
        await store.addAll('UserStuff', {z1: {a: 22, b: 'Bee22', c: true}, z2: {a: 90, b: 'Bee90', c: true}, z3: {a: 66, b: 'Bee66', c: false}})
        const result = await store.query('UserStuff', {c: true})
        expect(result.length).toBe(2)
            expect(result[0]).toMatchObject({id: 'z1', a: 22, b: 'Bee22', c: true})
            expect(result[1]).toMatchObject({id: 'z2', a: 90, b: 'Bee90', c: true})
    })

})
