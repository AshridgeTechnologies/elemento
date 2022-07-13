/**
 * @jest-environment jsdom
 */

import {Collection} from '../../../src/runtime/components/index'
import {snapshot, testAppInterface, wrappedTestElement} from '../../testutil/testHelpers'
import {render} from '@testing-library/react'
import DataStore, {
    ErrorResult,
    InvalidateAll,
    InvalidateAllQueries,
    Pending,
    UpdateNotification
} from '../../../src/runtime/DataStore'
import SendObservable from '../../../src/runtime/SendObservable'
import {CollectionState} from '../../../src/runtime/components/Collection'
import {wait} from '../../testutil/rtlHelpers'
import {AppStateForObject} from '../../../src/runtime/appData'

let dataStore: DataStore
let testObservable: SendObservable<UpdateNotification>

const mockDataStore = (): DataStore => ({
    getById: jest.fn(),
    add: jest.fn(),
    addAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    observable: jest.fn().mockImplementation( () => testObservable ),
    query: jest.fn()
})

const [collection, appStoreHook] = wrappedTestElement(Collection, CollectionState)

const stateAt = (path: string) => appStoreHook.stateAt(path)

beforeEach( () => {
    testObservable = new SendObservable<UpdateNotification>()
    return dataStore = mockDataStore()
})

const initState = (initialCollection: object):[CollectionState, AppStateForObject] => {
    const state = new Collection.State({value: initialCollection, dataStore, collectionName: 'Widgets'})
    const appInterface = testAppInterface(state); state.init(appInterface)

    return [state, appInterface]
}

test('produces output with simple values',
    snapshot(collection('app.page1.collection1', {value: ['green', 'blue']}, {display: true}))
)

test('produces output with record values',
    snapshot(collection('app.page1.collection2', {value: [{id: 'a1', a: 10, b: 'Bee1', c: true}, {Id: 'a2', a: 11}]}, {display: true}))
)

test('produces empty output with default value for display', () => {
    const {container} = render(collection('app.page1.collection3', {value: ['green', 'blue']}))
    expect(container.innerHTML).toBe('')
})

test('gets initial values from array using id property', () => {
    const state = new CollectionState({value: [{id: 27, a: 10}, {Id: 'xxx123', a: 20}]})
    expect(state.value).toStrictEqual({
        '27': {id: 27, a: 10},
        'xxx123': {Id: 'xxx123', a: 20},
    })
})

