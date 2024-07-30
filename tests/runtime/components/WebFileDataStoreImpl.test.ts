import {WebFileDataStoreImpl} from '../../../src/runtime/components/index'
import {wait} from '../../testutil/testHelpers'

const mockJsonResponse = (data: any) => ({status: 200, ok: true, json: jest.fn().mockResolvedValue(data), text: jest.fn().mockResolvedValue(JSON.stringify(data))})
let mockFetch: jest.MockedFunction<any>
beforeEach(()=> mockFetch = jest.fn())

test('has empty data store if cannot load data', async () => {
    mockFetch.mockRejectedValue( new Error('No data') )

    const store = new WebFileDataStoreImpl({url: 'https://example.com/data', fetch: mockFetch})
    await expect(store.getById('Widgets', 'w1')).rejects.toHaveProperty('message', `No data`)
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
    const onNextWidgets = jest.fn()
    store.observable('Widgets').subscribe(onNextWidgets)
    expect(onNextWidgets).not.toHaveBeenCalled()
    await wait()
})
