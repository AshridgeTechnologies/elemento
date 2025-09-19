import {expect, test} from "vitest"
import {Page, Collection} from '../testutil/modelHelpers'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

test('Collection has correct properties with default values', ()=> {
    const collection1 = new Collection('id1', 'Collection 1', {})

    expect(collection1.id).toBe('id1')
    expect(collection1.name).toBe('Collection 1')
    expect(collection1.initialValue).toBe(undefined)
    expect(collection1.dataStore).toBe(undefined)
    expect(collection1.collectionName).toBe('Collection1')
    expect(collection1.display).toBe(false)
})

test('Collection has correct properties with specified values', ()=> {
    const collection1 = new Collection('id1', 'Collection 1', {initialValue: ['green', 'blue'], dataStore: ex`dataStore_1`, collectionName: 'Stuffz', display: true})

    expect(collection1.id).toBe('id1')
    expect(collection1.name).toBe('Collection 1')
    expect(collection1.initialValue).toStrictEqual(['green', 'blue'])
    expect(collection1.dataStore).toStrictEqual(ex`dataStore_1`)
    expect(collection1.collectionName).toBe('Stuffz')
    expect(collection1.display).toBe(true)
})

test('tests if an object is this type', ()=> {
    const collection = new Collection('id1', 'Collection 1', {initialValue: ['green', 'blue']})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(Collection.is(collection)).toBe(true)
    expect(Collection.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const collection = new Collection('id1', 'Collection 1', {initialValue: ['green', 'blue'], display: true})
    const updatedCollection1 = collection.set('id1', 'name', 'Collection 1A')
    expect(updatedCollection1.name).toBe('Collection 1A')
    expect(updatedCollection1.initialValue).toStrictEqual(['green', 'blue'])
    expect(collection.name).toBe('Collection 1')
    expect(collection.initialValue).toStrictEqual(['green', 'blue'])

    const updatedCollection2 = updatedCollection1.set('id1', 'initialValue', ex`shazam`)
    expect(updatedCollection2.name).toBe('Collection 1A')
    expect(updatedCollection2.initialValue).toStrictEqual(ex`shazam`)
    expect(updatedCollection1.name).toBe('Collection 1A')
    expect(updatedCollection1.initialValue).toStrictEqual(['green', 'blue'])
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const collection = new Collection('id1', 'Collection 1', {initialValue: ex`['green', 'blue']`})
    const updatedCollection = collection.set('id2', 'name', ex`Collection 1A`)
    expect(updatedCollection).toStrictEqual(collection)
})

test('converts to JSON without optional proerties', ()=> {
    const collection = new Collection('id1', 'Collection 1', {})
    expect(asJSON(collection)).toStrictEqual({
        kind: 'Collection',
        id: 'id1',
        name: 'Collection 1',
        properties: collection.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const collection = new Collection('id1', 'Collection 1', {initialValue: ex`['green', 'blue']`, display: true})
    expect(asJSON(collection)).toStrictEqual({
        kind: 'Collection',
        id: 'id1',
        name: 'Collection 1',
        properties: collection.properties
    })
})

test('converts from plain object', ()=> {
    const collection = new Collection('id1', 'Collection 1', {initialValue: ex`['green', 'blue']`, dataStore: ex`dataStore_1`, collectionName: 'Stuffz', display: ex`false && true`})
    const plainObj = asJSON(collection)
    const newCollection = loadJSON(plainObj)
    expect(newCollection).toStrictEqual<typeof Collection>(collection)

    const collection2 = new Collection('id1', 'Collection 2', {initialValue: ex`[]`, display: false})
    const plainObj2 = asJSON(collection2)
    const newCollection2 = loadJSON(plainObj2)
    expect(newCollection2).toStrictEqual<typeof Collection>(collection2)
})