test('gets initial values from array using generated id if not present in object', () => {
    const state = new CollectionState({value: [{a: 10}, {a: 20}]})
    const keys = Object.keys(state.value)
    keys.forEach(key => expect(key).toMatch(/\d+/) )
    expect(Object.values(state.value)).toStrictEqual([{Id: keys[0], a: 10}, {Id: keys[1], a: 20},])
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

test('does deep compare on value in props', () => {
    {
        const state1 = new Collection.State({value: {}})
        const state2 = new Collection.State({value: {}})
        expect(state1.updateFrom(state2)).toBe(state1)
    }
    {
        const state1 = new Collection.State({value: {a: 10}})
        const state2 = new Collection.State({value: {a: 10}})
        expect(state1.updateFrom(state2)).toBe(state1)
    }
    {
        const state1 = new Collection.State({value: {a: 10}})
        const state2 = new Collection.State({value: {a: 10, b: 20}})
        expect(state1.updateFrom(state2)).not.toBe(state1)
    }
})

describe('Update', () => {
    const initialCollection = {
        x1: {id: 'x1', a: 10},
        x2: {id: 'x2', a: 20},
    }

    test('updates state correctly', () => {
        const state = new CollectionState({value: initialCollection})
        const appInterface = testAppInterface(); state.init(appInterface)

        state.Update('x1', {a:20, b:'Cee'})
        expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateChanges({
            value: {
                x1: {id: 'x1', a: 20, b: 'Cee'},
                x2: {id: 'x2', a: 20},
            }
        }))
    })

    test('cannot update id', () => {
        const state = new CollectionState({value: initialCollection})
        const appInterface = testAppInterface(); state.init(appInterface)

        state.Update('x1', {id: 'xxx333', a: 50, b: 'Bee'})
        expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateChanges({
            value: {
                x1: {id: 'x1', a: 50, b: 'Bee'},
                x2: {id: 'x2', a: 20},
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
        const state = new CollectionState({value: initialCollection})
        const appInterface = testAppInterface(); state.init(appInterface)
        state.Add({id: 'x3', a: 30})
        expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateChanges({
            value: {
                x1: {id: 'x1', a: 10},
                x2: {id: 'x2', a: 20},
                x3: {id: 'x3', a: 30},
            }
        }))
    })

    test('inserts a new item without id into a collection and adds the id', () => {
        const state = new Collection.State({value: {}})
        const appInterface = testAppInterface(); state.init(appInterface)
        state.Add({a: 30})
        const newState = (appInterface.updateVersion as jest.MockedFunction<any>).mock.calls[0][0]
        const entries = Object.entries(newState.value)
        expect(entries.length).toBe(1)
        const [key, value] = entries[0]
        expect(Number(key)).toBeGreaterThan(0)
        expect(value).toStrictEqual({Id: key, a: 30})
    })

    test('inserts a new simple value into a collection', () => {
        const state = new Collection.State({value: initialCollection})
        const appInterface = testAppInterface(); state.init(appInterface)
        state.Add('green')
        expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateChanges({
            value: {
                x1: {id: 'x1', a: 10},
                x2: {id: 'x2', a: 20},
                green: 'green',
            }
        }))
    })

    test('inserts multiple objects into a collection', () => {
        const state = new CollectionState({value: initialCollection})
        const appInterface = testAppInterface(); state.init(appInterface)
        state.Add([{id: 'x3', a: 30}, {id: 'x4', a: 40}])
        expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateChanges({
            value: {
                x1: {id: 'x1', a: 10},
                x2: {id: 'x2', a: 20},
                x3: {id: 'x3', a: 30},
                x4: {id: 'x4', a: 40},
            }
        }))
    })

    test('inserts multiple objects without ids into a collection', () => {
        const state = new CollectionState({})
        const appInterface = testAppInterface(); state.init(appInterface)
        state.Add([{a: 30}, {a: 40}, {a: 50}])
        const newState = (appInterface.updateVersion as jest.MockedFunction<any>).mock.calls[0][0]
        const entries = Object.entries(newState.value)
        expect(entries.length).toBe(3)
        const [key0, value0] = entries[0]
        const [key1, value1] = entries[1]
        const [key2, value2] = entries[2]
        expect(Number(key0)).toBeGreaterThan(0)
        expect(Number(key1)).toBeGreaterThan(Number(key0))
        expect(Number(key2)).toBeGreaterThan(Number(key1))
        expect(value2).toStrictEqual({Id: key2, a: 50})
    })

    test('inserts multiple simple values into a collection', () => {
        const state = new Collection.State({value: initialCollection})
        const appInterface = testAppInterface(); state.init(appInterface)
        state.Add(['green', 'blue'])
        expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateChanges({
            value: {
                x1: {id: 'x1', a: 10},
                x2: {id: 'x2', a: 20},
                green: 'green',
                blue: 'blue',
            }
        }))
    })


})

describe('Remove', () => {
    const initialCollection = {
        x1: {id: 'x1', a: 10},
        x2: {id: 'x2', a: 20},
    }

    test('removes an item from a collection', () => {
        const state = new Collection.State({value: initialCollection})
        const appInterface = testAppInterface(); state.init(appInterface)
        state.Remove('x1')
        expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateChanges({
            value: {
                x2: {id: 'x2', a: 20},
            }
        }))
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

    test('makes correct update when not in cache', () => {
        const [state, appInterface] = initState({});

        state.Add({id: 'x1', a:20, b:'Cee'})
        expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateChanges({
            value: {
                x1: {id: 'x1', a: 20, b: 'Cee'},
            }
        }))

        expect(dataStore.addAll).toHaveBeenCalledWith('Widgets', {'x1': {id: 'x1', a:20, b:'Cee'}})
    })

    test('makes correct update for item without id', () => {
        const [state, appInterface] = initState({});

        state.Add({a:20, b:'Cee'})
        expect(dataStore.addAll).toHaveBeenCalled()
        const mock = (dataStore.addAll as jest.MockedFunction<any>).mock

        const itemsPassedToAddAll = mock.calls[0][1]
        const newId = Object.keys(itemsPassedToAddAll)[0]
        const dataStoreUpdate = Object.values(itemsPassedToAddAll)[0] as {id: string}
        expect(dataStoreUpdate.id).toBeUndefined()
        expect(Number(newId)).toBeGreaterThan(0)
        expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateChanges({
            value: {
                [newId]: {Id: newId, a: 20, b: 'Cee'},
            }
        }))
    })

    test('makes correct update for simple value', () => {
        const [state, appInterface] = initState({});

        state.Add('green')
        expect(dataStore.addAll).toHaveBeenCalledWith('Widgets', {'green':'green'})
        expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateChanges({
            value: {
                green: 'green',
            }
        }))
    })

    test('makes correct update for multiple items when not in cache', () => {
        const [state, appInterface] = initState({});

        state.Add([{id: 'x1', a:20, b:'Cee'}, {id: 'x2', a:30, b:'Dee'}])
        expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateChanges({
            value: {
                x1: {id: 'x1', a: 20, b: 'Cee'},
                x2: {id: 'x2', a: 30, b: 'Dee'},
            }
        }))

        expect(dataStore.addAll).toHaveBeenCalledWith('Widgets', {
                x1: {id: 'x1', a:20, b:'Cee'},
                x2: {id: 'x2', a:30, b:'Dee'},
        })
    })


})

