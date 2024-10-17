import {components} from '../../src/serverRuntime/index'
import {BasicDataStore} from '../../src/runtime/DataStore'

let dataStore: BasicDataStore
let collection: components.Collection

const mockDataStore = (): BasicDataStore => ({
    getById: jest.fn(),
    add: jest.fn(),
    addAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    query: jest.fn()
})

beforeEach( () => {
    dataStore = mockDataStore()
    collection = new components.Collection({dataStore, collectionName: 'Widgets'})
})

describe('Add', () => {

    test('makes correct update and returns item created', async () => {
        const newItem = await collection.Add({id: 'x1', a:20, b:'Cee'})
        expect(dataStore.add).toHaveBeenCalledWith('Widgets', 'x1', {id: 'x1', a:20, b:'Cee'})
        expect(newItem).toStrictEqual({id: 'x1', a:20, b:'Cee'})
    })

    test('makes correct update for item without id and returns item created', async () => {
        const resultItem = await collection.Add({a:20, b:'Cee'})
        expect(dataStore.add).toHaveBeenCalled()
        const mock = (dataStore.add as jest.MockedFunction<any>).mock

        const newId = mock.calls[0][1]
        const newItem = mock.calls[0][2]
        expect(newItem.id).toBe(newId)
        expect(Number(newId)).toBeGreaterThan(0)
        expect(resultItem).toBe(newItem)
    })

    test('makes correct update for simple value', () => {
        collection.Add('green')
        expect(dataStore.add).toHaveBeenCalledWith('Widgets','green', 'green')
    })

    test('makes correct update for multiple items and returns items created', async () => {
        const results = await collection.Add([{id: 'x1', a:20, b:'Cee'}, {id: 'x2', a:30, b:'Dee'}])
        expect(dataStore.addAll).toHaveBeenCalledWith('Widgets', {
            x1: {id: 'x1', a:20, b:'Cee'},
            x2: {id: 'x2', a:30, b:'Dee'},
        })
        expect(results).toStrictEqual({
            x1: {id: 'x1', a:20, b:'Cee'},
            x2: {id: 'x2', a:30, b:'Dee'},
        })
    })

    test('makes correct update for multiple items without ids and returns items created', async () => {
        const results = await collection.Add([{a:20, b:'Cee'}, {a:30, b:'Dee'}])
        Object.keys(results).forEach( id => {
            expect(Number(id)).toBeGreaterThan(0)
            expect(results[id].id).toBe(id)
        })
    })
})

describe('Update', () => {

    test('makes correct update', () => {
        collection.Update('x1', {a:20, b:'Cee'})
        expect(dataStore.update).toHaveBeenCalledWith('Widgets', 'x1', {a:20, b:'Cee'})
    })

    test('cannot update id', () => {
        collection.Update('x1', {id: 'xxx333', a:20, b:'Cee'})
        expect(dataStore.update).toHaveBeenCalledWith('Widgets', 'x1', {a:20, b:'Cee'})
    })
})

describe('Remove', () => {

    test('makes correct update', () => {
        collection.Remove('x1')
        expect(dataStore.remove).toHaveBeenCalledWith('Widgets', 'x1')
    })

    test('makes correct update', () => {
        collection.Remove('x1')
        expect(dataStore.remove).toHaveBeenCalledWith('Widgets', 'x1')
    })
})

describe('Get', () => {

    test('get object by id', async () => {
        (dataStore.getById as jest.MockedFunction<any>).mockResolvedValue({a: 10, b: 'Bee'})
        const initialResult = await collection.Get('x1')
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x1')
        expect(initialResult).toStrictEqual({a: 10, b: 'Bee'})
    })

    test('get object by id returns error', async () => {
        (dataStore.getById as jest.MockedFunction<any>).mockRejectedValue(new Error('Some problem'))
        let error
        try {
            await collection.Get('x1')
        } catch(e) {
            error = e
        }
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x1')
        expect(error).toStrictEqual(new Error('Some problem'))
    })
})

describe('Query', () => {

    test('query', async () => {
        (dataStore.query as jest.MockedFunction<any>).mockResolvedValue([{id: 'a1', a: 10, b: 'Bee'}])

        const result = await collection.Query({a: 10, c: false})
        expect(result).toStrictEqual([{id: 'a1', a: 10, b: 'Bee'}])
        expect(dataStore.query).toHaveBeenCalledWith('Widgets', {a: 10, c: false})
    })

    test('query returns error', async () => {
        (dataStore.query as jest.MockedFunction<any>).mockRejectedValue(new Error('Some problem'))

        let error
        try {
            await collection.Query({a: 10})
        } catch (e) {
            error = e
        }

        expect(error).toStrictEqual(new Error('Some problem'))
    })
})
