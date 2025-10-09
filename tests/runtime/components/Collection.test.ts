/**
 * @vitest-environment jsdom
 */

import {beforeEach, describe, expect, MockedFunction, test, vi} from 'vitest'
import {Collection} from '../../../src/runtime/components/index'
import {
    asAny,
    createStateFn,
    getCallArg,
    mockClear,
    mockImplementation,
    snapshot,
    testAppInterfaceNew as testAppInterface,
    wrappedTestElement
} from '../../testutil/testHelpers'
import {render} from '@testing-library/react'
import DataStore, {
    Add,
    ErrorResult,
    InvalidateAll,
    isPending,
    MultipleChanges,
    pending,
    Remove,
    Update,
    UpdateNotification
} from '../../../src/shared/DataStore'
import SendObservable from '../../../src/util/SendObservable'
import {CollectionState} from '../../../src/runtime/components/Collection'
import {actWait} from '../../testutil/rtlHelpers'
import * as authentication from '../../../src/runtime/components/authentication'
import {noop} from 'lodash'

let dataStore: DataStore
let testObservable: SendObservable<UpdateNotification>

vi.mock('../../../src/runtime/components/authentication')

const mockDataStore = (): DataStore => ({
    getById: vi.fn(),
    add: vi.fn().mockResolvedValue(undefined),
    addAll: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    observable: vi.fn().mockImplementation(() => testObservable),
    query: vi.fn()
})

const [collection] = wrappedTestElement(Collection)
const createState = createStateFn(CollectionState)

beforeEach(() => {
    testObservable = new SendObservable<UpdateNotification>()
    return dataStore = mockDataStore()
})

const initState = (initialCollection: object): CollectionState => {
    return createState({value: initialCollection, dataStore, collectionName: 'Widgets'})
}

const calls = (fn: any) => (fn as MockedFunction<any>).mock.calls

test('produces output with simple values',
    snapshot(collection('app.page1.collection1', {value: ['green', 'blue'], display: true}))
)

test('produces output with record values',
    snapshot(collection('app.page1.collection2', {value: [{id: 'a1', a: 10, b: 'Bee1', c: true}, {id: 'a2', a: 11}], display: true}))
)

test('produces empty output with default value for display', () => {
    const {container} = render(collection('app.page1.collection3', {value: ['green', 'blue']}))
    expect(container.innerHTML).toBe('')
})

test('gets initial values from array using id property', () => {
    const state = new CollectionState({value: [{id: 27, a: 10}, {id: 'xxx123', a: 20}]})
    expect(state.value).toStrictEqual({
        '27': {id: 27, a: 10},
        'xxx123': {id: 'xxx123', a: 20},
    })
})

test('gets initial values from array using generated id if not present in object', () => {
    const state = new CollectionState({value: [{a: 10}, {a: 20}]})
    const keys = Object.keys(state.value)
    keys.forEach(key => expect(key).toMatch(/\d+/))
    expect(Object.values(state.value)).toStrictEqual([{id: keys[0], a: 10}, {id: keys[1], a: 20},])
})

test('gets initial values from array using simple value as id', () => {
    const state = new CollectionState({value: ['green', 'Blue', 27]})
    expect(state.value).toStrictEqual({
        'green': 'green',
        'Blue': 'Blue',
        '27': 27,
    })
})

test('gets initial values from an object', () => {
    const initialValues = {
        green: true,
        27: {a: 10},
        'xxx-123': 'here'
    }
    const state = new CollectionState({value: initialValues})
    expect(state.value).toStrictEqual({
        'green': true,
        '27': {a: 10},
        'xxx-123': 'here'
    })
    expect(state.value).not.toBe(initialValues)
})

test('gets initial value of empty object from undefined', () => {
    const state = createState({})
    expect(state.value).toStrictEqual({})
})

test('gets initial value of empty object from null', () => {
    const state = createState({value: null})
    expect(state.value).toStrictEqual({})
})

test('gets initial value of empty object from other value', () => {
    const state = createState({value: 'randomString'})
    expect(state.value).toStrictEqual({})
})

test('valueOf returns the values as an array', () => {
    const state = new CollectionState({value: ['green', 'Blue']})
    expect(state.valueOf()).toStrictEqual(['green', 'Blue'])
})

