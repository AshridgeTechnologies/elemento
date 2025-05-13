import {afterEach, beforeEach, describe, expect, test, vi} from "vitest"
import {TinyBaseDataStoreImpl} from '../../../src/runtime/components/index'
import {Add, MultipleChanges, Remove, Update} from '../../../src/runtime/DataStore'
import BigNumber from 'bignumber.js'

let store: TinyBaseDataStoreImpl

beforeEach(() => {
    store = new TinyBaseDataStoreImpl({databaseName: 'db1', collections: 'Widgets,Gadgets'})
})

afterEach(async () =>  {
})

test.skip('has initial empty data store', async () => {
    await expect(store.getById('Widgets', 'w1')).rejects.toHaveProperty('message', `Object with id 'w1' not found in collection 'Widgets'`)
})

test.skip('returns null if not found and nullIfNotFound set', async () => {
    await expect(store.getById('Widgets', 'wxxx', true)).resolves.toBe(null)
})

test.skip('errors for unknown collection names', async () => {
    // const store = new TinyBaseDataStoreImpl({dbName: 'db2', collectionNames: ['Gadgets']})
    await expect(store.getById('Sprockets', 'w1')).rejects.toHaveProperty('message', `Collection 'Sprockets' not found`)
})

test.skip('can add, update and remove', async () => {
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

test.skip('can query', async () => {
    await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
    await store.add('Widgets', 'w2', {a: 20, b: 'Bee2', c: true})
    await store.add('Widgets', 'w3', {a: 20, b: 'Bee3', c: false})
    const result = await store.query('Widgets', {a: 20})
    expect(result.length).toBe(2)
    expect(result[0]).toMatchObject({id: 'w2', a: 20, b: 'Bee2', c: true})
    expect(result[1]).toMatchObject({id: 'w3', a: 20, b: 'Bee3', c: false})

})

test.skip('stores dates', async () => {
    const hour = 10
    const theDate = new Date(2022, 6, 2, hour, 11, 12)
    await store.add('Widgets', 'w1', {a: 10, date: theDate})
    const item = await store.getById('Widgets', 'w1')
    expect(item!.date.getTime()).toStrictEqual(theDate.getTime())
})

describe('stores decimals', () => {
    test.skip('in add and get', async () => {
        const theNumber = new BigNumber('1234.56')
        await store.add('Widgets', 'w1', {a: 10, amount: theNumber})
        const item = await store.getById('Widgets', 'w1')
        expect(item!.amount).toBeInstanceOf(BigNumber)
        expect(item!.amount).toStrictEqual(theNumber)
    })

    test.skip('in addAll and query', async () => {
        const theNumber = new BigNumber('1234.56')
        await store.addAll('Widgets', {'id1': {a: 10, amount: theNumber}})
        const item = (await store.query('Widgets', {}))[0] as any
        expect(item.amount).toBeInstanceOf(BigNumber)
        expect(item.amount).toStrictEqual(theNumber)
    })

    test.skip('in update', async () => {
        const theNumber = new BigNumber('1234.56')
        await store.add('Widgets', 'w1', {a: 10})
        await store.update('Widgets', 'w1', {amount: theNumber})
        const item = await store.getById('Widgets', 'w1')
        expect(item!.amount).toBeInstanceOf(BigNumber)
        expect(item!.amount).toStrictEqual(theNumber)
    })
})


describe('subscribe', () => {

    test.skip('sends changes on Add to subscriptions for that collection', async () => {
        const onNextWidgets = vi.fn()
        const onNextGadgets = vi.fn()
        store.observable('Widgets').subscribe(onNextWidgets)
        store.observable('Gadgets').subscribe(onNextGadgets)
        await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
        expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: Add, id: 'w1', changes: {a: 10, b: 'Bee1', c: true}})
        expect(onNextGadgets).not.toHaveBeenCalled()
    })

    test.skip('sends multiple changes on Add all to subscriptions for that collection', async () => {
        const onNextWidgets = vi.fn()
        const onNextSprockets = vi.fn()
        store.observable('Widgets').subscribe(onNextWidgets)
        store.observable('Sprockets').subscribe(onNextSprockets)
        await store.addAll('Widgets', {'w1': {a: 10, b: 'Bee1', c: true}})
        expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: MultipleChanges, })
        expect(onNextSprockets).not.toHaveBeenCalled()
    })

    test.skip('sends changes on Update to subscriptions for that collection', async () => {
        const onNextWidgets = vi.fn()
        const onNextGadgets = vi.fn()
        store.observable('Widgets').subscribe(onNextWidgets)
        store.observable('Gadgets').subscribe(onNextGadgets)
        await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
        onNextWidgets.mockReset()
        await store.update('Widgets', 'w1', {c: true})
        expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: Update, id: 'w1', changes: {c: true}})
        expect(onNextGadgets).not.toHaveBeenCalled()
    })

    test.skip('sends changes on Remove to subscriptions for that collection', async () => {
        const onNextWidgets = vi.fn()
        const onNextGadgets = vi.fn()
        store.observable('Widgets').subscribe(onNextWidgets)
        store.observable('Gadgets').subscribe(onNextGadgets)
        await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
        onNextWidgets.mockReset()
        await store.remove('Widgets', 'w1')
        expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: Remove, id: 'w1'})
        expect(onNextGadgets).not.toHaveBeenCalled()
    })

})

