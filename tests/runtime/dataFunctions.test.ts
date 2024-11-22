import {valueObj} from '../testutil/testHelpers'
import dataFunctions from '../../src/runtime/dataFunctions'

const dataStoreResult = "result"
let mockFn: jest.Mock
const {Update, Add, AddAll, Remove, Get, GetIfExists, Query, GetRandomId} = dataFunctions

beforeEach(()=> mockFn = jest.fn().mockResolvedValue(dataStoreResult))

describe('Update single item', () => {
    test('updates object state value', () => {
        const elementState = {value: {foo: 42}, Update: mockFn}
        const changes = {a: 10, b: 'Bee'}
        Update(elementState, changes)
        expect(elementState.Update).toBeCalledWith(changes)
    })
})

describe('Add', () => {

    test('adds an object with id', () => {
        const elementState = {value: {}, Add: mockFn}
        const result = Add(elementState, {id: 'x3', a: 50, b: 'Bee'})
        expect(elementState.Add).toBeCalledWith({id: 'x3', a: 50, b: 'Bee'})
        expect(result).resolves.toBe(dataStoreResult)
    })

    test('uses object value for id', () => {
        const elementState = {value: {}, Add: mockFn}
        Add(elementState, valueObj('green'))
        expect(elementState.Add).toBeCalledWith('green')
    })
})

describe('AddAll', () => {

    test('adds many objects with ids', () => {
        const elementState = {value: {}, AddAll: mockFn}
        const result = AddAll(elementState, [{id: 'x3', a: 50, b: 'Bee'}, {id: 'x4', a: 60, b: 'Been'}])
        expect(elementState.AddAll).toBeCalledWith([{id: 'x3', a: 50, b: 'Bee'}, {id: 'x4', a: 60, b: 'Been'}])
        expect(result).resolves.toBe(dataStoreResult)
    })

    test('uses object value for id', () => {
        const elementState = {value: {}, AddAll: mockFn}
        AddAll(elementState, [valueObj('green'), valueObj('blue')])
        expect(elementState.AddAll).toBeCalledWith(['green', 'blue'])
    })
})

describe('Remove', () => {
    test('removes an object with id', () => {
        const elementState = {value: {}, Remove: mockFn}
        const result = Remove(elementState, 'x3')
        expect(elementState.Remove).toBeCalledWith('x3')
        expect(result).resolves.toBe(dataStoreResult)
    })

    test('uses object value for id', () => {
        const elementState = {value: {}, Remove: mockFn}
        Remove(elementState, valueObj('x3'))
        expect(elementState.Remove).toBeCalledWith('x3')
    })

})

describe('Update item in collection', () => {
    const existingCollection = {}

    test('updates an object by id', () => {
        const elementState = {value: existingCollection, Update: mockFn}
        const result = Update(elementState, 'x1', {a: 50, b: 'Bee'})
        expect(elementState.Update).toBeCalledWith('x1', {a: 50, b: 'Bee'})
        expect(result).resolves.toBe(dataStoreResult)
    })

    test('uses object value for id', () => {
        const elementState = {value: existingCollection, Update: mockFn}
        Update(elementState, valueObj('x1'), {a: 50, b: 'Bee'})
        expect(elementState.Update).toBeCalledWith('x1', {a: 50, b: 'Bee'})
    })
})

describe('Get', () => {
    const existingCollection = {}

    test('gets an object by id', () => {
        const elementState = {value: existingCollection, Get: mockFn.mockReturnValue({a: 50, b: 'Bee'})}
        const result = Get(elementState, 'x1')
        expect(result).toStrictEqual({a: 50, b: 'Bee'})
        expect(elementState.Get).toBeCalledWith('x1')
    })

    test('uses object value for id', () => {
        const elementState = {value: existingCollection, Get: mockFn.mockReturnValue({a: 50, b: 'Bee'})}
        const result = Get(elementState, valueObj('x1'))
        expect(result).toStrictEqual({a: 50, b: 'Bee'})
        expect(elementState.Get).toBeCalledWith('x1')
    })
})

describe('GetIfExists', () => {
    const existingCollection = {}

    test('gets an object by id', () => {
        const elementState = {value: existingCollection, Get: mockFn.mockReturnValue({a: 50, b: 'Bee'})}
        const result = GetIfExists(elementState, 'x1')
        expect(result).toStrictEqual({a: 50, b: 'Bee'})
        expect(elementState.Get).toBeCalledWith('x1', true)
    })

    test('gets null if id is nullish', () => {
        const elementState = {value: existingCollection, Get: mockFn.mockReturnValue({a: 50, b: 'Bee'})}
        const result = GetIfExists(elementState, undefined)
        expect(result).toBe(null)
        expect(elementState.Get).not.toHaveBeenCalled()
    })

    test('gets default if id is nullish', () => {
        const elementState = {value: existingCollection, Get: mockFn.mockReturnValue({a: 50, b: 'Bee'})}
        const result = GetIfExists(elementState, null, {name: 'Ali'})
        expect(result).toStrictEqual({name: 'Ali'})
        expect(elementState.Get).not.toHaveBeenCalled()
    })

    test('gets null if not found', () => {
        const elementState = {value: existingCollection, Get: mockFn.mockReturnValue(null)}
        const result = GetIfExists(elementState, 'x1')
        expect(result).toBe(null)
        expect(elementState.Get).toBeCalledWith('x1', true)
    })

    test('gets default if not found', () => {
        const elementState = {value: existingCollection, Get: mockFn.mockReturnValue(null)}
        const result = GetIfExists(elementState, 'x1', {name: 'Ali'})
        expect(result).toStrictEqual({name: 'Ali'})
        expect(elementState.Get).toBeCalledWith('x1', true)
    })

    test('uses object value for id', () => {
        const elementState = {value: existingCollection, Get: mockFn.mockReturnValue({a: 50, b: 'Bee'})}
        const result = GetIfExists(elementState, valueObj('x1'))
        expect(result).toStrictEqual({a: 50, b: 'Bee'})
        expect(elementState.Get).toBeCalledWith('x1', true)
    })
})

describe('Query', () => {
    test('gets query results', () => {
        const elementState = {value: {}, Query: mockFn.mockReturnValue([{a: 50, b: 'Bee'}, {c: 30}])}
        const result = Query(elementState, valueObj({p: 10}))
        expect(result).toStrictEqual([{a: 50, b: 'Bee'}, {c: 30}])
        expect(elementState.Query).toBeCalledWith({p: 10})
    })
})

describe('GetRandomId', () => {
    test('gets a random id', () => {
        expect(GetRandomId()).toMatch(/^\d{13}-[a-z0-9]{4}$/)
    })
})