describe('Update', () => {
    const initialCollection = {
        x1: {id: 'x1', a: 10},
        x2: {id: 'x2', a: 20},
    }

    test('updates state correctly', () => {
        const state = createState({value: initialCollection})
        state.Update('x1', {a: 20, b: 'Cee'})
        expect(state.latest().value).toStrictEqual({
                x1: {id: 'x1', a: 20, b: 'Cee'},
                x2: {id: 'x2', a: 20},
            }
        )
    })

    test('cannot update id', () => {
        const state = createState({value: initialCollection})
        state.Update('x1', {id: 'xxx333', a: 50, b: 'Bee'})
        expect(state.latest().value).toStrictEqual({
            x1: {id: 'x1', a: 50, b: 'Bee'},
            x2: {id: 'x2', a: 20},
        })
    })
})

describe('Add', () => {
    const initialCollection = {
        x1: {id: 'x1', a: 10},
        x2: {id: 'x2', a: 20},
    }

    test('inserts a new object with id into a collection', () => {
        const state = createState({value: initialCollection})
        const result = state.Add({id: 'x3', a: 30})
        expect(result).toStrictEqual({id: 'x3', a: 30})
        expect(state.latest().value).toStrictEqual({
            x1: {id: 'x1', a: 10},
            x2: {id: 'x2', a: 20},
            x3: {id: 'x3', a: 30},
        })
    })

    test('inserts a new item without id into a collection and adds the id', () => {
        const state = createState({value: {}})
        const result = state.Add({a: 30})
        const newState = state.latest()
        const entries = Object.entries(newState.value)
        expect(entries.length).toBe(1)
        const [key, value] = entries[0]
        expect(Number(key)).toBeGreaterThan(0)
        expect(value).toStrictEqual({id: key, a: 30})
        expect(result).toStrictEqual(value)
    })

    test('inserts a new simple value into a collection', () => {
        const state = createState({value: initialCollection})
        const result = state.Add('green')
        expect(state.latest().value).toStrictEqual({
            x1: {id: 'x1', a: 10},
            x2: {id: 'x2', a: 20},
            green: 'green',
        })
        expect(result).toBe('green')
    })

    test('inserts multiple objects into a collection', () => {
        const state = createState({value: initialCollection})
        const result = state.Add([{id: 'x3', a: 30}, {id: 'x4', a: 40}])
        expect(result).toBeUndefined()
        expect(state.latest().value).toStrictEqual({
            x1: {id: 'x1', a: 10},
            x2: {id: 'x2', a: 20},
            x3: {id: 'x3', a: 30},
            x4: {id: 'x4', a: 40},
        })
    })

    test('inserts multiple objects without ids into a collection', () => {
        const state = createState({})
        state.Add([{a: 30}, {a: 40}, {a: 50}])
        const newState = state.latest()
        const entries = Object.entries(newState.value)
        expect(entries.length).toBe(3)
        const [key0] = entries[0]
        const [key1] = entries[1]
        const [key2, value2] = entries[2]
        expect(Number(key0)).toBeGreaterThan(0)
        expect(Number(key1)).toBeGreaterThan(Number(key0))
        expect(Number(key2)).toBeGreaterThan(Number(key1))
        expect(value2).toStrictEqual({id: key2, a: 50})
    })

    test('inserts multiple simple values into a collection', () => {
        const state = createState({value: initialCollection})
        state.Add(['green', 'blue'])
        expect(state.latest().value).toStrictEqual({
            x1: {id: 'x1', a: 10},
            x2: {id: 'x2', a: 20},
            green: 'green',
            blue: 'blue',
        })
    })
})

describe('Remove', () => {
    const initialCollection = {
        x1: {id: 'x1', a: 10},
        x2: {id: 'x2', a: 20},
    }

    test('removes an item from a collection', () => {
        const state = createState({value: initialCollection})
        state.Remove('x1')
        const newState = state.latest()
        expect(newState.value).toStrictEqual({
            x2: {id: 'x2', a: 20},
        })
    })
})

describe('Get', () => {
    test('get object by id from collection', () => {
        const initialCollection = {
            x1: {id: 'x1', a: 10},
            x2: {id: 'x2', a: 20},
        }
        const state = new Collection.State({value: initialCollection})
        expect(state.Get('x1')).toStrictEqual({id: 'x1', a: 10})
    })

    test('get simple value as id from collection', () => {
        const initialCollection = {
            green: 'green',
            blue: 'blue',
            99: 99
        }
        const state = new Collection.State({value: initialCollection})
        expect(state.Get('green')).toBe('green')
        expect(state.Get(99)).toBe(99)
    })

    test('get null for non-existent id from collection', () => {
        const initialCollection = {
            green: 'green',
            blue: 'blue',
        }
        const state = new Collection.State({value: initialCollection})
        expect(state.Get('red')).toBeNull()
    })
})

