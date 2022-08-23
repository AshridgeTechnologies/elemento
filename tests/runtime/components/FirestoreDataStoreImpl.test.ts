import 'fake-indexeddb/auto'
import {FileDataStoreImpl, IdbDataStoreImpl} from '../../../src/runtime/components/index'
import {Add, MultipleChanges, Remove, Update} from '../../../src/runtime/DataStore'
import FirestoreDataStoreImpl from '../../../src/runtime/components/FirestoreDataStoreImpl'
import {setConfig, getApp} from '../../../src/runtime/components/FirestoreDataStoreImpl'

import * as auth from 'firebase/auth'
import fs from 'fs'

let store: FirestoreDataStoreImpl

beforeAll(async () => {
    const config = JSON.parse(fs.readFileSync('private/testFirebaseConfig.json', 'utf8'))
    setConfig(config)
    const {name, password} = JSON.parse(fs.readFileSync('private/userTestAccount.json', 'utf8'))
    await auth.signInWithEmailAndPassword(auth.getAuth(getApp()), name, password)
})

beforeEach(async () => {
    store = new FirestoreDataStoreImpl({collections: 'Widgets: signed-in'})
})

afterEach(async () =>  {
    //await store['db'].delete()
})

afterAll(() => {
    auth.signOut(auth.getAuth(getApp()))
})

test('has initial empty data store', async () => {
    await expect(store.getById('Widgets', 'wxxx')).rejects.toHaveProperty('message', `Object with id 'wxxx' not found in collection 'Widgets'`)
})

test('errors for unknown collection names', async () => {
    // const store = new IdbDataStoreImpl({dbName: 'db2', collectionNames: ['Gadgets']})
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
    expect(item.date.getTime()).toStrictEqual(theDate.getTime())
})

describe('subscribe', () => {

    test('sends changes on Add to subscriptions for that collection', async () => {
        const onNextWidgets = jest.fn()
        const onNextGadgets = jest.fn()
        store.observable('Widgets').subscribe(onNextWidgets)
        store.observable('Gadgets').subscribe(onNextGadgets)
        await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
        expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: Add, id: 'w1', changes: {a: 10, b: 'Bee1', c: true}})
        expect(onNextGadgets).not.toHaveBeenCalled()
    })

    test('sends multiple changes on Add all to subscriptions for that collection', async () => {
        const onNextWidgets = jest.fn()
        const onNextSprockets = jest.fn()
        store.observable('Widgets').subscribe(onNextWidgets)
        store.observable('Sprockets').subscribe(onNextSprockets)
        await store.addAll('Widgets', {'w1': {a: 10, b: 'Bee1', c: true}})
        expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: MultipleChanges, })
        expect(onNextSprockets).not.toHaveBeenCalled()
    })

    test('sends changes on Update to subscriptions for that collection', async () => {
        const onNextWidgets = jest.fn()
        const onNextGadgets = jest.fn()
        store.observable('Widgets').subscribe(onNextWidgets)
        store.observable('Gadgets').subscribe(onNextGadgets)
        await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
        onNextWidgets.mockReset()
        await store.update('Widgets', 'w1', {c: true})
        expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: Update, id: 'w1', changes: {c: true}})
        expect(onNextGadgets).not.toHaveBeenCalled()
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
        expect(onNextGadgets).not.toHaveBeenCalled()
    })

})

