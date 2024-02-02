import appFunctions, {appFunctionsNames} from '../../src/runtime/appFunctions'
import {mockReturn, valueObj} from '../testutil/testHelpers'
import * as authentication from '../../src/runtime/components/authentication'
import * as notifications from '../../src/runtime/components/notifications'

jest.mock('../../src/runtime/appData')
jest.mock('../../src/runtime/components/authentication')
jest.mock('../../src/runtime/components/notifications')

const mockFn = jest.fn()
const {Reset, Set, CurrentUser, Notify, NotifyError} = appFunctions

beforeEach( ()=> jest.resetAllMocks() )

test('can get app functions names', () => {
    expect(appFunctionsNames()).toStrictEqual(['Reset', 'Set', 'NotifyError', 'Notify', 'CurrentUser', 'Update', 'Add', 'AddAll', 'Remove', 'Get', 'Query', 'GetRandomId'])
})

test('Reset calls Reset on the target state of all arguments', () => {
    const elementState1 = {value: 42, Reset: jest.fn()}
    const elementState2 = {value: 43, Reset: jest.fn()}
    const elementState3 = {value: 44, Reset: jest.fn()}
    Reset(elementState1, elementState2, elementState3)
    expect(elementState1.Reset).toBeCalledWith()
    expect(elementState2.Reset).toBeCalledWith()
    expect(elementState3.Reset).toBeCalledWith()
})

describe('Set', () => {
    test('sets state at path to simple value', () => {
        const elementState = {value: 42, Set: mockFn}
        Set(elementState, 42)
        expect(elementState.Set).toBeCalledWith(42)
    })

    test('sets state at path to undefined', () => {
        const elementState = {value: 42, Set: mockFn}
        Set(elementState, undefined)
        expect(elementState.Set).toBeCalledWith(undefined)
    })

    test('sets state at path to object value', () => {
        const elementState = {value: {foo: 42}, Set: mockFn}
        const setValue = {a: 10, b: 'Bee'}
        Set(elementState, setValue)
        expect(elementState.Set).toBeCalledWith(setValue)
    })

    test('uses object value', () => {
        const elementState = {value: 42, Set: mockFn}
        Set(elementState, valueObj(42))
        expect(elementState.Set).toBeCalledWith(42)
    })
})

describe('CurrentUser', () => {

    test('returns current user if logged on', () => {
        mockReturn(authentication.currentUser, { displayName: 'Franko', email: 'franko@fr.com'})
        expect(CurrentUser()!.Name).toBe('Franko')
        expect(CurrentUser()!.Email).toBe('franko@fr.com')
    })

    test('returns null if not logged on', () => {
        mockReturn(authentication.currentUser, null)
        expect(CurrentUser()).toBe(null)

    })
})

describe('Notify', () => {
    test('adds a notification', () => {
        Notify('warning', 'The message', 'The details')
        expect(notifications.addNotification).toHaveBeenCalledWith('warning', 'The message', 'The details')
    })
    test('gets value of value objects', () => {
        Notify(valueObj('warning'), valueObj('The message'), valueObj('The details'))
        expect(notifications.addNotification).toHaveBeenCalledWith('warning', 'The message', 'The details')
    })
    test('NotifyError adds a notification from an Error', () => {
        NotifyError('The message', new Error('The details'))
        expect(notifications.addNotification).toHaveBeenCalledWith('error', 'The message', 'The details')
    })
})
