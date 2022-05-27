/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {Collection} from '../../../src/runtime/components/index'
import {snapshot} from '../../testutil/testHelpers'
import {render} from '@testing-library/react'
import {ResultWithUpdates, Update, update} from '../../../src/runtime/stateProxy'
import {_DELETE} from '../../../src/runtime/runtimeFunctions'
import DataStore, {
    ErrorResult,
    InvalidateAll,
    InvalidateAllQueries,
    Pending,
    UpdateNotification
} from '../../../src/runtime/DataStore'
import SendObservable from '../../../src/runtime/SendObservable'

const testObservable = new SendObservable<UpdateNotification>()
const mockDataStore = (): DataStore => ({
    getById: jest.fn(),
    add: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    observable: jest.fn().mockImplementation( () => testObservable ),
    query: jest.fn()
})

test('produces output with simple values',
    snapshot(createElement(Collection, {
        state: {value: ['green', 'blue'], _path: 'app.page1.collection1'},
        display: true
    }))
)

test('produces output with record values',
    snapshot(createElement(Collection, {
        state: {
            value: [{a: 10, b: 'Bee1', c: true}, {a: 11}],
            _path: 'app.page1.collection2'
        }, display: true
    }))
)

test('produces empty output with default value for display', () => {
    const {container} = render(createElement(Collection, {
        state: {
            value: ['green', 'blue'],
            _path: 'app.page1.collection3'
        }
    }))
    expect(container.innerHTML).toBe('')
})

test('gets initial values from array using id property', () => {
    const state = new Collection.State({value: [{id: 27, a: 10}, {Id: 'xxx123', a: 20}]})
    expect(state.value).toStrictEqual({
        '27': {id: 27, a: 10},
        'xxx123': {Id: 'xxx123', a: 20},
    })
})

test('gets initial values from array using generated id if not present in object', () => {
    const state = new Collection.State({value: [{a: 10}, {a: 20}]})
    expect(state.value).toStrictEqual({
        '1': {a: 10},
        '2': {a: 20},
    })
})

test('gets initial values from array using simple value as id', () => {
    const state = new Collection.State({value: ['green', 'Blue', 27]})
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
    const state = new Collection.State({value: initialValues})
    expect(state.value).toStrictEqual({
        'green': true,
        '27': {a: 10},
        'xxx-123': 'here'
    })
    expect(state.value).not.toBe(initialValues)
})

test('gets initial value of empty object from undefined', () => {
    const state = new Collection.State({})
    expect(state.value).toStrictEqual({})
})

test('gets initial value of empty object from null', () => {
    const state = new Collection.State({value: null})
    expect(state.value).toStrictEqual({})
})

test('gets initial value of empty object from other value', () => {
    const state = new Collection.State({value: 'randomString'})
    expect(state.value).toStrictEqual({})
})

describe('Update', () => {
    const initialCollection = {
        x1: {id: 'x1', a: 10},
        x2: {id: 'x2', a: 20},
    }

    test('returns correct update', () => {
        const state = new Collection.State({value: initialCollection})

        expect(state.Update('x1', {a:20, b:'Cee'})).toStrictEqual(update({
            value: {
                x1: {a: 20, b: 'Cee'},
            }
        }))
    })

    test('cannot update id', () => {
        const state = new Collection.State({value: initialCollection})

        expect(state.Update('x1', {id: 'xxx333', a: 50, b: 'Bee'})).toStrictEqual(update({
            value: {
                x1: {a: 50, b: 'Bee'},
            }
        }))
    })

})

