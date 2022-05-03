import appFunctions from '../../src/runtime/appFunctions'
import {_DELETE} from '../../src/runtime/DataStore'
import {valObj} from '../testutil/testHelpers'

const _updateApp = jest.fn()
const {Reset, ShowPage, Set, Update, Add, Remove, Get, GetAll} = appFunctions( {_updateApp} )

beforeEach( ()=> jest.resetAllMocks() )

test('ShowPage _updates current page app state', () => {
    ShowPage('Other')
    expect(_updateApp).toHaveBeenCalledWith({_data: {currentPage: 'Other'}})
})

test('Reset sets value to undefined', () => {
    const _update = jest.fn()
    const elementState = {value: 42, _update}
    Reset(elementState)
    expect(_update).toBeCalledWith({value: undefined})
})

describe('Set', () => {
    test('sets state at path to simple value', () => {
        const _update = jest.fn()
        const elementState = {value: 42, _path: 'x.y.z', _update}
        Set(elementState, 42)
        expect(_update).toBeCalledWith({value: 42}, true)
    })

    test('sets state at path to undefined', () => {
        const _update = jest.fn()
        const elementState = {value: 42, _path: 'x.y.z', _update}
        Set(elementState, undefined)
        expect(_update).toBeCalledWith({value: undefined}, true)
    })

    test('sets state at path to object value', () => {
        const _update = jest.fn()
        const elementState = {value: {foo: 42}, _path: 'x.y.z', _update}
        const setValue = {a: 10, b: 'Bee'}
        Set(elementState, setValue)
        expect(_update).toBeCalledWith({value: setValue}, true)
    })

    test('uses object value', () => {
        const _update = jest.fn()
        const elementState = {value: 42, _path: 'x.y.z', _update}
        Set(elementState, valObj(42))
        expect(_update).toBeCalledWith({value: 42}, true)
    })
})

describe('Update single item', () => {
    test('updates object state value at path', () => {
        const _update = jest.fn()
        const elementState = {value: {foo: 42}, _path: 'x.y.z', _update}
        const changes = {a: 10, b: 'Bee'}
        Update(elementState, changes)
        expect(_update).toBeCalledWith({value: changes})
    })
})

describe('Add', () => {
    test('inserts a new object with id into a collection', () => {
        const _update = jest.fn()
        const existingCollection = {
            x1: {id: 'x1', a: 10},
            x2: {id: 'x2', a: 20},
        }
        const elementState = {value: existingCollection, _path: 'x.y.z', _update}
        Add(elementState, {id: 'x3', a: 30})
        expect(_update).toBeCalledWith({value: {
                x3: {id: 'x3', a: 30},
            }})
    })

    test('inserts a new item without id into a collection', () => {
        const _update = jest.fn()
        const existingCollection = {
            x1: {id: 'x1', a: 10},
            x2: {id: 'x2', a: 20},
        }
        const elementState = {value: existingCollection, _path: 'x.y.z', _update}
        Add(elementState, {a: 30})
        expect(_update).toBeCalledWith({value: {
                1: {a: 30},
            }})
    })

    test('inserts a new simple value into a collection', () => {
        const _update = jest.fn()
        const existingCollection = {}
        const elementState = {value: existingCollection, _path: 'x.y.z', _update}
        Add(elementState, 'green')
        Add(elementState, 27)
        expect(_update).toBeCalledWith({value: {green: 'green',}})
        expect(_update).toBeCalledWith({value: {27: 27,}})
    })

    test('uses object value', () => {
        const _update = jest.fn()
        const existingCollection = {}
        const elementState = {value: existingCollection, _path: 'x.y.z', _update}
        Add(elementState, valObj('green'))
        expect(_update).toBeCalledWith({value: {green: 'green',}})
    })
})

describe('Remove', () => {
    test('removes an item from a collection', () => {
        const _update = jest.fn()
        const existingCollection = {
            x1: {id: 'x1', a: 10},
            x2: {id: 'x2', a: 20},
        }
        const elementState = {value: existingCollection, _path: 'x.y.z', _update}
        Remove(elementState, 'x1')
        expect(_update).toBeCalledWith({value: {x1: _DELETE}})
    })

    test('uses object value', () => {
        const _update = jest.fn()
        const existingCollection = {
            x1: {id: 'x1', a: 10},
            x2: {id: 'x2', a: 20},
        }
        const elementState = {value: existingCollection, _path: 'x.y.z', _update}
        Remove(elementState, valObj('x1'))
        expect(_update).toBeCalledWith({value: {x1: _DELETE}})
    })
})

describe('Update item in collection', () => {
    test('updates an object by id', () => {
        const _update = jest.fn()
        const existingCollection = {
            x1: {id: 'x1', a: 10},
            x2: {id: 'x2', a: 20},
        }
        const elementState = {value: existingCollection, _path: 'x.y.z', _update}
        Update(elementState, 'x1', {a: 50, b: 'Bee'})
        expect(_update).toBeCalledWith({
            value: {
                x1: {a: 50, b: 'Bee'},
            }
        })
    })

    test('cannot update id', () => {
        const _update = jest.fn()
        const existingCollection = {
            x1: {id: 'x1', a: 10},
            x2: {id: 'x2', a: 20},
        }
        const elementState = {value: existingCollection, _path: 'x.y.z', _update}
        Update(elementState, 'x1', {id: 'xxx333', a: 50, b: 'Bee'})
        expect(_update).toBeCalledWith({
            value: {
                x1: {a: 50, b: 'Bee'},
            }
        })
    })

    test('uses object value for id', () => {
        const _update = jest.fn()
        const existingCollection = {
            x1: {id: 'x1', a: 10},
            x2: {id: 'x2', a: 20},
        }
        const elementState = {value: existingCollection, _path: 'x.y.z', _update}
        Update(elementState, valObj('x1'), {a: 50, b: 'Bee'})
        expect(_update).toBeCalledWith({
            value: {
                x1: {a: 50, b: 'Bee'},
            }
        })
    })


})

describe('Get', () => {
    test('get object by id from collection', () => {
        const existingCollection = {
            x1: {id: 'x1', a: 10},
            x2: {id: 'x2', a: 20},
        }
        const elementState = {value: existingCollection}
        const result = Get(elementState, 'x2' as keyof object)
        expect(result).toStrictEqual({id: 'x2', a: 20})
    })

    test('get simple value by id from collection', () => {
        const existingCollection = {
            green: 'green',
            blue: 'blue',
            99: 99
        }
        const elementState = {value: existingCollection}
        expect(Get(elementState, 'green' as keyof object)).toBe('green')
        expect(Get(elementState, 99 as keyof object)).toBe(99)
    })

    test('uses object value for id', () => {
        const existingCollection = {
            x1: {id: 'x1', a: 10},
            x2: {id: 'x2', a: 20},
        }
        const elementState = {value: existingCollection}
        const result = Get(elementState, valObj('x2') as keyof object)
        expect(result).toStrictEqual({id: 'x2', a: 20})
    })


})

describe('GetAll', () => {
    test('get all objects collection', () => {
        const existingCollection = {
            x1: {id: 'x1', a: 10},
            x2: {id: 'x2', a: 20},
        }
        const elementState = {value: existingCollection}
        expect(GetAll(elementState)).toStrictEqual([
            {id: 'x1', a: 10},
            {id: 'x2', a: 20},
        ])
    })

})