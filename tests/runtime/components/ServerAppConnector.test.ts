import {afterAll, beforeAll, beforeEach, describe, expect, MockedFunction, MockInstance, test, vi} from 'vitest'
import {ServerAppConnector} from '../../../src/runtime/components'
import {Configuration, ServerAppConnectorState} from '../../../src/runtime/components/ServerAppConnector'
import {ErrorResult, isPending} from '../../../src/shared/DataStore'
import {mockClear, mockImplementation, testAppInterface, valueObj, wait} from '../../testutil/testHelpers'
import appFunctions from '../../../src/runtime/appFunctions'
import * as authentication from '../../../src/runtime/components/authentication'
import AppStateStore, {AppStateForObject} from '../../../src/runtime/state/AppStateStore'

vi.mock('../../../src/runtime/components/authentication')
vi.mock('../../../src/runtime/appFunctions')

const baseUrl = 'https://example.co/api'
const appName = 'Server App 1'
const configuration: Configuration = {
    appName,
    url: `${baseUrl}/${appName.replace(/ /, '')}`,
    functions: {
        GetWidget: {
            params: ['id', 'full']
        },
        UpdateWidget: {
            params: ['id', 'changes'],
            action: true
        },
        GetSprocket: {
            params: ['id', 'direct']
        },
    }
}
const urlWithVersion = configuration.url

const mockJsonResponse = (data: any) => ({status: 200, ok: true, json: vi.fn().mockResolvedValue(data), text: vi.fn().mockResolvedValue(JSON.stringify(data))})
const mockTextResponse = (data: string) => ({status: 200, ok: true, text: vi.fn().mockResolvedValue(data)})
const mockError = (message: string) => ({status: 500, ok: false, json: vi.fn().mockResolvedValue({error: {message}})})
const mock_getIdToken = authentication.getIdToken as MockedFunction<any>

let mockFetch: MockInstance
const initConnector = ():[any, AppStateForObject<any>] => {
    const state = new ServerAppConnectorState({configuration})
    const appInterface = testAppInterface('testPath', state)

    return [state, appInterface]
}

beforeAll(() => {
    mockFetch = vi.spyOn(globalThis, 'fetch')
})

beforeEach(()=> {
    vi.resetAllMocks()
    mock_getIdToken.mockResolvedValue(null)
})

afterAll(() => mockFetch.mockRestore())

test('adds functions to itself from configuration', () => {

    const conn = new ServerAppConnector.State({configuration})
    const connAny = conn as any

    expect(typeof connAny.GetWidget).toBe('function')
    expect(typeof connAny.GetSprocket).toBe('function')
    expect(typeof connAny.UpdateWidget).toBe('function')
})

test('does not fail with empty configuration', () => {
    new ServerAppConnector.State({configuration: {} as Configuration})
})

test('matches equivalent configuration', () => {
    const conn = new ServerAppConnector.State({configuration})
    const copyConfig = JSON.parse(JSON.stringify(configuration))
    expect(conn.withProps({configuration: copyConfig})).toBe(conn)
})

test('calls get functions, returns pending and then cached result', async () => {
    const [conn, appInterface] = initConnector()
    const data1 = {a: 10, b: true}
    
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data1))

    expect(isPending(conn.GetWidget('id1', true))).toBe(true)
    expect(appInterface.update).toHaveBeenCalledTimes(1)
    expect(isPending(appInterface.latest()._stateForTest.resultCache['GetWidget#["id1",true]'])).toBe(true)

    await wait(10)
    const resultData = conn.GetWidget('id1', true)
    expect(resultData).toStrictEqual(data1)
    const resultData2 = conn.GetWidget('id1', true)
    expect(resultData2).toBe(resultData)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(`${urlWithVersion}/GetWidget?id=id1&full=true`, {})
    expect(appInterface.update).toHaveBeenCalledTimes(2)
    expect(appInterface.latest()._stateForTest.resultCache).toStrictEqual({
        'GetWidget#["id1",true]': resultData,
    })
})

test('translates ISO dates in received data', async () => {
    const [conn] = initConnector()
    const date1 = new Date()
    const data1 = {date: date1.toISOString()}
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data1))

    expect(isPending(conn.GetWidget('id1', true))).toBe(true)

    await wait(10)
    const resultData = conn.GetWidget('id1', true)
    expect(resultData).toStrictEqual({date: date1})
})

