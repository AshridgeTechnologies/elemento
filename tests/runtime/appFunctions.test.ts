import appFunctions from '../../src/runtime/appFunctions'

const _updateApp = jest.fn()
const {Reset, ShowPage, Set, Update} = appFunctions( {_updateApp} )

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
})

describe('Update', () => {
    test('updates object state value at path', () => {
        const _update = jest.fn()
        const elementState = {value: {foo: 42}, _path: 'x.y.z', _update}
        const changes = {a: 10, b: 'Bee'}
        Update(elementState, changes)
        expect(_update).toBeCalledWith({value: changes})
    })
})