describe('Add with external datastore', () => {

    test('makes correct update when not in cache', async () => {
        const state = initState({})

        const item = {id: 'x1', a: 20, b: 'Cee'}
        const result = state.Add(item)
        expect(state.latest().value).toStrictEqual({
            x1: {id: 'x1', a: 20, b: 'Cee'},
        })

        expect(dataStore.add).toHaveBeenCalledWith('Widgets', 'x1', {id: 'x1', a: 20, b: 'Cee'})
        await expect(result).resolves.toStrictEqual(item)
    })

    test('makes correct update for item without id', async () => {
        const state = initState({});

        const result = state.Add({a: 20, b: 'Cee'})
        expect(dataStore.add).toHaveBeenCalled()
        const mock = (dataStore.add as MockedFunction<any>).mock

        const newId: any = mock.calls[0][1]
        const newItem: any = mock.calls[0][2]
        expect(newItem.id).toBe(newId)
        expect(Number(newId)).toBeGreaterThan(0)
        expect(state.latest().value).toStrictEqual({
            [newId]: {id: newId, a: 20, b: 'Cee'},
        })
        await expect(result).resolves.toStrictEqual({id: newId, a: 20, b: 'Cee'})
    })

    test('makes correct update for simple value', async () => {
        const state = initState({});

        const result = state.Add('green')
        expect(dataStore.add).toHaveBeenCalledWith('Widgets', 'green', 'green')
        expect(state.latest().value).toStrictEqual({
            green: 'green',
        })
        await expect(result).resolves.toBe('green')
    })

    test('makes correct update for multiple items when not in cache', async () => {
        const state = initState({});

        const result = state.Add([{id: 'x1', a: 20, b: 'Cee'}, {id: 'x2', a: 30, b: 'Dee'}])
        expect(state.latest().value).toStrictEqual({
            x1: {id: 'x1', a: 20, b: 'Cee'},
            x2: {id: 'x2', a: 30, b: 'Dee'},
        })

        expect(dataStore.addAll).toHaveBeenCalledWith('Widgets', {
            x1: {id: 'x1', a: 20, b: 'Cee'},
            x2: {id: 'x2', a: 30, b: 'Dee'},
        })

        await expect(result).resolves.toStrictEqual({
            x1: {id: 'x1', a: 20, b: 'Cee'},
            x2: {id: 'x2', a: 30, b: 'Dee'},
        })
    })
})

describe('Update with external datastore', () => {

    test('makes correct update when not in cache', async () => {
        const state = initState({});

        const result = state.Update('x1', {a: 20, b: 'Cee'})
        expect(dataStore.update).toHaveBeenCalledWith('Widgets', 'x1', {a: 20, b: 'Cee'})
        expect(state.latest()._raw).toBe(state._raw)
        await expect(result).resolves.toBeUndefined()
    })

    test('makes correct update when already in cache', async () => {
        const state = initState({x1: {id: 'x1', a: 10}});

        const result = state.Update('x1', {a: 20, b: 'Cee'})
        expect(dataStore.update).toHaveBeenCalledWith('Widgets', 'x1', {a: 20, b: 'Cee'})
        expect(state.latest().value).toStrictEqual({
            x1: {id: 'x1', a: 20, b: 'Cee'},
        })
        await expect(result).resolves.toBeUndefined()
    })

    test('cannot update id', () => {
        const state = initState({x1: {id: 'x1', a: 10}});

        state.Update('x1', {id: 'xxx333', a: 20, b: 'Cee'})
        expect(dataStore.update).toHaveBeenCalledWith('Widgets', 'x1', {a: 20, b: 'Cee'})
        expect(state.latest().value).toStrictEqual({
            x1: {id: 'x1', a: 20, b: 'Cee'},
        })
    })
})