test('caches pending until result arrives', async () => {
    const [conn] = initConnector()
    const data1 = {a: 10, b: true}
    
    mockFetch.mockResolvedValue(mockJsonResponse(data1))
    const connAny = conn as any

    expect(isPending(connAny.GetWidget('id1', true))).toBe(true)
    expect(isPending(connAny.GetWidget('id1', true))).toBe(true)
    await wait(10)
    expect(connAny.GetWidget('id1', true)).toStrictEqual(data1)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenLastCalledWith(`${urlWithVersion}/GetWidget?id=id1&full=true`, {})
})

test('pending result can be used as a promise', async () => {
    const [conn] = initConnector()
    const data1 = {a: 10, b: true}
    
    mockFetch.mockResolvedValue(mockJsonResponse(data1))
    const connAny = conn as any

    await expect(connAny.GetWidget('id1', true)).resolves.toStrictEqual(data1)
})

test('gets correct cached result for parallel calls but only gets version once', async () => {
    const [conn] = initConnector()
    const data1 = {a: 10, b: true}
    const data2 = {a: 20, b: false}
    const data3 = {a: 30, c: "high"}
    mockFetch
        .mockResolvedValueOnce(mockJsonResponse(data1))
        .mockResolvedValueOnce(mockJsonResponse(data2))
        .mockResolvedValueOnce(mockJsonResponse(data3))

    expect(isPending(conn.GetWidget('id1', true))).toBe(true)
    expect(isPending(conn.GetWidget('id1', false))).toBe(true)
    expect(isPending(conn.GetSprocket('id1', false))).toBe(true)
    await wait(10)
    expect(conn.GetWidget('id1', true)).toStrictEqual(data1)
    expect(conn.GetWidget('id1', false)).toStrictEqual(data2)
    expect(conn.GetSprocket('id1', false)).toStrictEqual(data3)
    expect(mockFetch).toHaveBeenCalledTimes(3)
})

test('refreshes individual cached result for each call', async () => {
    const [conn, appInterface] = initConnector()
    const data1 = {a: 10, b: true}
    const data1a = {a: 110, b: true}
    const data2 = {a: 20, b: false}
    const data3 = {a: 30, c: "high"}
    mockFetch
        .mockResolvedValueOnce(mockJsonResponse(data1))
        .mockResolvedValueOnce(mockJsonResponse(data2))
        .mockResolvedValueOnce(mockJsonResponse(data3))

    expect(isPending(conn.GetWidget('id1', true))).toBe(true)
    expect(isPending(conn.GetWidget('id1', false))).toBe(true)
    expect(isPending(conn.GetSprocket('id1', false))).toBe(true)
    await wait(10)
    expect(conn.GetWidget('id1', true)).toStrictEqual(data1)
    expect(conn.GetWidget('id1', false)).toStrictEqual(data2)
    expect(conn.GetSprocket('id1', false)).toStrictEqual(data3)
    expect(mockFetch).toHaveBeenCalledTimes(3)
    expect(appInterface.update).toHaveBeenCalledTimes(6)


    conn.Refresh('GetWidget', 'id1', true)
    expect(appInterface.update).toHaveBeenCalledTimes(7)
    expect(appInterface.latest()._stateForTest.resultCache).toStrictEqual(
        {
            'GetWidget#["id1",true]': undefined,
            'GetWidget#["id1",false]': data2,
            'GetSprocket#["id1",false]': data3,
        })

    mockFetch.mockResolvedValueOnce(mockJsonResponse(data1a))
    expect(isPending(conn.GetWidget('id1', true))).toBe(true)
    await wait(10)
    expect(conn.GetWidget('id1', true)).toStrictEqual(data1a)
    expect(conn.GetWidget('id1', false)).toStrictEqual(data2)
    expect(conn.GetSprocket('id1', false)).toStrictEqual(data3)
    expect(mockFetch).toHaveBeenCalledTimes(4)

    expect(appInterface.update).toHaveBeenCalledTimes(9)
    expect(appInterface.latest()._stateForTest.resultCache).toStrictEqual(
        {
            'GetWidget#["id1",true]': data1a,
            'GetWidget#["id1",false]': data2,
            'GetSprocket#["id1",false]': data3,
        })
})

