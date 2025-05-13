import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
import MemoryDataStore from '../../src/runtime/components/MemoryDataStore'

describe('getById', () => {
    const store = new MemoryDataStore({
        Widgets: {
            w1: {height: 10, width: 20}
        }
    })

    test('returns data in a promise if found', async () => {
        expect(await store.getById('Widgets', 'w1')).toStrictEqual({height: 10, width: 20})
    })

    test('returns rejected promise if id not found', async () => {
        await expect(store.getById('Widgets', 'xxx')).rejects.toHaveProperty('message', `Object with id 'xxx' not found in collection 'Widgets'`)
    })

    test('returns rejected promise if collection not found but creates empty collection', async () => {
        await expect(store.getById('Snowballs', 'w1')).rejects.toHaveProperty('message', `Object with id 'w1' not found in collection 'Snowballs'`)
    })

})

describe('getAllData', () => {
    const data = {
        Widgets: {
            w1: {height: 10, width: 20},
            w2: {height: 30, width: 50},
        },
        Snowballs: {
            s1: {size: 44}
        }
    }
    const store = new MemoryDataStore(data)

    test('returns data from all collections as a promise', async () => {
        expect(await store.getAllData()).toStrictEqual(data)
    })
})

describe('query', () => {
    const data = {
        Widgets: {
            w1: {height: 10, width: 110},
            w2: {height: 10, width: 120},
            w3: {height: 20, width: 130},
            w4: {height: 30, width: 130},
            w5: {height: 30, width: 130},
        },
        Snowballs: {
            s1: {temperature: -5, width: 130}
        }
    }
    const store = new MemoryDataStore(data)
    const {w1, w2, w3, w4, w5} = data.Widgets

    test('selects objects whose values match a single criteria value', async () => {
        expect(await store.query('Widgets', {height: 10})).toStrictEqual([w1, w2])
        expect(await store.query('Widgets', {width: 130})).toStrictEqual([w3, w4, w5])
    })

    test('selects objects whose values match multiple criteria values', async () => {
        expect(await store.query('Widgets', {height: 10, width: 120})).toStrictEqual([w2])
        expect(await store.query('Widgets', {height: 30, width: 130})).toStrictEqual([w4, w5])
    })

    test('selects all objects for empty criteria values', async () => {
        expect(await store.query('Widgets', {})).toStrictEqual([w1, w2, w3, w4, w5])
    })

    test('selects no objects for non-existent collection', async () => {
        expect(await store.query('Gadgets', {})).toStrictEqual([])
    })
})

describe('add', () => {
    const store = new MemoryDataStore({
        Widgets: {
            w1: {height: 10, width: 20}
        }
    })

    test('adds new item to the store', async () => {
        await store.add('Widgets', 'w2', {height: 77, width: 66})
        expect(await store.getById('Widgets', 'w2')).toStrictEqual({height: 77, width: 66})
        expect(await store.getById('Widgets', 'w1')).toStrictEqual({height: 10, width: 20})
    })

    test('returns rejected promise if id already exists', async () => {
        await expect(store.add('Widgets', 'w1', {height: 77, width: 66})).rejects.toHaveProperty('message', `Object with id 'w1' already exists in collection 'Widgets'`)
    })

    test('creates collection if not found', async () => {
        await expect(store.add('Snowballs', 'w1', {height: 77, width: 66})).resolves.toBe(undefined)
        expect(await store.getById('Snowballs', 'w1')).toStrictEqual({height: 77, width: 66})
    })

})

describe('addAll', () => {
    const store = new MemoryDataStore({
        Widgets: {
            w1: {height: 10, width: 20}
        }
    })

    test('adds new items to the store', async () => {
        await store.addAll('Widgets', {w2: {height: 77, width: 66}, w3: {height: 44, width: 55}})
        expect(await store.getById('Widgets', 'w3')).toStrictEqual({height: 44, width: 55})
        expect(await store.getById('Widgets', 'w2')).toStrictEqual({height: 77, width: 66})
        expect(await store.getById('Widgets', 'w1')).toStrictEqual({height: 10, width: 20})
    })

    test('returns rejected promise if any id already exists', async () => {
        await expect(store.addAll('Widgets', {w4: {height: 77, width: 66}, w1: {height: 44, width: 55}})).rejects.toHaveProperty('message', `Object with id 'w1' already exists in collection 'Widgets'`)
    })

    test('creates collection if not found', async () => {
        await expect(store.addAll('Snowballs', {w1: {height: 77, width: 66}})).resolves.toBe(undefined)
        expect(await store.getById('Snowballs', 'w1')).toStrictEqual({height: 77, width: 66})
    })

})

describe('update', () => {
    const store = new MemoryDataStore({
        Widgets: {
            w1: {height: 10, width: 20},
            w9: {height: 30, width: 10, extraSection: { length: 30, diameter: 40}}
        }
    })

    test('updates existing item in the store', async () => {
        await store.update('Widgets', 'w1', {height: 77})
        expect(await store.getById('Widgets', 'w1')).toStrictEqual({height: 77, width: 20})
    })

    test('updates existing item with deep changes', async () => {
        await store.update('Widgets', 'w9', {height: 77, extraSection: {diameter: 50}})
        expect(await store.getById('Widgets', 'w9')).toStrictEqual({height: 77, width: 10, extraSection: { length: 30, diameter: 50}})
    })

    test('returns rejected promise if id does not exists', async () => {
        await expect(store.update('Widgets', 'xxx', {height: 77, width: 66})).rejects.toHaveProperty('message', `Object with id 'xxx' not found in collection 'Widgets'`)
    })

    test('returns rejected promise if collection not found', async () => {
        await expect(store.update('Snowballs', 'w1', {height: 77, width: 66})).rejects.toHaveProperty('message', `Collection 'Snowballs' not found`)
    })

})

describe('remove', () => {
    const store = new MemoryDataStore({
        Widgets: {
            w1: {height: 10, width: 20}
        }
    })

    test('removes existing item from the store', async () => {
        await store.remove('Widgets', 'w1')
        await expect(store.getById('Widgets', 'w1')).rejects.toHaveProperty('message', `Object with id 'w1' not found in collection 'Widgets'`)
    })

    test('returns rejected promise if id does not exists', async () => {
        await expect(store.remove('Widgets', 'xxx')).rejects.toHaveProperty('message', `Object with id 'xxx' not found in collection 'Widgets'`)
    })

    test('returns rejected promise if collection not found', async () => {
        await expect(store.remove('Snowballs', 'w1')).rejects.toHaveProperty('message', `Collection 'Snowballs' not found`)
    })

})
