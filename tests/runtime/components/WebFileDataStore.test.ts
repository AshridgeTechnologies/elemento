/**
 * @vitest-environment jsdom
 */

import {beforeEach, describe, expect, MockedFunction, test, vi} from "vitest"
import {WebFileDataStore, WebFileDataStoreImpl} from '../../../src/runtime/components/index'

import appFunctions from '../../../src/runtime/appFunctions'
import {ErrorResult} from '../../../src/runtime/DataStore'
import Observable from 'zen-observable'

vi.mock('../../../src/runtime/appFunctions')

let dataStore: WebFileDataStoreImpl
let state: any

beforeEach(() => {
    dataStore = mockDataStore()
    state = new WebFileDataStore.State({url: 'https://example.com/data'})
    state.state.dataStore = dataStore
} )

const mockObservable = new Observable(() => {})
const mockDataStore = (): WebFileDataStoreImpl => ({
    getById: vi.fn().mockResolvedValue({a:77}),
    add: vi.fn().mockResolvedValue(undefined),
    addAll: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue([{a:77}]),
    observable: vi.fn().mockReturnValue(mockObservable),
}) as unknown as WebFileDataStoreImpl

test('delegates getById to data store', async () => {
    const result = state.getById('Widgets', 'w1', false)
    await expect(result).resolves.toStrictEqual({a: 77})
    expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'w1', false)
})

test('delegates query to data store', async () => {
    const result = state.query('Widgets', {a: 33})
    await expect(result).resolves.toStrictEqual([{a: 77}])
    expect(dataStore.query).toHaveBeenCalledWith('Widgets', {a: 33})
})

test('delegates observable to data store', () => {
    const result = state.observable('Widgets')
    expect(result).toBe(mockObservable)
})

describe('handles errors', () => {

    const errorDataStore = (): WebFileDataStoreImpl => ({
        getById: vi.fn().mockRejectedValue(new Error('Bad getById')),
        query: vi.fn().mockRejectedValue(new Error('Bad query')),
    }) as unknown as WebFileDataStoreImpl

    beforeEach(() => {
        (appFunctions.NotifyError as MockedFunction<any>).mockReset()
        dataStore = errorDataStore()
        state = new WebFileDataStore.State({url: 'https://example.com/data'})
        state.state.dataStore = dataStore
    } )

    test('notifies and returns error from getById', async () => {
        const result = await state.getById('Widgets', 'x1')
        expect(result).toStrictEqual(new ErrorResult('Could not get item from data store', 'Bad getById'))
        expect(appFunctions.NotifyError).toHaveBeenCalledWith('Could not get item from data store', new Error('Bad getById'))
    })

    test('notifies error from query and returns empty result', async () => {
        const result = await state.query('Widgets', {a: 33})
        expect(result).toStrictEqual([])
        expect(appFunctions.NotifyError).toHaveBeenCalledWith('Could not query items in data store', new Error('Bad query'))
    })
})