test('refreshes all cached results for one function', async () => {
    const [conn, appInterface] = initConnector()
    const data1 = {a: 10, b: true}
    const data1a = {a: 110, b: true}
    const data2 = {a: 20, b: false}
    const data2a = {a: 220, b: false}
    const data3 = {a: 30, c: "high"}
    mockFetch
        .mockResolvedValueOnce(mockJsonResponse(data1))
        .mockResolvedValueOnce(mockJsonResponse(data2))
        .mockResolvedValueOnce(mockJsonResponse(data3))

    expect(isPending(conn.GetWidget('id1', true))).toBe(true)
    expect(isPending(conn.GetWidget('id1', false))).toBe(true)
    expect(isPending(conn.GetSprocket('id1', false))).toBe(true)
    await wait(10)
    expect(conn.GetWidget('id1', true)).toStrictEqual(data1)
    expect(conn.GetWidget('id1', false)).toStrictEqual(data2)
    expect(conn.GetSprocket('id1', false)).toStrictEqual(data3)
    expect(mockFetch).toHaveBeenCalledTimes(3)
    expect(appInterface.update).toHaveBeenCalledTimes(6)

    conn.Refresh('GetWidget')
    expect(appInterface.update).toHaveBeenCalledTimes(7)
    expect(appInterface.latest()._stateForTest.resultCache).toStrictEqual(
        {
            'GetWidget#["id1",true]': undefined,
            'GetWidget#["id1",false]': undefined,
            'GetSprocket#["id1",false]': data3,
        })

    mockFetch.mockResolvedValueOnce(mockJsonResponse(data1a))
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data2a))

    expect(isPending(conn.GetWidget('id1', true))).toBe(true)
    expect(isPending(conn.GetWidget('id1', false))).toBe(true)
    expect(conn.GetSprocket('id1', false)).toStrictEqual(data3)

    await wait(10)
    expect(conn.GetWidget('id1', true)).toStrictEqual(data1a)
    expect(conn.GetWidget('id1', false)).toStrictEqual(data2a)
    expect(conn.GetSprocket('id1', false)).toStrictEqual(data3)
    expect(mockFetch).toHaveBeenCalledTimes(5)
    expect(appInterface.update).toHaveBeenCalledTimes(11)
})

test('refreshes all cached results', async () => {
    const [conn, appInterface] = initConnector()
    const data1 = {a: 10, b: true}
    const data1a = {a: 110, b: true}
    const data2 = {a: 20, b: false}
    const data2a = {a: 220, b: false}
    const data3 = {a: 30, c: "high"}
    const data3a = {a: 330, c: "high"}
    mockFetch
        .mockResolvedValueOnce(mockJsonResponse(data1))
        .mockResolvedValueOnce(mockJsonResponse(data2))
        .mockResolvedValueOnce(mockJsonResponse(data3))

    expect(isPending(conn.GetWidget('id1', true))).toBe(true)
    expect(isPending(conn.GetWidget('id1', false))).toBe(true)
    expect(isPending(conn.GetSprocket('id1', false))).toBe(true)
    await wait(10)
    expect(conn.GetWidget('id1', true)).toStrictEqual(data1)
    expect(conn.GetWidget('id1', false)).toStrictEqual(data2)
    expect(conn.GetSprocket('id1', false)).toStrictEqual(data3)
    expect(mockFetch).toHaveBeenCalledTimes(3)

    conn.Refresh()
    expect(appInterface.update).toHaveBeenCalledTimes(7)
    expect(appInterface.latest()._stateForTest.resultCache).toStrictEqual({})

    mockFetch.mockResolvedValueOnce(mockJsonResponse(data1a))
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data2a))
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data3a))

    expect(isPending(conn.GetWidget('id1', true))).toBe(true)
    expect(isPending(conn.GetWidget('id1', false))).toBe(true)
    expect(isPending(conn.GetSprocket('id1', false))).toBe(true)

    await wait(10)
    expect(conn.GetWidget('id1', true)).toStrictEqual(data1a)
    expect(conn.GetWidget('id1', false)).toStrictEqual(data2a)
    expect(conn.GetSprocket('id1', false)).toStrictEqual(data3a)
    expect(mockFetch).toHaveBeenCalledTimes(6)
    expect(appInterface.update).toHaveBeenCalledTimes(13)
    expect(appInterface.latest()._stateForTest.resultCache).toStrictEqual(
        {
            'GetWidget#["id1",true]': data1a,
            'GetWidget#["id1",false]': data2a,
            'GetSprocket#["id1",false]': data3a,
        })
})