describe('Remove with external datastore', () => {

    test('returns correct update when not in cache', async () => {
        const state = initState({});

        const result = state.Remove('x1')
        expect(dataStore.remove).toHaveBeenCalledWith('Widgets', 'x1')
        expect(state.latest()._raw).toBe(state._raw)
        await expect(result).resolves.toBeUndefined()
    })

    test('returns correct update when already in cache', async () => {
        const state = initState({x1: {id: 'x1', a: 10}, x2: {id: 'x2', a: 20}});

        const result = state.Remove('x1')
        expect(dataStore.remove).toHaveBeenCalledWith('Widgets', 'x1')
        expect(state.latest().value).toStrictEqual({
            x2: {id: 'x2', a: 20},
        })
        await expect(result).resolves.toBeUndefined()
    })
})

describe('Get with external datastore', () => {

    test('get object by id when not in cache', async () => {
        const state = initState({});
        (dataStore.getById as MockedFunction<any>).mockResolvedValue({a: 10, b: 'Bee'})
        const initialResult = state.Get('x1')
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x1', false)
        expect(isPending(initialResult)).toBe(true)
        expect(isPending(asAny(state.latest().value).x1)).toBe(true)
        await expect(initialResult).resolves.toStrictEqual({a: 10, b: 'Bee'})

        await actWait()
        expect(state.latest().value).toStrictEqual({
            x1: {a: 10, b: 'Bee'}
        })
    })

    test('get null for non-existent object by id when not in cache', async () => {
        const state = initState({});
        (dataStore.getById as MockedFunction<any>).mockResolvedValue(null)
        const initialResult = state.Get('x1', true)
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x1', true)
        expect(isPending(initialResult)).toBe(true)
        expect(isPending(asAny(state.latest().value).x1)).toBe(true)
        await expect(initialResult).resolves.toBe(null)

        await actWait()
        expect(state.latest().value).toStrictEqual({
            x1: null
        })
    })

    test('get object by id puts error in cache', async () => {
        const state = initState({});
        (dataStore.getById as MockedFunction<any>).mockResolvedValue(new ErrorResult('Some', 'problem'))
        const initialResult = state.Get('x1')
        expect(isPending(initialResult)).toBe(true)
        expect(isPending(asAny(state.latest().value).x1)).toBe(true)
        await expect(initialResult).resolves.toStrictEqual(new ErrorResult('Some', 'problem'))
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x1', false)

        await actWait()
        expect(state.latest().value).toStrictEqual({
            x1: new ErrorResult('Some', 'problem')
        })
    })

    test('get object by id when in cache', async () => {
        const initialCollection = {
            x1: {id: 'x1', a: 10},
            x2: pending(Promise.resolve(42)),
        }
        const state = initState(initialCollection);
        expect(state.Get('x1')).toStrictEqual({id: 'x1', a: 10})
        expect(isPending(state.Get('x2'))).toBe(true)
        expect(dataStore.getById).not.toHaveBeenCalled()
    })

    test('get null for non-existent object by id when in cache', async () => {
        const initialCollection = {
            x1: null,
            x2: pending(Promise.resolve(null)),
        }
        const state = initState(initialCollection);
        expect(state.Get('x1')).toBe(null)
        expect(isPending(state.Get('x2'))).toBe(true)
        await expect(state.Get('x2')).resolves.toBe(null)
        expect(dataStore.getById).not.toHaveBeenCalled()
    })

    test('gets pending when already requested in same render', async () => {
        const state = initState({});
        (dataStore.getById as MockedFunction<any>).mockResolvedValue({a: 10, b: 'Bee'})
        const result = state.Get('x1')
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x1', false)
        expect(isPending(result)).toBe(true)

        const result2 = state.Get('x1')
        expect(isPending(result2)).toBe(true)
        expect(dataStore.getById).toHaveBeenCalledTimes(1)
    })

    test('get two objects together when not in cache', async () => {
        const state = initState({});
        (dataStore.getById as MockedFunction<any>)
            .mockResolvedValueOnce({a: 10, b: 'Bee'})
            .mockResolvedValueOnce({a: 20, b: 'Cee'})

        state.Get('x1')
        state.Get('x2', false)
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x1', false)
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x2', false)
        expect(isPending(state.Get('x1'))).toBe(true)
        expect(isPending(state.Get('x2'))).toBe(true)
        await actWait()
        expect(state.latest().value).toStrictEqual({
            x1: {a: 10, b: 'Bee'},
            x2: {a: 20, b: 'Cee'},
        })
    })
})