describe('Add', () => {
    const initialCollection = {
        x1: {id: 'x1', a: 10},
        x2: {id: 'x2', a: 20},
    }
    test('inserts a new object with id into a collection', () => {
        const state = new Collection.State({value: initialCollection})
        expect(state.Add({id: 'x3', a: 30})).toStrictEqual(update({value: {
            x3: {id: 'x3', a: 30},
        }}))
    })

    test('inserts a new item without id into a collection', () => {
        const state = new Collection.State({value: initialCollection})
        const theUpdate = state.Add({a: 30})
        const entries = Object.entries(((theUpdate as Update).changes as any).value)
        expect(entries.length).toBe(1)
        const [key, value] = entries[0]
        expect(Number(key)).toBeGreaterThan(0)
        expect(value).toStrictEqual({a: 30})
    })

    test('inserts a new simple value into a collection', () => {
        const state = new Collection.State({value: initialCollection})
        expect(state.Add('green')).toStrictEqual(update({value: {green: 'green',}}))
        expect(state.Add(27)).toStrictEqual(update({value: {27: 27,}}))
    })

})

describe('Remove', () => {
    const initialCollection = {
        x1: {id: 'x1', a: 10},
        x2: {id: 'x2', a: 20},
    }

    test('removes an item from a collection', () => {
        const state = new Collection.State({value: initialCollection})
        expect(state.Remove('x1')).toStrictEqual(update({value: {x1: _DELETE}}))
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

    test('returns correct update when not in cache', () => {
        const dataStore = mockDataStore()
        const initialCollection = {}
        const state = new Collection.State({value: initialCollection, dataStore, collectionName: 'Widgets'})

        const result = state.Add({id: 'x1', a:20, b:'Cee'}) as ResultWithUpdates
        expect(dataStore.add).toHaveBeenCalledWith('Widgets', 'x1', {id: 'x1', a:20, b:'Cee'})
        expect(result).toBeInstanceOf(ResultWithUpdates)
        expect(result!.result).toBeUndefined()
        expect(result!.syncUpdate).toStrictEqual(update({value: {x1: {id: 'x1', a: 20, b: 'Cee'}}}))
        expect(result!.asyncUpdate).toBeUndefined()
    })

    test('returns correct update for item without id', () => {
        const dataStore = mockDataStore()
        const initialCollection = {}
        const state = new Collection.State({value: initialCollection, dataStore, collectionName: 'Widgets'})

        const result = state.Add({a:20, b:'Cee'}) as ResultWithUpdates
        expect(dataStore.add).toHaveBeenCalled()
        const mock = (dataStore.add as jest.MockedFunction<any>).mock

        const newId = mock.calls[0][1]
        const dataStoreUpdate = mock.calls[0][2]
        expect(dataStoreUpdate.id).toBeUndefined()
        expect(Number(newId)).toBeGreaterThan(0)
        expect(result).toBeInstanceOf(ResultWithUpdates)
        expect(result!.result).toBeUndefined()
        expect(result!.syncUpdate).toStrictEqual(update({value: {[newId]: {a: 20, b: 'Cee'}}}))
        expect(result!.asyncUpdate).toBeUndefined()
    })

    test('returns correct update for simple value', () => {
        const dataStore = mockDataStore()
        const initialCollection = {}
        const state = new Collection.State({value: initialCollection, dataStore, collectionName: 'Widgets'})

        const result = state.Add('green') as ResultWithUpdates
        expect(dataStore.add).toHaveBeenCalledWith('Widgets', 'green', 'green')
        expect(result).toBeInstanceOf(ResultWithUpdates)
        expect(result!.result).toBeUndefined()
        expect(result!.syncUpdate).toStrictEqual(update({value: {green: 'green'}}))
        expect(result!.asyncUpdate).toBeUndefined()
    })

})

describe('Update with external datastore', () => {

    test('returns correct update when not in cache', () => {
        const dataStore = mockDataStore()
        const initialCollection = {}
        const state = new Collection.State({value: initialCollection, dataStore, collectionName: 'Widgets'})

        const result = state.Update('x1', {a:20, b:'Cee'}) as ResultWithUpdates
        expect(dataStore.update).toHaveBeenCalledWith('Widgets', 'x1', {a:20, b:'Cee'})
        expect(result).toBeInstanceOf(ResultWithUpdates)
        expect(result!.result).toBeUndefined()
        expect(result!.syncUpdate).toBeUndefined()
        expect(result!.asyncUpdate).toBeUndefined()
    })

    test('returns correct update when already in cache', () => {
        const dataStore = mockDataStore()
        const initialCollection = {x1: {id: 'x1', a: 10}}
        const state = new Collection.State({value: initialCollection, dataStore, collectionName: 'Widgets'})

        const result = state.Update('x1', {a:20, b:'Cee'}) as ResultWithUpdates
        expect(dataStore.update).toHaveBeenCalledWith('Widgets', 'x1', {a:20, b:'Cee'})
        expect(result).toBeInstanceOf(ResultWithUpdates)
        expect(result!.result).toBeUndefined()
        expect(result!.syncUpdate).toStrictEqual(update({value: {x1: {a: 20, b: 'Cee'}}}))
        expect(result!.asyncUpdate).toBeUndefined()
    })

    test('cannot update id', () => {
        const dataStore = mockDataStore()
        const initialCollection = {x1: {id: 'x1', a: 10}}
        const state = new Collection.State({value: initialCollection, dataStore, collectionName: 'Widgets'})

        const result = state.Update('x1', {id: 'xxx333', a:20, b:'Cee'}) as ResultWithUpdates
        expect(dataStore.update).toHaveBeenCalledWith('Widgets', 'x1', {a:20, b:'Cee'})
        expect(result).toBeInstanceOf(ResultWithUpdates)
        expect(result!.result).toBeUndefined()
        expect(result!.syncUpdate).toStrictEqual(update({value: {x1: {a: 20, b: 'Cee'}}}))
        expect(result!.asyncUpdate).toBeUndefined()
    })

})

describe('Remove with external datastore', () => {

    test('returns correct update when not in cache', () => {
        const dataStore = mockDataStore()
        const initialCollection = {}
        const state = new Collection.State({value: initialCollection, dataStore, collectionName: 'Widgets'})

        const result = state.Remove('x1') as ResultWithUpdates
        expect(dataStore.remove).toHaveBeenCalledWith('Widgets', 'x1')
        expect(result).toBeInstanceOf(ResultWithUpdates)
        expect(result!.result).toBeUndefined()
        expect(result!.syncUpdate).toBeUndefined()
        expect(result!.asyncUpdate).toBeUndefined()
    })

    test('returns correct update when already in cache', () => {
        const dataStore = mockDataStore()
        const initialCollection = {x1: {id: 'x1', a: 10}}
        const state = new Collection.State({value: initialCollection, dataStore, collectionName: 'Widgets'})

        const result = state.Remove('x1') as ResultWithUpdates
        expect(dataStore.remove).toHaveBeenCalledWith('Widgets', 'x1')
        expect(result).toBeInstanceOf(ResultWithUpdates)
        expect(result!.result).toBeUndefined()
        expect(result!.syncUpdate).toStrictEqual(update({value: {x1: _DELETE}}))
        expect(result!.asyncUpdate).toBeUndefined()
    })
})

describe('Get with external datastore', () => {

    test('get object by id when not in cache', async () => {
        const initialCollection = {}
        const dataStore = mockDataStore()
        const state = new Collection.State({value: initialCollection, dataStore, collectionName: 'Widgets'});
        (dataStore.getById as jest.MockedFunction<any>).mockResolvedValue({a: 10, b: 'Bee'})
        const result = state.Get('x1') as ResultWithUpdates
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x1')
        expect(result).toBeInstanceOf(ResultWithUpdates)
        expect(result!.result).toStrictEqual({_type: Pending})
        expect(result!.syncUpdate).toStrictEqual(update({value: {x1: {_type: Pending}}}))
        expect(await result!.asyncUpdate).toStrictEqual(update({
            value: {
                'x1': {
                    _type: _DELETE,
                    a: 10,
                    b: 'Bee'
                }
            }
        }, false)) //TODO replace the data object only
    })

    test('get object by id puts error in cache', async () => {
        const initialCollection = {}
        const dataStore = mockDataStore()
        const state = new Collection.State({value: initialCollection, dataStore, collectionName: 'Widgets'});
        (dataStore.getById as jest.MockedFunction<any>).mockResolvedValue(new ErrorResult('Some', 'problem'))
        const result = state.Get('x1') as ResultWithUpdates
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x1')
        expect(result).toBeInstanceOf(ResultWithUpdates)
        expect(result!.result).toStrictEqual({_type: Pending})
        expect(result!.syncUpdate).toStrictEqual(update({value: {x1: {_type: Pending}}}))
        expect(await result!.asyncUpdate).toStrictEqual(update({
            value: {
                'x1': {
                    _type: ErrorResult,
                    description: 'Some',
                    errorMessage: 'problem'
                }
            }
        }, false))
    })

    test('get object by id when in cache', async () => {
        const initialCollection = {
            x1: {id: 'x1', a: 10},
            x2: {_type: Pending},
        }
        const dataStore = mockDataStore()

        const state = new Collection.State({value: initialCollection, dataStore, collectionName: 'Widgets'})
        expect(state.Get('x1')).toStrictEqual({id: 'x1', a: 10})
        expect(state.Get('x2')).toStrictEqual({_type: Pending})
        expect(dataStore.getById).not.toHaveBeenCalled()
    })

    test('get Pending when already requested in same render', async () => {
        const initialCollection = {}
        const dataStore = mockDataStore()
        const state = new Collection.State({value: initialCollection, dataStore, collectionName: 'Widgets'});
        (dataStore.getById as jest.MockedFunction<any>).mockResolvedValue({a: 10, b: 'Bee'})
        const result = state.Get('x1') as ResultWithUpdates
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x1')
        expect(result).toBeInstanceOf(ResultWithUpdates)
        expect(result!.result).toStrictEqual({_type: Pending})
        expect(result!.syncUpdate).toStrictEqual(update({value: {x1: {_type: Pending}}}))
        expect(await result!.asyncUpdate).toStrictEqual(update({
            value: {
                'x1': {
                    _type: _DELETE,
                    a: 10,
                    b: 'Bee'
                }
            }
        }, false))

        const result2 = state.Get('x1')
        expect(result2).not.toBeInstanceOf(ResultWithUpdates)
        expect(result2).toStrictEqual({_type: Pending})
        expect(dataStore.getById).toHaveBeenCalledTimes(1)
    })

})

describe('Query with external datastore', () => {

    test('query when not in cache', async () => {
        const initialCollection = {}
        const dataStore = mockDataStore()
        const state = new Collection.State({value: initialCollection, dataStore, collectionName: 'Widgets'});
        (dataStore.query as jest.MockedFunction<any>).mockResolvedValue([{id: 'a1', a: 10, b: 'Bee'}])

        const result = state.Query({a: 10, c: false}) as ResultWithUpdates
        expect(dataStore.query).toHaveBeenCalledWith('Widgets', {a: 10, c: false})
        expect(result).toBeInstanceOf(ResultWithUpdates)
        expect(result!.result).toStrictEqual({_type: Pending})
        expect(result!.syncUpdate).toStrictEqual(update({queries: {'{a: 10, c: false}': {_type: Pending}}}))
        const expectedData = [{id: 'a1', a: 10, b: 'Bee'}];
        expect(await result!.asyncUpdate).toStrictEqual(update({
            queries: {
                '{a: 10, c: false}': expectedData
            }
        }, false))
    })

    test('query when in cache', async () => {
        const dataStore = mockDataStore()

        const state = new Collection.State({value: {}, dataStore, collectionName: 'Widgets',
                                            queries: {
                                                '{a: 10, c: false}': [{id: 'a1', a: 10, b: 'Bee'}]
                                            }})
        expect(state.Query({a: 10, c: false})).toStrictEqual([{id: 'a1', a: 10, b: 'Bee'}])
        expect(dataStore.query).not.toHaveBeenCalled()
    })

    test('query puts error in cache', async () => {
        const initialCollection = {}
        const dataStore = mockDataStore()
        const state = new Collection.State({value: initialCollection, dataStore, collectionName: 'Widgets'});
        (dataStore.query as jest.MockedFunction<any>).mockResolvedValue(new ErrorResult('Some', 'problem'))
        const result = state.Query({a: 10}) as ResultWithUpdates
        expect(dataStore.query).toHaveBeenCalledWith('Widgets', {a: 10})
        expect(result).toBeInstanceOf(ResultWithUpdates)
        expect(result!.result).toStrictEqual({_type: Pending})
        expect(result!.syncUpdate).toStrictEqual(update({queries: {'{a: 10}': {_type: Pending}}}))
        expect(await result!.asyncUpdate).toStrictEqual(update({
            queries: {
                '{a: 10}': new ErrorResult("Some", "problem")
            }
        }, false))
    })

    test('get Pending when already requested same query in same render', async () => {
        const initialCollection = {}
        const dataStore = mockDataStore()
        const state = new Collection.State({value: initialCollection, dataStore, collectionName: 'Widgets'});
        (dataStore.query as jest.MockedFunction<any>).mockResolvedValue([{id: 'a1', a: 10, b: 'Bee'}])

        state.Query({a: 10, c: false}) as ResultWithUpdates

        const result2 = state.Query({a: 10, c: false})
        expect(result2).not.toBeInstanceOf(ResultWithUpdates)
        expect(result2).toStrictEqual({_type: Pending})
        expect(dataStore.query).toHaveBeenCalledTimes(1)
    })

})

describe('subscribe with external data store', () => {

    test('inits subscribes to data store observable if not provided in props', () => {
        const dataStore = mockDataStore()
        const state = new Collection.State({value: {}, dataStore, collectionName: 'Widgets'})
        const updateFn = jest.fn()
        state.init(updateFn)
        // @ts-ignore
        expect(updateFn.mock.calls[0][0].subscription.constructor.name).toBe('Subscription')
        expect(dataStore.observable).toHaveBeenCalledWith('Widgets')
    })

    test('init returns same subscription when data store and subscription are in props', () => {
        const subscription = {}
        const dataStore = mockDataStore()
        const state = new Collection.State({value: {}, dataStore, collectionName: 'Widgets', subscription})
        const updateFn = jest.fn()
        state.init(updateFn)
        // @ts-ignore
        expect(dataStore.observable).not.toHaveBeenCalled()
        expect(updateFn).not.toHaveBeenCalled()
    })

    test('clears data and queries when subscription receives InvalidateAll', () => {
        const dataStore = mockDataStore()
        const state1 = new Collection.State({value: {w1: {a: 20}}, dataStore, collectionName: 'Widgets'})
        const updateFn1 = jest.fn()
        state1.init(updateFn1)

        updateFn1.mockReset()
        testObservable.send({collection: 'Widgets', type: InvalidateAll})
        expect(updateFn1).toHaveBeenCalledWith({value: _DELETE, queries: _DELETE})
    })

    test('clears queries when subscription receives InvalidateAllQueries', () => {
        const dataStore = mockDataStore()
        const state1 = new Collection.State({value: {w1: {a: 20}}, dataStore, collectionName: 'Widgets'})
        const updateFn1 = jest.fn()
        state1.init(updateFn1)

        updateFn1.mockReset()
        testObservable.send({collection: 'Widgets', type: InvalidateAllQueries})
        expect(updateFn1).toHaveBeenCalledWith({queries: _DELETE})
    })
})

describe('GetAll', () => {
    test('get all objects collection', () => {
        const initialCollection = {
            x1: {id: 'x1', a: 10},
            x2: {id: 'x2', a: 20},
        }
        const state = new Collection.State({value: initialCollection})
        expect(state.GetAll()).toStrictEqual([
            {id: 'x1', a: 10},
            {id: 'x2', a: 20},
        ])
    })

})