test('refreshes all cached results after action function call', async () => {
    const [conn, appInterface] = initConnector()
    const data1 = {a: 10, b: true}
    const data1a = {a: 110, b: true}
    const data2 = {a: 20, b: false}
    const data2a = {a: 220, b: false}
    const data3 = {a: 30, c: "high"}
    const data3a = {a: 330, c: "high"}
    mockFetch
        .mockResolvedValueOnce(mockJsonResponse(data1))
        .mockResolvedValueOnce(mockJsonResponse(data2))
        .mockResolvedValueOnce(mockJsonResponse(data3))
        .mockResolvedValue(mockTextResponse(''))

    expect(isPending(conn.GetWidget('id1', true))).toBe(true)
    expect(isPending(conn.GetWidget('id1', false))).toBe(true)
    expect(isPending(conn.GetSprocket('id1', false))).toBe(true)
    await wait(10)
    expect(conn.GetWidget('id1', true)).toStrictEqual(data1)
    expect(conn.GetWidget('id1', false)).toStrictEqual(data2)
    expect(conn.GetSprocket('id1', false)).toStrictEqual(data3)
    expect(mockFetch).toHaveBeenCalledTimes(3)

    expect(await conn.UpdateWidget('id1', {c: 'foo'})).toBe('')
    expect(mockFetch).toHaveBeenCalledTimes(4)

    expect(appInterface.update).toHaveBeenCalledTimes(7)
    expect(appInterface.latest()._stateForTest.resultCache).toStrictEqual({})

    mockFetch.mockResolvedValueOnce(mockJsonResponse(data1a))
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data2a))
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data3a))

    expect(isPending(conn.GetWidget('id1', true))).toBe(true)
    expect(isPending(conn.GetWidget('id1', false))).toBe(true)
    expect(isPending(conn.GetSprocket('id1', false))).toBe(true)

    await wait(10)
    expect(conn.GetWidget('id1', true)).toStrictEqual(data1a)
    expect(conn.GetWidget('id1', false)).toStrictEqual(data2a)
    expect(conn.GetSprocket('id1', false)).toStrictEqual(data3a)
    expect(mockFetch).toHaveBeenCalledTimes(7)
    expect(appInterface.update).toHaveBeenCalledTimes(13)
    expect(appInterface.latest()._stateForTest.resultCache).toStrictEqual(
        {
            'GetWidget#["id1",true]': data1a,
            'GetWidget#["id1",false]': data2a,
            'GetSprocket#["id1",false]': data3a,
        })
})

test('can use object values in arguments', async () => {
    const [conn] = initConnector()
    const data1 = {a: 10, b: true}
    
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data1))

    expect(isPending(conn.GetWidget(valueObj('id1'), valueObj(true)))).toBe(true)
    await wait(10)
    expect(conn.GetWidget(valueObj('id1'), valueObj(true))).toStrictEqual(data1)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenLastCalledWith(`${urlWithVersion}/GetWidget?id=id1&full=true`, {})
})

test('caches falsy values correctly', async () => {
    const [conn] = initConnector()
    const data1 = 0
    
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data1))

    expect(isPending(conn.GetWidget('id1', true))).toBe(true)
    expect(isPending(conn.GetWidget('id1', true))).toBe(true)
    await wait(10)
    expect(conn.GetWidget('id1', true)).toStrictEqual(data1)
    expect(conn.GetWidget('id1', true)).toStrictEqual(data1)
    expect(mockFetch).toHaveBeenCalledTimes(1)
})

test('calls action functions with post', async () => {
    const [conn] = initConnector()
    const changes = {c: 'foo'}
    
    mockFetch.mockResolvedValue(mockTextResponse(''))
    expect(await conn.UpdateWidget('id1', changes)).toBe('')
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenLastCalledWith(`${urlWithVersion}/UpdateWidget`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({id: 'id1', changes}),
    })
})

test('calls action functions with post using object values', async () => {
    const [conn] = initConnector()
    const changes = {c: 'foo'}
    
    mockFetch.mockResolvedValueOnce(mockTextResponse(''))
    expect(await conn.UpdateWidget(valueObj('id1'), changes)).toBe('')
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(`${urlWithVersion}/UpdateWidget`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({id: 'id1', changes}),
    })
})

test('does not cache action functions', async () => {
    const [conn] = initConnector()
    const changes = {c: 'foo'}
    
    mockFetch.mockResolvedValue(mockTextResponse(''))
    expect(await conn.UpdateWidget('id1', changes)).toBe('')
    expect(await conn.UpdateWidget('id1', changes)).toBe('')
    expect(mockFetch).toHaveBeenCalledTimes(2)
})

test('sends auth token with get request if user is logged in', async () => {
    const [conn] = initConnector()
    const token = 'the_id_token'
    const mock_getIdToken = authentication.getIdToken as MockedFunction<() => Promise<string>>
    mock_getIdToken.mockResolvedValue(token)

    
    mockFetch.mockResolvedValue(mockJsonResponse({a:1}))
    conn.GetWidget('id1')
    await wait(10)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(`${urlWithVersion}/GetWidget?id=id1`, {
        headers: {Authorization: 'Bearer the_id_token'},
    })
})