describe('Query with external datastore', () => {

    test('query when not in cache', async () => {
        const state = initState({});
        (dataStore.query as MockedFunction<any>).mockResolvedValue([{id: 'a1', a: 10, b: 'Bee'}])

        const result = state.Query({a: 10, c: false})
        expect(dataStore.query).toHaveBeenCalledWith('Widgets', {a: 10, c: false})
        expect(isPending(result)).toBe(true)
        expect(isPending((state.latest() as any).queries['{"a":10,"c":false}'])).toBe(true)
        await expect(result).resolves.toStrictEqual([{id: 'a1', a: 10, b: 'Bee'}])

        expect(state.latest()._stateForTest.queries).toStrictEqual({
            '{"a":10,"c":false}': [{id: 'a1', a: 10, b: 'Bee'}]
        })
    })

    test('query when in cache', async () => {
        const state = createState({value: {}, dataStore, collectionName: 'Widgets'})._withStateForTest({
            queries: {
                '{"a":10,"c":false}': [{id: 'a1', a: 10, b: 'Bee'}]
            }
        })
        expect(state.Query({a: 10, c: false})).toStrictEqual([{id: 'a1', a: 10, b: 'Bee'}])
        expect(dataStore.query).not.toHaveBeenCalled()
    })

    test('query returns error and puts in cache', async () => {
        const state = initState({});
        (dataStore.query as MockedFunction<any>).mockResolvedValue(new ErrorResult('Some', 'problem'))
        const result = state.Query({a: 10})
        expect(isPending(result)).toBe(true)
        await expect(result).resolves.toStrictEqual(new ErrorResult('Some', 'problem'))

        expect(state.latest()._stateForTest.queries).toStrictEqual({
            '{"a":10}': new ErrorResult("Some", "problem")
        })
    })

    test('get pending result when already requested same query in same render', async () => {
        const state = initState({});
        (dataStore.query as MockedFunction<any>).mockResolvedValue([{id: 'a1', a: 10, b: 'Bee'}])

        const result = state.Query({a: 10, c: false})
        expect(isPending(result)).toBe(true)

        const result2 = state.Query({a: 10, c: false})
        expect(isPending(result2)).toBe(true)
        expect(dataStore.query).toHaveBeenCalledTimes(1)
    })

    test('two queries together when not in cache', async () => {
        const state = initState({});
        (dataStore.query as MockedFunction<any>)
            .mockResolvedValueOnce([{id: 'a1', a: 10, b: 'Bee'}])
            .mockResolvedValueOnce([{id: 'a2', a: 20, b: 'Cee'}])

        state.Query({a: 10, c: false})
        state.Query({a: 20})
        expect(dataStore.query).toHaveBeenCalledWith('Widgets', {a: 10, c: false})
        expect(dataStore.query).toHaveBeenCalledWith('Widgets', {a: 20})
        expect(isPending(state.Query({a: 10, c: false}))).toBe(true)
        expect(isPending(state.Query({a: 20}))).toBe(true)

        await actWait()
        expect(state.latest()._stateForTest.queries).toStrictEqual({
            '{"a":10,"c":false}': [{id: 'a1', a: 10, b: 'Bee'}],
            '{"a":20}': [{id: 'a2', a: 20, b: 'Cee'}],
        })
    })

    test('query does not lose overlapping get', async () => {
        const state = initState({});
        (dataStore.query as MockedFunction<any>)
            .mockResolvedValueOnce([{id: 'a1', a: 10, b: 'Bee'}]);
        (dataStore.getById as MockedFunction<any>)
            .mockResolvedValueOnce({a: 10, b: 'Bee'})


        state.Get('x1')
        state.Query({a: 20})
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x1', false)
        expect(dataStore.query).toHaveBeenCalledWith('Widgets', {a: 20})
        expect(isPending(state.latest().Get('x1'))).toBe(true)
        expect(isPending(state.latest().Query({a: 20}))).toBe(true)

        await actWait()
        expect(state.latest().Get('x1')).toStrictEqual({a: 10, b: 'Bee'})
        expect(state.latest().Query({a: 20})).toStrictEqual([{id: 'a1', a: 10, b: 'Bee'}])
        expect(state.latest().value).toStrictEqual({
            x1: {a: 10, b: 'Bee'},
        })
        expect(state.latest()._stateForTest.queries).toStrictEqual({
            '{"a":20}': [{id: 'a1', a: 10, b: 'Bee'}],
        })
    })
})

