/**
 * @jest-environment jsdom
 */

import {FileDataStore, FileDataStoreImpl} from '../../../src/runtime/components/index'
import {snapshot} from '../../testutil/testHelpers'
import {createElement} from 'react'
import {render} from '@testing-library/react'

import appFunctions from '../../../src/runtime/appFunctions'
import {ErrorResult} from '../../../src/runtime/DataStore'
import Observable from 'zen-observable'
jest.mock('../../../src/runtime/appFunctions')

let dataStore: FileDataStoreImpl
let state: any

beforeEach(() => {
    dataStore = mockDataStore()
    state = new FileDataStore.State({dataStore})
} )


const mockObservable = new Observable(() => {})
const mockDataStore = (): FileDataStoreImpl => ({
    Open: jest.fn().mockResolvedValue(undefined),
    Save: jest.fn().mockResolvedValue(undefined),
    SaveAs: jest.fn().mockResolvedValue(undefined),
    New: jest.fn().mockResolvedValue(undefined),
    getById: jest.fn().mockResolvedValue({a:77}),
    add: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue([{a:77}]),
    observable: jest.fn().mockReturnValue(mockObservable),
}) as unknown as FileDataStoreImpl

test('produces output with record values',
    snapshot(createElement(FileDataStore, {
        state: {
            _path: 'app.page1.collection2'
        }, display: true
    }))
)

test('produces empty output with default value for display', () => {
    const {container} = render(createElement(FileDataStore, {
        state: {
            _path: 'app.page1.collection3'
        }
    }))
    expect(container.innerHTML).toBe('')
})

test('delegates Open to data store', () => {
    const result = state.Open()
    expect(result).toBeUndefined()
    expect(dataStore.Open).toHaveBeenCalledWith()
})

test('delegates Save to data store', () => {
    const result = state.Save()
    expect(result).toBeUndefined()
    expect(dataStore.Save).toHaveBeenCalledWith()
})

test('delegates SaveAs to data store', () => {
    const result = state.SaveAs()
    expect(result).toBeUndefined()
    expect(dataStore.SaveAs).toHaveBeenCalledWith()
})

test('delegates New to data store', () => {
    const result = state.New()
    expect(result).toBeUndefined()
    expect(dataStore.New).toHaveBeenCalledWith()
})

test('delegates add to data store', () => {
    const result = state.add('Widgets', 'w1', {a: 99})
    expect(result).resolves.toBeUndefined()
    expect(dataStore.add).toHaveBeenCalledWith('Widgets', 'w1', {a: 99})
})

test('delegates update to data store', () => {
    const result = state.update('Widgets', 'w1', {a: 99})
    expect(result).resolves.toBeUndefined()
    expect(dataStore.update).toHaveBeenCalledWith('Widgets', 'w1', {a: 99})
})

test('delegates remove to data store', () => {
    const result = state.remove('Widgets', 'w1')
    expect(result).resolves.toBeUndefined()
    expect(dataStore.remove).toHaveBeenCalledWith('Widgets', 'w1')
})

test('delegates getById to data store', () => {
    const result = state.getById('Widgets', 'w1')
    expect(result).resolves.toStrictEqual({a: 77})
    expect(dataStore.getById).toHaveBeenCalledWith('Widgets', 'w1')
})

test('delegates query to data store', () => {
    const result = state.query('Widgets', {a: 33})
    expect(result).resolves.toStrictEqual([{a: 77}])
    expect(dataStore.query).toHaveBeenCalledWith('Widgets', {a: 33})
})

test('inits itself with new data store if not provided', () => {
    const state = new FileDataStore.State({})
    const update = state.init()
    // @ts-ignore
    expect(update.changes.dataStore).toBeInstanceOf(FileDataStoreImpl)
})

test('init returns same data store when provided', () => {
    let dataStore = new FileDataStoreImpl()
    const state = new FileDataStore.State({dataStore})
    const update = state.init()
    // @ts-ignore
    expect(update.changes.dataStore).toBe(dataStore)
})

test('delegates observable to data store', () => {
    const result = state.observable('Widgets')
    expect(result).toBe(mockObservable)
})

describe('handles errors', () => {
    const NotifyError = jest.fn()
    const mock_appFunctions = appFunctions as jest.MockedFunction<any>
    mock_appFunctions.mockReturnValue({NotifyError})

    const errorDataStore = (): FileDataStoreImpl => ({
        Open: jest.fn().mockRejectedValue(new Error('Bad open')),
        Save: jest.fn().mockRejectedValue(new Error('Bad save')),
        SaveAs: jest.fn().mockRejectedValue(new Error('Bad save as')),
        New: jest.fn().mockRejectedValue(new Error('Bad new')),
        getById: jest.fn().mockRejectedValue(new Error('Bad getById')),
        query: jest.fn().mockRejectedValue(new Error('Bad query')),
        add: jest.fn().mockRejectedValue(new Error('Bad add')),
        update: jest.fn().mockRejectedValue(new Error('Bad update')),
        remove: jest.fn().mockRejectedValue(new Error('Bad remove')),
    }) as unknown as FileDataStoreImpl

    beforeEach(() => {
        NotifyError.mockReset()
        dataStore = errorDataStore()
        state = new FileDataStore.State({dataStore})
    } )

    test('notifies error from Open', async () => {
        const result = await state.Open()
        expect(result).toBeUndefined()
        expect(NotifyError).toHaveBeenCalledWith('Could not open file', new Error('Bad open'))
    })

    test('notifies error from SaveAs', async () => {
        const result = await state.SaveAs()
        expect(result).toBeUndefined()
        expect(NotifyError).toHaveBeenCalledWith('Could not save to file', new Error('Bad save as'))
    })

    test('notifies error from Save', async () => {
        const result = await state.Save()
        expect(result).toBeUndefined()
        expect(NotifyError).toHaveBeenCalledWith('Could not save to file', new Error('Bad save'))
    })

    test('notifies error from New', async () => {
        const result = await state.New()
        expect(result).toBeUndefined()
        expect(NotifyError).toHaveBeenCalledWith('Could not reset to new file', new Error('Bad new'))
    })

    test('notifies error from add', async () => {
        const result = await state.add('Widgets', 'x1', {a:1})
        expect(result).toBeUndefined()
        expect(NotifyError).toHaveBeenCalledWith('Could not add item to data store', new Error('Bad add'))
    })

    test('notifies error from update', async () => {
        const result = await state.update('Widgets', 'x1', {a:1})
        expect(result).toBeUndefined()
        expect(NotifyError).toHaveBeenCalledWith('Could not update item in data store', new Error('Bad update'))
    })

    test('notifies error from remove', async () => {
        const result = await state.remove('Widgets', 'x1')
        expect(result).toBeUndefined()
        expect(NotifyError).toHaveBeenCalledWith('Could not remove item from data store', new Error('Bad remove'))
    })

    test('notifies and returns error from getById', async () => {
        const result = await state.getById('Widgets', 'x1')
        expect(result).toStrictEqual(new ErrorResult('Could not get item from data store', 'Bad getById'))
        expect(NotifyError).toHaveBeenCalledWith('Could not get item from data store', new Error('Bad getById'))
    })

    test('notifies error from query and returns empty result', async () => {
        const result = await state.query('Widgets', {a: 33})
        expect(result).toStrictEqual([])
        expect(NotifyError).toHaveBeenCalledWith('Could not query items in data store', new Error('Bad query'))
    })
})