test('sends auth token with post request if user is logged in', async () => {
    const [conn] = initConnector()
    const changes = {c: 'foo'}
    const token = 'the_id_token'
    const mock_getIdToken = authentication.getIdToken as MockedFunction<() => Promise<string>>
    mock_getIdToken.mockResolvedValue(token)

    
    mockFetch.mockResolvedValue(mockTextResponse(''))
    expect(await conn.UpdateWidget('id1', changes)).toBe('')
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(`${urlWithVersion}/UpdateWidget`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Authorization: 'Bearer the_id_token'},
        body: JSON.stringify({id: 'id1', changes}),
    })
})

test('handles error returned from server in get call', async () => {
    const [conn, appInterface] = initConnector()
    const message = 'That is wrong'
    
    mockFetch.mockResolvedValue(mockError(message))

    expect(isPending(conn.GetWidget('id1', true))).toBe(true)
    expect(isPending(appInterface.latest()._stateForTest.resultCache['GetWidget#["id1",true]'])).toBe(true)

    await wait(10)
    const resultData = conn.GetWidget('id1', true)
    expect(resultData).toStrictEqual(new ErrorResult('Server App 1: Get Widget', message))

    const resultData2 = conn.GetWidget('id1', true)
    expect(resultData2).toBe(resultData)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(appInterface.latest()._stateForTest.resultCache).toStrictEqual(
        {
            'GetWidget#["id1",true]': resultData
        })
    expect(appFunctions.NotifyError).toHaveBeenCalledWith('Server App 1: Get Widget', new Error(message))
    expect(appInterface.update).toHaveBeenCalledTimes(2)
})

test('handles error in making get call', async () => {
    const message = 'It did not work'
    mockFetch.mockRejectedValue( new Error(message) )
    const [conn, appInterface] = initConnector()

    expect(isPending(conn.GetWidget('id1', true))).toBe(true)
    await wait(10)
    const resultData = conn.GetWidget('id1', true)
    expect(resultData).toStrictEqual(new ErrorResult('Server App 1: Get Widget', message))

    const resultData2 = conn.GetWidget('id1', true)
    expect(resultData2).toBe(resultData)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(appInterface.latest()._stateForTest.resultCache).toStrictEqual(
        {
            'GetWidget#["id1",true]': resultData
        })
    expect(appFunctions.NotifyError).toHaveBeenCalledWith('Server App 1: Get Widget', new Error(message))
})

test('handles error in making post call', async () => {
    const message = 'It did not work'
    mockFetch.mockRejectedValue(new Error(message))
    const [conn] = initConnector()
    const changes = {c: 'foo'}
    expect(await conn.UpdateWidget('id1', changes)).toStrictEqual(new ErrorResult("Server App 1: Update Widget", message))
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(appFunctions.NotifyError).toHaveBeenCalledWith('Server App 1: Update Widget', new Error(message))
})

test('handles error returned from server in post call', async () => {
    const [conn] = initConnector()
    const changes = {c: 'foo'}
    const message = 'That is wrong'
    
    mockFetch.mockResolvedValue(mockError(message))
    expect(await conn.UpdateWidget('id1', changes)).toStrictEqual(new ErrorResult("Server App 1: Update Widget", message))
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(appFunctions.NotifyError).toHaveBeenCalledWith('Server App 1: Update Widget', new Error(message))
})

describe('subscribe to auth changes', () => {

    beforeEach(()=> mockClear(authentication.onAuthChange))

    test('subscribes to onAuthChange when not in the state', () => {
        const [, appInterface] = initConnector();
        expect(appInterface.update).not.toHaveBeenCalled()
        expect(authentication.onAuthChange).toHaveBeenCalled()
    })

    test('uses same onAuthChange subscription when already in the state', () => {
        const theStore = new AppStateStore()
        const state = theStore.getOrUpdate('id1', ServerAppConnectorState, {configuration})
        expect(authentication.onAuthChange).toHaveBeenCalledTimes(1)

        const config2 = {...configuration, url: 'xxx'}
        const state2 = theStore.getOrUpdate('id1', ServerAppConnectorState, {configuration: config2})
        expect(state2).not.toBe(state)
        expect(authentication.onAuthChange).toHaveBeenCalledTimes(1)
    })

    test('clears data and queries on auth change', () => {
        let authCallback: VoidFunction
        mockImplementation(authentication.onAuthChange, (callback: VoidFunction) => authCallback = callback)
        const state = new ServerAppConnectorState({configuration}).withState({
            resultCache: {
                'GetWidget#["id1",true]': 'xyz',
            }
        })
        const appInterface = testAppInterface('testPath', state)

        authCallback!()
        expect(appInterface.latest()._stateForTest.resultCache).toStrictEqual({})
    })
})