describe('subscribe with external data store', () => {

    test('subscribes to data store observable when not in the state', () => {
        const state = initState({});
        expect(dataStore.observable).toHaveBeenCalledWith('Widgets')
        expect(state._stateForTest.subscription).not.toBeUndefined()
        expect(state._stateForTest.subscribedDataStore).toBe(dataStore)
    })

    test('uses same subscription when already in the state', () => {
        const subscription = {unsubscribe: vi.fn()}
        const state = new CollectionState({value: {}, dataStore, collectionName: 'Widgets'})._withStateForTest({
            subscription,
            subscribedDataStore: dataStore
        })
        const appInterface = testAppInterface('testPath', state)
        expect(dataStore.observable).not.toHaveBeenCalled()
        expect(subscription.unsubscribe).not.toHaveBeenCalled()
        expect(appInterface.updateVersion).not.toHaveBeenCalled()
    })

    test('changes subscription when data store changes', () => {
        const newDataStore = mockDataStore()
        const subscription = {unsubscribe: vi.fn()}
        const state = new CollectionState({value: {}, dataStore: newDataStore, collectionName: 'Widgets'})._withStateForTest({
            subscription,
            subscribedDataStore: dataStore
        })
        const appInterface = testAppInterface('testPath', state)
        expect(newDataStore.observable).toHaveBeenCalledWith('Widgets')
        expect(subscription.unsubscribe).toHaveBeenCalled()
        expect(appInterface.updateVersion).not.toHaveBeenCalled()
    })

    test('clears data and queries when subscription receives InvalidateAll', () => {
        const state = new CollectionState({value: {}, dataStore, collectionName: 'Widgets'})._withStateForTest({
            value: {id1: {a: 10}},
            queries: {'{"a":10}': [{a: 10}]}
        })
        const appInterface = testAppInterface('testPath', state)

        testObservable.send({collection: 'Widgets', type: InvalidateAll})
        expect(appInterface.updateVersion).toHaveBeenCalledWith({value: {}, queries: {}})
    })

    test('clears queries when subscription receives Multiple Changes', () => {
        const state = new CollectionState({value: {}, dataStore, collectionName: 'Widgets'})._withStateForTest({
            value: {id1: {a: 10}},
            queries: {'{"a":10}': [{a: 10}]}
        })
        const appInterface = testAppInterface('testPath', state);

        testObservable.send({collection: 'Widgets', type: MultipleChanges})
        expect(appInterface.updateVersion).toHaveBeenCalledWith({queries: {}})
    })

    test('clears queries without losing later Get when subscription receives Multiple Changes', async () => {
        const state = new CollectionState({value: {}, dataStore, collectionName: 'Widgets'})._withStateForTest({
            value: {},
            queries: {'{"a":10}': [{a: 10}]}
        })
        const appInterface = testAppInterface('testPath', state);
        (dataStore.getById as MockedFunction<any>)
            .mockResolvedValueOnce({a: 10, b: 'Bee'});

        state.Get('x1')
        await actWait()
        testObservable.send({collection: 'Widgets', type: MultipleChanges})
        await actWait()
        expect(state.latest().Get('x1')).toStrictEqual({a: 10, b: 'Bee'})
        expect(appInterface.updateVersion).toHaveBeenCalledWith({
            queries: {}
        })
        expect(appInterface.updateVersion).toHaveBeenCalledWith({
            value: {x1: {a: 10, b: 'Bee'}}
        })
    })

    test('updates queries and item cache when update item that is in the item cache', () => {
        const state = new CollectionState({value: {}, dataStore, collectionName: 'Widgets'})._withStateForTest({
            value: {w1: {id: 'w1', a: 10, b: true, c: 'Foo'}, w2: {id: 'w2', a: 10, b: false, c: 'Bar'}},
            queries: {
                '{"a":10}': [
                    {id: 'w1', a: 10, b: true, c: 'Foo'},
                    {id: 'w2', a: 10, b: false, c: 'Bar'}
                ],
                '{"b":true}': [{id: 'w1', a: 10, b: true, c: 'Foo'}],
                '{"b":false}': [{id: 'w2', a: 10, b: false, c: 'Bar'}]
            }
        })
        const appInterface = testAppInterface('testPath', state);
        testObservable.send({collection: 'Widgets', type: Update, id: 'w2', changes: {c: 'Beep'}})

        expect(appInterface.updateVersion).toHaveBeenCalledTimes(1)
        const changes = getCallArg(appInterface.updateVersion, 0)
        expect(changes.value).toStrictEqual({w1: {id: 'w1', a: 10, b: true, c: 'Foo'}, w2: {id: 'w2', a: 10, b: false, c: 'Beep'}})
        expect(changes.queries).toStrictEqual({
                '{"a":10}': [
                    {id: 'w1', a: 10, b: true, c: 'Foo'},
                    {id: 'w2', a: 10, b: false, c: 'Beep'}
                ],
                '{"b":true}': [{id: 'w1', a: 10, b: true, c: 'Foo'}],
                '{"b":false}': [{id: 'w2', a: 10, b: false, c: 'Beep'}],
            }
        )
    })

    test('updates only queries when update item that is not in the item cache', () => {
            const state = new CollectionState({value: {}, dataStore, collectionName: 'Widgets'})._withStateForTest({
                value: {w1: {id: 'w1', a: 10, b: true, c: 'Foo'}},
                queries: {
                    '{"a":10}': [
                        {id: 'w1', a: 10, b: true, c: 'Foo'},
                        {id: 'w2', a: 10, b: false, c: 'Bar'}
                    ]
                }
            })
            const appInterface = testAppInterface('testPath', state);
            testObservable.send({collection: 'Widgets', type: Update, id: 'w2', changes: {c: 'Beep'}})

            expect(appInterface.updateVersion).toHaveBeenCalledTimes(1)
            const changes = getCallArg(appInterface.updateVersion, 0)
            expect(changes.value).toStrictEqual({w1: {id: 'w1', a: 10, b: true, c: 'Foo'}})
            expect(changes.queries).toStrictEqual({
                '{"a":10}': [
                    {id: 'w1', a: 10, b: true, c: 'Foo'},
                    {id: 'w2', a: 10, b: false, c: 'Beep'}
                ]
            })
        }
    )

    test('removes from queries and item cache when delete item that is in the item cache', () => {
        const state = new CollectionState({value: {}, dataStore, collectionName: 'Widgets'})._withStateForTest({
            value: {w1: {id: 'w1', a: 10, b: true, c: 'Foo'}, w2: {id: 'w2', a: 10, b: false, c: 'Bar'}},
            queries: {
                '{"a":10}': [
                    {id: 'w1', a: 10, b: true, c: 'Foo'},
                    {id: 'w2', a: 10, b: false, c: 'Bar'}
                ],
                '{"b":true}': [{id: 'w1', a: 10, b: true, c: 'Foo'}],
                '{"b":false}': [{id: 'w2', a: 10, b: false, c: 'Bar'}]
            }
        })
        const appInterface = testAppInterface('testPath', state);
        testObservable.send({collection: 'Widgets', type: Remove, id: 'w2'})

        expect(appInterface.updateVersion).toHaveBeenCalledTimes(1)
        const changes = getCallArg(appInterface.updateVersion, 0)
        expect(changes.value).toStrictEqual({w1: {id: 'w1', a: 10, b: true, c: 'Foo'}})
        expect(changes.queries).toStrictEqual({
                '{"a":10}': [
                    {id: 'w1', a: 10, b: true, c: 'Foo'},
                ],
                '{"b":true}': [{id: 'w1', a: 10, b: true, c: 'Foo'}],
                '{"b":false}': [],
            }
        )
    })

    test('inserts or removes from queries when update item that is in the item cache', () => {
        const state = new CollectionState({value: {}, dataStore, collectionName: 'Widgets'})._withStateForTest({
            value: {w1: {id: 'w1', a: 10, b: true, c: 'Foo'}, w2: {id: 'w2', a: 10, b: false, c: 'Bar'}},
            queries: {
                '{"a":10}': [
                    {id: 'w1', a: 10, b: true, c: 'Foo'},
                    {id: 'w2', a: 10, b: false, c: 'Bar'}
                ],
                '{"b":true}': [{id: 'w1', a: 10, b: true, c: 'Foo'}],
                '{"b":false}': [{id: 'w2', a: 10, b: false, c: 'Bar'}]
            }
        })
        const appInterface = testAppInterface('testPath', state);
        testObservable.send({collection: 'Widgets', type: Update, id: 'w2', changes: {b: true}})

        expect(appInterface.updateVersion).toHaveBeenCalledTimes(1)
        const changes = getCallArg(appInterface.updateVersion, 0)
        expect(changes.value).toStrictEqual({w1: {id: 'w1', a: 10, b: true, c: 'Foo'}, w2: {id: 'w2', a: 10, b: true, c: 'Bar'}})
        expect(changes.queries).toStrictEqual({
                '{"a":10}': [
                    {id: 'w1', a: 10, b: true, c: 'Foo'},
                    {id: 'w2', a: 10, b: true, c: 'Bar'}
                ],
                '{"b":true}': [{id: 'w1', a: 10, b: true, c: 'Foo'}, {id: 'w2', a: 10, b: true, c: 'Bar'}],
                '{"b":false}': [],
            }
        )
    })

    test('inserts into queries when add an item', () => {
        const state = new CollectionState({value: {}, dataStore, collectionName: 'Widgets'})._withStateForTest({
            value: {w1: {id: 'w1', a: 10, b: true, c: 'Foo'}, w2: {id: 'w2', a: 10, b: false, c: 'Bar'}},
            queries: {
                '{"a":10}': [
                    {id: 'w1', a: 10, b: true, c: 'Foo'},
                    {id: 'w2', a: 10, b: false, c: 'Bar'}
                ],
                '{"b":true}': [{id: 'w1', a: 10, b: true, c: 'Foo'}],
                '{"b":false}': [{id: 'w2', a: 10, b: false, c: 'Bar'}]
            }
        })
        const appInterface = testAppInterface('testPath', state);
        testObservable.send({collection: 'Widgets', type: Add, id: 'w3', changes: {id: 'w3', a: 10, b: true, c: 'Three'}})

        expect(appInterface.updateVersion).toHaveBeenCalledTimes(1)
        const changes = getCallArg(appInterface.updateVersion, 0)
        expect(changes.queries).toStrictEqual({
                '{"a":10}': [
                    {id: 'w1', a: 10, b: true, c: 'Foo'},
                    {id: 'w2', a: 10, b: false, c: 'Bar'},
                    {id: 'w3', a: 10, b: true, c: 'Three'}
                ],
                '{"b":true}': [{id: 'w1', a: 10, b: true, c: 'Foo'}, {id: 'w3', a: 10, b: true, c: 'Three'}],
                '{"b":false}': [{id: 'w2', a: 10, b: false, c: 'Bar'}],
            }
        )
    })
})

