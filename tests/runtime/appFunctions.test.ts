import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
import appFunctions, {appFunctionsNames} from '../../src/runtime/appFunctions'
import {mockReturn, valueObj} from '../testutil/testHelpers'
import * as authentication from '../../src/runtime/components/authentication'
import * as notifications from '../../src/runtime/components/notifications'

vi.mock('../../src/runtime/components/authentication')
vi.mock('../../src/runtime/components/notifications')

const mockFn = vi.fn()
const {Reset, Set, SetWithUpdates, CurrentUser, Notify, NotifyError} = appFunctions

beforeEach( ()=> vi.resetAllMocks() )

test('can get app functions names', () => {
    expect(appFunctionsNames()).toStrictEqual(['Reset', 'Set', 'SetWithUpdates', 'NotifyError', 'Notify', 'CurrentUser', 'Update', 'Add', 'AddAll', 'Remove', 'Get', 'GetIfExists', 'Query', 'GetRandomId'])
})

test('Reset calls Reset on the target state of all arguments', () => {
    const elementState1 = {value: 42, Reset: vi.fn()}
    const elementState2 = {value: 43, Reset: vi.fn()}
    const elementState3 = {value: 44, Reset: vi.fn()}
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

describe('SetWithUpdates', () => {
    test('updates object value with name value pairs', () => {
        const elementState = {value: {foo: 42}, Set: mockFn}
        SetWithUpdates(elementState, 'a', 10, 'b', 'Bee')
        expect(elementState.Set).toBeCalledWith({foo: 42, a: 10, b: 'Bee'})
    })

    test('updates object value with objects and name value pairs', () => {
        const elementState = {value: {foo: 42}, Set: mockFn}
        SetWithUpdates(elementState, valueObj({x: 20}), {y: true}, 'a', 10, 'b', 'Bee')
        expect(elementState.Set).toBeCalledWith({foo: 42, x: 20, y: true, a: 10, b: 'Bee'})
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
