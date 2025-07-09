import {afterAll, beforeAll, beforeEach, describe, expect, test} from "vitest"
import {unstable_startWorker} from "wrangler"

import BigNumber from 'bignumber.js'

let store: any
let worker: any

beforeAll(async () => {
    worker = await unstable_startWorker({ config: 'tests/wrangler.jsonc',
        dev: {server: {port: 9091}}});
})

afterAll(async () => {
    await worker.dispose();
})

beforeEach(async () => {
    const env = {}
    store = null
})

function newId() {
    return 'id_' + Date.now()
}

describe('shared collections', () => {
    const collectionName = 'Widgets'

    const callStore = (func: string, ...args: any[]) => {
        return worker.fetch(`http://example.com/call/TinyBaseDurableObject_Full/DB1/${func}`, {
            method: 'POST',
            body: JSON.stringify(args),
        }).then( (resp: Response) => resp.json() ).then( (result: any) => {
            if (result.error) throw new Error(result.error)
            return result.data
        })
    }

    const callStoreTypes = (func: string, ...args: any[]) => {
        return worker.fetch(`http://example.com/call/TinyBaseDurableObject_Full/DB1/${func}`, {
            method: 'POST',
            body: JSON.stringify(args),
        }).then( (resp: Response) => resp.json() ).then( (result: any) => result.types)
    }

    test('add and retrieve', async () => {
        const id = newId()
        const item = {a:10, b:'foo'}
        await callStore('add', collectionName, id, item)
        const result = await callStore('getById', collectionName, id)

        expect(result).toStrictEqual({id, ...item})
    }, 20_000)

    test('has initial empty data store', async () => {
        await expect(callStore('getById', collectionName, 'idxxx')).rejects.toHaveProperty('message', `Object with id 'idxxx' not found in collection 'Widgets'`)
    })

    test('errors for unknown collection names', async () => {
        await expect(callStore('add', 'Sprockets', 'w1', {a: 10})).rejects.toHaveProperty('message', `Collection 'Sprockets' not found`)
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

    test('can query with simple field values', async () => {
        const id1 = 'id1_' + Date.now(), id2 = 'id2_' + Date.now(), id3 = 'id3_' + Date.now()
        await callStore('test_clear', 'Widgets')
        await callStore('add', 'Widgets', id1, {a: 10, b: 'Bee1', c: true})
        await callStore('add', 'Widgets', id2, {a: 20, b: 'Bee2', c: true})
        await callStore('add', 'Widgets', id3, {a: 20, b: 'Bee3', c: false})

        const result = await callStore('query', 'Widgets', {a: 20})
        expect(result).toStrictEqual([
            {id: id2, a: 20, b: 'Bee2', c: true},
            {id: id3, a: 20, b: 'Bee3', c: false}
        ])
    })

    test('can query with complex criteria', async () => {
        await callStore('test_clear', 'Widgets')
        await callStore('add', 'Widgets', 'q1', {a: 100, b: 'Bee10', c: true})
        await callStore('add', 'Widgets', 'q2', {a: 200, b: 'Bee20', c: true})
        await callStore('add', 'Widgets', 'q3', {a: 300, b: 'Bee30', c: false})
        await callStore('add', 'Widgets', 'q4', {a: 400, b: 'Bee40', c: false})
        const result = await callStore('query', 'Widgets', [
            ['a', '>=', 200],
            ['a', '<', 400],
            ])
        expect(result).toStrictEqual([
            {id: 'q2', a: 200, b: 'Bee20', c: true},
            {id: 'q3', a: 300, b: 'Bee30', c: false}
        ])
    })

    test('query uses correct data types and allows ==', async () => {
        await callStore('test_clear', 'Widgets')
        await callStore('add', 'Widgets', 'q1', {a: 90, b: 'Bee10', c: true})
        await callStore('add', 'Widgets', 'q2', {a: 100, b: 'Bee20', c: true})
        await callStore('add', 'Widgets', 'q3', {a: 300, b: 'Bee30', c: false})
        await callStore('add', 'Widgets', 'q4', {a: 400, b: 'Bee40', c: false})
        expect(await callStore('query', 'Widgets', [['a', '>=', 200],])).toStrictEqual([
            {id: 'q3', a: 300, b: 'Bee30', c: false},
            {id: 'q4', a: 400, b: 'Bee40', c: false}
        ])
        expect(await callStore('query', 'Widgets', [['b', '>=', 'Bee30'],])).toStrictEqual([
            {id: 'q3', a: 300, b: 'Bee30', c: false},
            {id: 'q4', a: 400, b: 'Bee40', c: false}
        ])
        expect(await callStore('query', 'Widgets', [['c', '==', false],])).toStrictEqual([
            {id: 'q3', a: 300, b: 'Bee30', c: false},
            {id: 'q4', a: 400, b: 'Bee40', c: false}
        ])
        expect(await callStore('query', 'Widgets', [['c', '=', true],])).toStrictEqual([
            {id: 'q1', a: 90, b: 'Bee10', c: true},
            {id: 'q2', a: 100, b: 'Bee20', c: true}
        ])
    })

    test('stores dates', async () => {
        const id = newId()
        const hour = 10
        const theDate = new Date(2022, 6, 2, hour, 11, 12)
        await callStore('add', 'Widgets', id, {a: 10, date: theDate})
        const itemTypes = await callStoreTypes('getById', 'Widgets', id)
        expect(itemTypes.date).toBe('Date')
    })

    test('stores Big decimals', async () => {
        const id = newId()
        const theNumber = new BigNumber('1122334455667788')
        await callStore('add', 'Widgets', id, {a: 10, num: '#Dec' + theNumber})
        const itemTypes = await callStoreTypes('getById', 'Widgets', id)
        expect(itemTypes.num).toBe('BigNumber')
    })

    test('stores nulls', async () => {
        const id = newId()
        await callStore('add', 'Widgets', id, {a: 10, date: null})
        const item = await callStore('getById', 'Widgets', id)
        expect(item.date).toBeNull()
    })

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