describe('Update with external datastore', () => {

    test('makes correct update when not in cache', () => {
        const [state, appInterface] = initState({});

        state.Update('x1', {a:20, b:'Cee'})
        expect(dataStore.update).toHaveBeenCalledWith('Widgets', 'x1', {a:20, b:'Cee'})
        expect(appInterface.updateVersion).not.toHaveBeenCalled()
    })

    test('makes correct update when already in cache', () => {
        const [state, appInterface] = initState({x1: {id: 'x1', a: 10}});

        state.Update('x1', {a:20, b:'Cee'})
        expect(dataStore.update).toHaveBeenCalledWith('Widgets', 'x1', {a:20, b:'Cee'})
        expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateChanges({
            value: {
                x1: {id: 'x1', a: 20, b: 'Cee'},
            }
        }))
    })

    test('cannot update id', () => {
        const [state, appInterface] = initState({x1: {id: 'x1', a: 10}});

        state.Update('x1', {id: 'xxx333', a:20, b:'Cee'})
        expect(dataStore.update).toHaveBeenCalledWith('Widgets', 'x1', {a:20, b:'Cee'})
        expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateChanges({
            value: {
                x1: {id: 'x1', a: 20, b: 'Cee'},
            }
        }))
    })

})

describe('Remove with external datastore', () => {

    test('returns correct update when not in cache', () => {
        const [state, appInterface] = initState({});

        state.Remove('x1')
        expect(dataStore.remove).toHaveBeenCalledWith('Widgets', 'x1')
        expect(appInterface.updateVersion).not.toHaveBeenCalled()
    })

    test('returns correct update when already in cache', () => {
        const [state, appInterface] = initState({x1: {id: 'x1', a: 10}, x2: {id: 'x2', a: 20}});

        state.Remove('x1')
        expect(dataStore.remove).toHaveBeenCalledWith('Widgets', 'x1')
        expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateChanges({
            value: {
                x2: {id: 'x2', a: 20},
            }
        }))
    })
})