describe('subscribe to auth changes', () => {

    beforeEach(() => mockClear(authentication.onAuthChange))

    test('subscribes to onAuthChange when not in the state', () => {
        const state = initState({});
        expect(authentication.onAuthChange).toHaveBeenCalled()
    })

    test('uses same onAuthChange subscription when already in the state', () => {
        const authSubscription = noop
        const dataStore = mockDataStore()
        const state = new CollectionState({value: {}, dataStore, collectionName: 'Widgets'})._withStateForTest({authSubscription})
        const appInterface = testAppInterface('testPath', state)

        expect(authentication.onAuthChange).not.toHaveBeenCalled()
        expect(appInterface.updateVersion).not.toHaveBeenCalled()
    })

    test('clears data and queries on auth change', () => {
        let authCallback: VoidFunction
        mockImplementation(authentication.onAuthChange, (callback: VoidFunction) => authCallback = callback)
        const state = new CollectionState({value: {}, dataStore, collectionName: 'Widgets'})._withStateForTest({
            value: {id1: {a: 10}},
            queries: {'{"a":10}': [{a: 10}]}
        })
        const appInterface = testAppInterface('testPath', state)

        authCallback!()
        expect(appInterface.updateVersion).toHaveBeenCalledWith({value: {}, queries: {}})
    })
})

describe('GetAll', () => {
    test('get all objects collection', () => {
        const initialCollection = {
            x1: {id: 'x1', a: 10},
            x2: {id: 'x2', a: 20},
        }
        const state = createState({value: initialCollection})
        expect(state.GetAll()).toStrictEqual([
            {id: 'x1', a: 10},
            {id: 'x2', a: 20},
        ])
    })

})

describe('Reset', () => {
    const initialCollection = {
        x1: {id: 'x1', a: 10},
        x2: {id: 'x2', a: 20},
    }

    test('removes an item from a collection', () => {
        const state = createState({value: initialCollection})
        state.Remove('x1')
        expect(state.latest().value).toStrictEqual({
            x2: {id: 'x2', a: 20},
        })
    })

    test('clears all objects and restores initial value', () => {
        const state = createState({value: initialCollection})
        state.Remove('x1')
        expect(state.latest().value).toStrictEqual({
                x2: {id: 'x2', a: 20},
        })

        state.Reset()
        expect(state.latest().value).toStrictEqual(initialCollection)
    })
})
