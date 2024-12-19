import {Add, InvalidateAll, MultipleChanges, Remove, Update} from '../../src/runtime/DataStore'
import {FirestoreDataStoreImpl} from '../../src/runtime/components'

import {test_signInWithEmailAndPassword, signOut as authSignOut} from '../../src/runtime/components/authentication'
import fs from 'fs'
import {setConfig} from '../../src/runtime/components/firebaseApp'

let store: FirestoreDataStoreImpl

async function signInAs(testAccountFile: string) {
    const {name, password} = JSON.parse(fs.readFileSync(testAccountFile, 'utf8'))
    await test_signInWithEmailAndPassword(name, password)
}

async function signOut() {
    return authSignOut()
}

beforeAll(async () => {
    const config = JSON.parse(fs.readFileSync('private/testFirebaseConfig.json', 'utf8'))
    setConfig(config)
})

beforeEach(async () => {
    store = new FirestoreDataStoreImpl({collections: 'Widgets: signed-in\nUserStuff: user-private\nFreeStuff'})
})

afterAll(async () => {
    await signOut()
})

describe('shared collections', () => {
    beforeAll(async () => {
        await signInAs('private/userTestAccount.json')
    })

    test('has initial empty data store', async () => {
        await expect(store.getById('Widgets', 'wxxx')).rejects.toHaveProperty('message', `Object with id 'wxxx' not found in collection 'Widgets'`)
    })

    test('returns null if not found and nullIfNotFound set', async () => {
        await expect(store.getById('Widgets', 'wxxx', true)).resolves.toBe(null)
    })

    test('errors for unknown collection names', async () => {
        await expect(store.getById('Sprockets', 'w1')).rejects.toHaveProperty('message', `Collection 'Sprockets' not found`)
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

    test('can query', async () => {
        await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
        await store.add('Widgets', 'w2', {a: 20, b: 'Bee2', c: true})
        await store.add('Widgets', 'w3', {a: 20, b: 'Bee3', c: false})
        const result = await store.query('Widgets', {a: 20})
        expect(result.length).toBe(2)
        expect(result[0]).toMatchObject({id: 'w2', a: 20, b: 'Bee2', c: true})
        expect(result[1]).toMatchObject({id: 'w3', a: 20, b: 'Bee3', c: false})
    })

    test('stores dates', async () => {
        const hour = 10
        const theDate = new Date(2022, 6, 2, hour, 11, 12)
        await store.add('Widgets', 'w1', {a: 10, date: theDate})
        const item = await store.getById('Widgets', 'w1')
        expect(item?.date.getTime()).toStrictEqual(theDate.getTime())
    })

    test('stores nulls', async () => {
        await store.add('Widgets', 'w99', {a: 10, foo: null})
        const item = await store.getById('Widgets', 'w99')
        expect(item).toStrictEqual({id: 'w99', a: 10, foo: null})
    })

    test('stores undefined as null in add, addAll and update', async () => {
        await store.add('Widgets', 'w99', {a: 10, foo: undefined})
        const item = await store.getById('Widgets', 'w99')
        expect(item).toStrictEqual({id: 'w99', a: 10, foo: null})

        await store.addAll('Widgets', {'w77': {a: 10, foo: undefined}})
        const item1 = await store.getById('Widgets', 'w77')
        expect(item1).toStrictEqual({id: 'w77', a: 10, foo: null})

        await store.update('Widgets', 'w99', {a: undefined})
        const item2 = await store.getById('Widgets', 'w99')
        expect(item2).toStrictEqual({id: 'w99', a: null, foo: null})
    })

    test('can query shared non-signed-in collection if not logged in', async () => {
        await store.add('FreeStuff', 'w1', {a: 10, b: 'Bee1', c: true})
        await store.add('FreeStuff', 'w2', {a: 20, b: 'Bee2', c: true})
        await store.add('FreeStuff', 'w3', {a: 20, b: 'Bee3', c: false})
        await signOut()
        const result = await store.query('FreeStuff', {a: 20})
        expect(result.length).toBe(2)
        expect(result[0]).toMatchObject({id: 'w2', a: 20, b: 'Bee2', c: true})
        expect(result[1]).toMatchObject({id: 'w3', a: 20, b: 'Bee3', c: false})
    })


    describe('log in and out', () => {

        test('query is empty when logged out and updates when log in', async () => {
            await signInAs('private/userTestAccount.json')
            await store.add('Widgets', 'x1', {a: 110, b: 'AAA', c: true})
            await store.add('Widgets', 'x2', {a: 120, b: 'AAA', c: true})

            const queryIds = () => store.query('Widgets', {b: 'AAA'}).then( result => result.map( (it:any) => it.id ))
            const onNextWidgets = jest.fn()
            store.observable('Widgets').subscribe(onNextWidgets)

            await signOut()
            expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: InvalidateAll})
            expect(await queryIds()).toStrictEqual([])

            await signInAs('private/userTestAccount.json')
            expect(await queryIds()).toStrictEqual(['x1', 'x2'])

            await signOut()
            expect(await queryIds()).toStrictEqual([])

            expect(onNextWidgets).toHaveBeenCalledTimes(3);
            [1,2,3].map( n => expect(onNextWidgets).toHaveBeenNthCalledWith(n, {collection: 'Widgets', type: InvalidateAll}))
        })
    })

    describe('subscribe', () => {

        beforeAll(async () => {
            await signInAs('private/userTestAccount.json')
        })

        test('sends changes on Add to subscriptions for that collection', async () => {
            const onNextWidgets = jest.fn()
            const onNextGadgets = jest.fn()
            store.observable('Widgets').subscribe(onNextWidgets)
            store.observable('Gadgets').subscribe(onNextGadgets)
            await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
            expect(onNextWidgets).toHaveBeenCalledWith({
                collection: 'Widgets',
                type: Add,
                id: 'w1',
                changes: {a: 10, b: 'Bee1', c: true}
            })
            // expect(onNextGadgets).not.toHaveBeenCalled()
        })

        test('sends multiple changes on Add all to subscriptions for that collection', async () => {
            const onNextWidgets = jest.fn()
            const onNextSprockets = jest.fn()
            store.observable('Widgets').subscribe(onNextWidgets)
            store.observable('Sprockets').subscribe(onNextSprockets)
            await store.addAll('Widgets', {'w1': {a: 10, b: 'Bee1', c: true}})
            expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: MultipleChanges,})
            // expect(onNextSprockets).not.toHaveBeenCalled()
        })

        test('sends changes on Update to subscriptions for that collection', async () => {
            const onNextWidgets = jest.fn()
            const onNextGadgets = jest.fn()
            store.observable('Widgets').subscribe(onNextWidgets)
            store.observable('Gadgets').subscribe(onNextGadgets)
            await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
            onNextWidgets.mockReset()
            await store.update('Widgets', 'w1', {c: true})
            expect(onNextWidgets).toHaveBeenCalledWith({
                collection: 'Widgets',
                type: Update,
                id: 'w1',
                changes: {c: true}
            })
            // expect(onNextGadgets).not.toHaveBeenCalled()
        })

        test('sends changes on Remove to subscriptions for that collection', async () => {
            const onNextWidgets = jest.fn()
            const onNextGadgets = jest.fn()
            store.observable('Widgets').subscribe(onNextWidgets)
            store.observable('Gadgets').subscribe(onNextGadgets)
            await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
            onNextWidgets.mockReset()
            await store.remove('Widgets', 'w1')
            expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: Remove, id: 'w1'})
            // expect(onNextGadgets).not.toHaveBeenCalled()
        })

    })
})

describe('user-private collections', () => {

    test('cannot access user-private collection unless logged in', async () => {
        await signOut()
        await expect(store.getById('UserStuff', 'w1')).rejects.toHaveProperty('message', `Cannot access user-private collection 'UserStuff' if not logged in`)
    })

    test('can add, update and remove in a user-private collection', async () => {
        await signInAs('private/userTestAccount.json')

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
        await signInAs('private/userTestAccount.json')
        await store.add('UserStuff', 'w1', {a: 10, b: 'Bee1', c: true})
        await signOut()
        await signInAs('private/userTestAccount2.json')
        await store.addAll('UserStuff', {z1: {a: 22, b: 'Bee22', c: true}, z2: {a: 90, b: 'Bee90', c: true}, z3: {a: 66, b: 'Bee66', c: false}})
        const result = await store.query('UserStuff', {c: true})
        expect(result.length).toBe(2)
            expect(result[0]).toMatchObject({id: 'z1', a: 22, b: 'Bee22', c: true})
            expect(result[1]).toMatchObject({id: 'z2', a: 90, b: 'Bee90', c: true})
    })
})