describe('Get with external datastore', () => {

    test('get object by id when not in cache', async () => {
        const [state, appInterface] = initState({});
        (dataStore.getById as jest.MockedFunction<any>).mockResolvedValue({a: 10, b: 'Bee'})
        const initialResult = state.Get('x1')
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x1')
        expect(initialResult).toBeInstanceOf(Pending)
        expect(appInterface.updateVersion).toHaveBeenLastCalledWith(state._withStateChanges({
            value: {
                x1: new Pending(),
            }
        }))

        await wait(10)
        expect(appInterface.updateVersion).toHaveBeenLastCalledWith(state._withStateChanges({
            value: {
                x1: {a: 10, b: 'Bee'}
            }
        }))

    })

    test('get object by id puts error in cache', async () => {
        const [state, appInterface] = initState({});
        (dataStore.getById as jest.MockedFunction<any>).mockResolvedValue(new ErrorResult('Some', 'problem'))
        const initialResult = state.Get('x1')
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x1')
        expect(appInterface.updateVersion).toHaveBeenLastCalledWith(state._withStateChanges({
            value: {
                x1: new Pending(),
            }
        }))

        await wait(10)
        expect(appInterface.updateVersion).toHaveBeenLastCalledWith(state._withStateChanges({
            value: {
                x1: new ErrorResult('Some', 'problem')
            }
        }))
    })

    test('get object by id when in cache', async () => {
        const initialCollection = {
            x1: {id: 'x1', a: 10},
            x2: new Pending(),
        }
        const [state] = initState(initialCollection);
        expect(state.Get('x1')).toStrictEqual({id: 'x1', a: 10})
        expect(state.Get('x2')).toStrictEqual(new Pending())
        expect(dataStore.getById).not.toHaveBeenCalled()
    })

    test('get Pending when already requested in same render', async () => {
        const [state, appInterface] = initState({});
        (dataStore.getById as jest.MockedFunction<any>).mockResolvedValue({a: 10, b: 'Bee'})
        const result = state.Get('x1')
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x1')
        expect(result).toBeInstanceOf(Pending)

        const result2 = state.Get('x1')
        expect(result2).toBeInstanceOf(Pending)
        expect(dataStore.getById).toHaveBeenCalledTimes(1)
    })

    test('get two objects together when not in cache', async () => {
        const [state, appInterface] = initState({});
        (dataStore.getById as jest.MockedFunction<any>)
            .mockResolvedValueOnce({a: 10, b: 'Bee'})
            .mockResolvedValueOnce({a: 20, b: 'Cee'})

        state.Get('x1')
        state.Get('x2')
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x1')
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x2')
        expect(state.Get('x1')).toBeInstanceOf(Pending)
        expect(state.Get('x2')).toBeInstanceOf(Pending)
        await wait(10)
        expect(appInterface.updateVersion).toHaveBeenLastCalledWith(state._withStateChanges({
            value: {
                x1: {a: 10, b: 'Bee'},
                x2: {a: 20, b: 'Cee'},
            }
        }))
    })
})

describe('Query with external datastore', () => {

    test('query when not in cache', async () => {
        const [state, appInterface] = initState({});
        (dataStore.query as jest.MockedFunction<any>).mockResolvedValue([{id: 'a1', a: 10, b: 'Bee'}])

        const result = state.Query({a: 10, c: false})
        expect(dataStore.query).toHaveBeenCalledWith('Widgets', {a: 10, c: false})
        expect(result).toBeInstanceOf(Pending)

        expect(appInterface.updateVersion).not.toHaveBeenCalled()

        await wait(10)
        expect(appInterface.updateVersion).toHaveBeenLastCalledWith(state._withStateChanges({
            queries: {
                '{a: 10, c: false}': [{id: 'a1', a: 10, b: 'Bee'}]
            }
        }))
    })

    test('query when in cache', async () => {
        const state = new Collection.State({value: {}, dataStore, collectionName: 'Widgets'})._withStateForTest({
            queries: {
                '{a: 10, c: false}': [{id: 'a1', a: 10, b: 'Bee'}]
            }
        })
        expect(state.Query({a: 10, c: false})).toStrictEqual([{id: 'a1', a: 10, b: 'Bee'}])
        expect(dataStore.query).not.toHaveBeenCalled()
    })

    test('query puts error in cache', async () => {
        const [state, appInterface] = initState({});
        (dataStore.query as jest.MockedFunction<any>).mockResolvedValue(new ErrorResult('Some', 'problem'))
        state.Query({a: 10})

        await wait(10)
        expect(appInterface.updateVersion).toHaveBeenLastCalledWith(state._withStateChanges({
            queries: {
                '{a: 10}': new ErrorResult("Some", "problem")            }
        }))

    })

    test('get Pending when already requested same query in same render', async () => {
        const [state, appInterface] = initState({});
        (dataStore.query as jest.MockedFunction<any>).mockResolvedValue([{id: 'a1', a: 10, b: 'Bee'}])

        const result = state.Query({a: 10, c: false})
        expect(result).toBeInstanceOf(Pending)

        const result2 = state.Query({a: 10, c: false})
        expect(result2).toBeInstanceOf(Pending)
        expect(dataStore.query).toHaveBeenCalledTimes(1)
    })

    test('two queries together when not in cache', async () => {
        const [state, appInterface] = initState({});
        (dataStore.query as jest.MockedFunction<any>)
            .mockResolvedValueOnce([{id: 'a1', a: 10, b: 'Bee'}])
            .mockResolvedValueOnce([{id: 'a2', a: 20, b: 'Cee'}])

        state.Query({a: 10, c: false})
        state.Query({a: 20})
        expect(dataStore.query).toHaveBeenCalledWith('Widgets', {a: 10, c: false})
        expect(dataStore.query).toHaveBeenCalledWith('Widgets', {a: 20})
        expect(state.Query({a: 10, c: false})).toBeInstanceOf(Pending)
        expect(state.Query({a: 20})).toBeInstanceOf(Pending)

        await wait(10)
        expect(appInterface.updateVersion).toHaveBeenLastCalledWith(state._withStateChanges({
            queries: {
                '{a: 10, c: false}': [{id: 'a1', a: 10, b: 'Bee'}],
                '{a: 20}': [{id: 'a2', a: 20, b: 'Cee'}],
            }
        }))
    })

    test('query does not lose overlapping get', async () => {
        const [state, appInterface] = initState({});
        (dataStore.query as jest.MockedFunction<any>)
            .mockResolvedValueOnce([{id: 'a1', a: 10, b: 'Bee'}]);
        (dataStore.getById as jest.MockedFunction<any>)
            .mockResolvedValueOnce({a: 10, b: 'Bee'})


        state.Get('x1')
        state.Query({a: 20})
        expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'x1')
        expect(dataStore.query).toHaveBeenCalledWith('Widgets', {a: 20})
        expect(state.Get('x1')).toBeInstanceOf(Pending)
        expect(state.Query({a: 20})).toBeInstanceOf(Pending)

        await wait(10)
        expect(appInterface.updateVersion).toHaveBeenLastCalledWith(state._withStateChanges({
            value: {
                x1: {a: 10, b: 'Bee'},
            },
            queries: {
                '{a: 20}': [{id: 'a1', a: 10, b: 'Bee'}],
            }
        }))
    })
})

