import {components} from '../../src/serverRuntime/index'
import admin from 'firebase-admin'
import fs from 'fs'

const {FirestoreDataStore} = components
let store: any //typeof FirestoreDataStore

const serviceAccount = JSON.parse(fs.readFileSync('private/service-account-key.json', 'utf8'))
const theApp = admin.initializeApp({credential: admin.credential.cert(serviceAccount)})

beforeEach(async () => {
    const appProvider = () => theApp

    store = new FirestoreDataStore({collections: 'Widgets: signed-in\nUserStuff: user-private'}, appProvider)
})

describe('shared collections', () => {
    test('has initial empty data store', async () => {
        await expect(store.getById('Widgets', 'wxxx')).rejects.toHaveProperty('message', `Object with id 'wxxx' not found in collection 'Widgets'`)
    })

    test('errors for unknown collection names', async () => {
        // const store = new IdbDataStoreImpl({dbName: 'db2', collectionNames: ['Gadgets']})
        await expect(store.getById('Sprockets', 'w1')).rejects.toHaveProperty('message', `Collection 'Sprockets' not found`)
    })

    test('returns null if not found and nullIfNotFound set', async () => {
        await expect(store.getById('Widgets', 'wxxx', true)).resolves.toBe(null)
    })

    test('can add, update and remove', async () => {
        await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
        const retrievedObj = await store.getById('Widgets', 'w1')
        expect(retrievedObj).toMatchObject({id: 'w1', a: 10, b: 'Bee1', c: true})

        await store.addAll('Widgets', {w2: {a: 50, b: 'Bee50', c: true}, w3: {a: 60, b: 'Bee60', c: false}})
        expect(await store.getById('Widgets', 'w3')).toMatchObject({id: 'w3', a: 60, b: 'Bee60', c: false})

        await store.update('Widgets', 'w1', {a: 20, b: 'Bee1', c: true})
        expect(await store.getById('Widgets', 'w1')).toMatchObject({id: 'w1', a: 20, b: 'Bee1', c: true})

        await store.remove('Widgets', 'w1')
        await expect(store.getById('Widgets', 'w1')).rejects.toHaveProperty('message', `Object with id 'w1' not found in collection 'Widgets'`)
    })

    test('can query with simple field values', async () => {
        await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
        await store.add('Widgets', 'w2', {a: 20, b: 'Bee2', c: true})
        await store.add('Widgets', 'w3', {a: 20, b: 'Bee3', c: false})
        const result = await store.query('Widgets', {a: 20})
        expect(result.length).toBe(2)
        expect(result[0]).toMatchObject({id: 'w2', a: 20, b: 'Bee2', c: true})
        expect(result[1]).toMatchObject({id: 'w3', a: 20, b: 'Bee3', c: false})
    })

    test('can query with complex criteria', async () => {
        await store.add('Widgets', 'q1', {a: 100, b: 'Bee10', c: true})
        await store.add('Widgets', 'q2', {a: 200, b: 'Bee20', c: true})
        await store.add('Widgets', 'q3', {a: 300, b: 'Bee30', c: false})
        await store.add('Widgets', 'q4', {a: 400, b: 'Bee40', c: false})
        const result = await store.query('Widgets', [
            ['a', '>=', 200],
            ['a', '<', 400],
            ])
        expect(result.length).toBe(2)
        expect(result[0]).toMatchObject({id: 'q2', a: 200, b: 'Bee20', c: true})
        expect(result[1]).toMatchObject({id: 'q3', a: 300, b: 'Bee30', c: false})
    })

    test('stores dates', async () => {
        const hour = 10
        const theDate = new Date(2022, 6, 2, hour, 11, 12)
        await store.add('Widgets', 'w1', {a: 10, date: theDate})
        const item = await store.getById('Widgets', 'w1')
        expect(item.date.getTime()).toStrictEqual(theDate.getTime())
    })

    test('stores nulls', async () => {
        await store.add('Widgets', 'w99', {a: 10, date: null})
        const item = await store.getById('Widgets', 'w99')
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
