import {valueObj} from '../testutil/testHelpers'
import dataFunctions from '../../src/runtime/dataFunctions'

const mockFn = jest.fn()
const {Update, Add, AddAll, Remove, Get, GetAll} = dataFunctions

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
        Add(elementState, {id: 'x3', a: 50, b: 'Bee'})
        expect(elementState.Add).toBeCalledWith({id: 'x3', a: 50, b: 'Bee'})
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
        AddAll(elementState, [{id: 'x3', a: 50, b: 'Bee'}, {id: 'x4', a: 60, b: 'Been'}])
        expect(elementState.AddAll).toBeCalledWith([{id: 'x3', a: 50, b: 'Bee'}, {id: 'x4', a: 60, b: 'Been'}])
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
        Remove(elementState, 'x3')
        expect(elementState.Remove).toBeCalledWith('x3')
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
        Update(elementState, 'x1', {a: 50, b: 'Bee'})
        expect(elementState.Update).toBeCalledWith('x1', {a: 50, b: 'Bee'})
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

describe('GetAll', () => {
    test('gets all objects', () => {
        const elementState = {value: {}, GetAll: mockFn.mockReturnValue([{a: 50, b: 'Bee'}, {c: 30}])}
        const result = GetAll(elementState)
        expect(result).toStrictEqual([{a: 50, b: 'Bee'}, {c: 30}])
        expect(elementState.GetAll).toBeCalledWith()
    })
})