describe('subscribe with external data store', () => {

    test('subscribes to data store observable when not in the state', () => {
        const [state, appInterface] = initState({});
        expect(appInterface.updateVersion).not.toHaveBeenCalled()
        expect(dataStore.observable).toHaveBeenCalledWith('Widgets')
    })

    test('uses same subscription when already in the state', () => {
        const subscription = {}
        const dataStore = mockDataStore()
        const state = new Collection.State({value: {}, dataStore, collectionName: 'Widgets'})._withStateForTest({subscription})
        const appInterface = testAppInterface(); state.init(appInterface)
        expect(dataStore.observable).not.toHaveBeenCalled()
        expect(appInterface.updateVersion).not.toHaveBeenCalled()
    })

    test('clears data and queries when subscription receives InvalidateAll', () => {
        const state = new Collection.State({value: {}, dataStore, collectionName: 'Widgets'})._withStateForTest({
            value: {id1: {a:10}},
            queries: { 'a:10': [{a:10}]}
        })
        const appInterface = testAppInterface(state); state.init(appInterface)

        testObservable.send({collection: 'Widgets', type: InvalidateAll})
        expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateChanges({value: {}, queries: {}}))
    })

    test('clears queries when subscription receives InvalidateAllQueries', () => {
        const state = new Collection.State({value: {}, dataStore, collectionName: 'Widgets'})._withStateForTest({
            value: {id1: {a:10}},
            queries: { 'a:10': [{a:10}]}
        })
        const appInterface = testAppInterface(state); state.init(appInterface);

        testObservable.send({collection: 'Widgets', type: InvalidateAllQueries})
        expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateChanges({value: {id1: {a:10}}, queries: {}}))
    })

    test('clears queries without losing later Get when subscription receives InvalidateAllQueries', async () => {
        const state = new Collection.State({value: {}, dataStore, collectionName: 'Widgets'})._withStateForTest({
            value: {},
            queries: {'a:10': [{a: 10}]}
        })
        const appInterface = testAppInterface(state);
        state.init(appInterface);
        (dataStore.getById as jest.MockedFunction<any>)
            .mockResolvedValueOnce({a: 10, b: 'Bee'});

        state.Get('x1')
        await wait(10)

        testObservable.send({collection: 'Widgets', type: InvalidateAllQueries})
        expect(appInterface.updateVersion).toHaveBeenLastCalledWith(state._withStateChanges({
            value: {x1: {a: 10, b: 'Bee'}},
            queries: {}
        }))
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