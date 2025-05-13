import {beforeEach, expect, MockedFunction, test, vi} from "vitest"
import {WebFileDataStoreImpl} from '../../../src/runtime/components/index'
import {wait} from '../../testutil/testHelpers'

const mockJsonResponse = (data: any) => ({status: 200, ok: true, headers: {get() { return "application/json"}}, json: vi.fn().mockResolvedValue(data), text: vi.fn().mockResolvedValue(JSON.stringify(data))})
const mockTextResponse = (data: string) => ({status: 200, ok: true, headers: {get() { return "text/plain"}}, text: vi.fn().mockResolvedValue(data)})
const mockError = (message: string) => {
    const body = {error: {message}}
    return {
        status: 500, ok: false, headers: {
            get() {return "application/json"}
        }, json: vi.fn().mockResolvedValue(body), text: vi.fn().mockResolvedValue(JSON.stringify(body))
    }
}
let mockFetch: MockedFunction<any>
beforeEach(()=> mockFetch = vi.fn())

test('getById rejects if cannot load data', async () => {
    // mockFetch.mockRejectedValue( new Error('No network') )
    mockFetch = vi.fn().mockReturnValue(Promise.reject(new Error('No network')))

    const store = new WebFileDataStoreImpl({url: 'https://example.com/data', fetch: mockFetch})
    await expect(store.getById('Widgets', 'w1')).rejects.toThrow(new Error('No network'))
})

test('getById rejects if error result', async () => {
    mockFetch.mockResolvedValueOnce(mockError('Server error'))

    const store = new WebFileDataStoreImpl({url: 'https://example.com/data', fetch: mockFetch})
    await expect(store.getById('Widgets', 'w1')).rejects.toHaveProperty('message', `Error getting data: 500 Server error`)
})

test('getById rejects if result is not json', async () => {
    mockFetch.mockResolvedValueOnce(mockTextResponse('Hi!'))

    const store = new WebFileDataStoreImpl({url: 'https://example.com/data', fetch: mockFetch})
    await expect(store.getById('Widgets', 'w1')).rejects.toHaveProperty('message', `Error getting data: Content-Type is not JSON - text/plain`)
})

test('returns null if not found and nullIfNotFound set', async () => {
    const data = {
        Widgets: [
            {id: 'id1', name: 'Widget 1'},
        ],
    }

    mockFetch.mockResolvedValueOnce(mockJsonResponse(data))
    const store = new WebFileDataStoreImpl({url: 'https://example.com/data', fetch: mockFetch})
    await expect(store.getById('Widgets', 'wxxx', true)).resolves.toBe(null)
})

test('can get by id from a collection', async () => {
    const data = {
        Widgets: [
            {id: 'id1', name: 'Widget 1'},
            {id: 'id2', name: 'Widget 2'},
        ],
        Sprockets: [
            {id: 'id1', name: 'Sprocket 1'},
            {id: 'id2', name: 'Sprocket 2'},
        ]
    }

    mockFetch.mockResolvedValueOnce(mockJsonResponse(data))
    const store = new WebFileDataStoreImpl({url: 'https://example.com/data', fetch: mockFetch})
    const widget = await store.getById('Widgets', 'id1')
    expect(widget).toStrictEqual({id: 'id1', name: 'Widget 1'})
    expect(await store.getById('Sprockets', 'id2')).toStrictEqual({id: 'id2', name: 'Sprocket 2'})
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/data')
    expect(mockFetch).toHaveBeenCalledTimes(1)
})

test('can get by index from a collection of objects without ids', async () => {
    const data = {
        Widgets: [
            {name: 'Widget 1'},
            {name: 'Widget 2'},
            {name: 'Widget 3'},
        ],
    }

    mockFetch.mockResolvedValueOnce(mockJsonResponse(data))
    const store = new WebFileDataStoreImpl({url: 'https://example.com/data', fetch: mockFetch})
    const widget = await store.getById('Widgets', '1')
    expect(await store.getById('Widgets', '0')).toStrictEqual({name: 'Widget 1'})
    expect(await store.getById('Widgets', '2')).toStrictEqual({name: 'Widget 3'})
})

test('can query', async () => {
    const data = {
        Widgets: [
            {id: 'id1', a: 10, b: 'Bee1', c: true},
            {id: 'id2', a: 20, b: 'Bee2', c: true},
            {id: 'id3', a: 20, b: 'Bee3', c: false}
        ]
    }
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data))
    const store = new WebFileDataStoreImpl({url: 'https://example.com/data', fetch: mockFetch})
    expect(await store.query('Widgets', {a: 20})).toStrictEqual([{id: 'id2', a: 20, b: 'Bee2', c: true}, {id: 'id3', a: 20, b: 'Bee3', c: false}])
})

test('can query objects supplied without ids', async () => {
    const data = {
        Widgets: [
            {a: 10, b: 'Bee1', c: true},
            {a: 20, b: 'Bee2', c: true},
            {a: 20, b: 'Bee3', c: false}
        ]
    }
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data))
    const store = new WebFileDataStoreImpl({url: 'https://example.com/data', fetch: mockFetch})
    expect(await store.query('Widgets', {a: 20})).toStrictEqual([{a: 20, b: 'Bee2', c: true}, {a: 20, b: 'Bee3', c: false}])
})

test('retrieves dates in ISO format', async () => {
    const data = {Widgets: [{id: 'id1', a: 10, b: `2022-06-29T15:47:21.968Z`}]}
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data))
    const store = new WebFileDataStoreImpl({url: 'https://example.com/data', fetch: mockFetch})
    expect(await store.getById('Widgets', 'id1')).toStrictEqual({id: 'id1', a: 10, b: new Date(`2022-06-29T15:47:21.968Z`)})
})

test('retrieves invalid dates as strings', async () => {
    const data = {Widgets: [{id: 'id1', a: 10, b: '2022-02-29T15:47:21.968Z'}]}
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data))
    const store = new WebFileDataStoreImpl({url: 'https://example.com/data', fetch: mockFetch})

    expect(await store.getById('Widgets', 'id1')).toStrictEqual({id: 'id1', a: 10, b: '2022-02-29T15:47:21.968Z'})
})

test('gets empty observable', async () => {
    const data = {Widgets: [{id: 'id1', a: 10, b: `2022-06-29T15:47:21.968Z`}]}
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data))
    const store = new WebFileDataStoreImpl({url: 'https://example.com/data', fetch: mockFetch})
    const onNextWidgets = vi.fn()
    store.observable('Widgets').subscribe(onNextWidgets)
    expect(onNextWidgets).not.toHaveBeenCalled()
    await wait()
})

test('update functions reject with exception', () => {
    const data = {Widgets: [{id: 'id1', a: 10}]}
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data))
    const store = new WebFileDataStoreImpl({url: 'https://example.com/data', fetch: mockFetch})
    expect(store.add('Widgets', 'id1', {a: 20})).rejects.toStrictEqual(new Error('Cannot change readonly datastore'))
    expect(store.addAll('Widgets', {'id1': {a: 20}})).rejects.toStrictEqual(new Error('Cannot change readonly datastore'))
    expect(store.remove('Widgets', 'id1')).rejects.toStrictEqual(new Error('Cannot change readonly datastore'))
    expect(store.update('Widgets', 'id1', {'id1': {a: 20}})).rejects.toStrictEqual(new Error('Cannot change readonly datastore'))
})
