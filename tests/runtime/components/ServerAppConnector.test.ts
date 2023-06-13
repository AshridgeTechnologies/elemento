import {ServerAppConnector} from '../../../src/runtime/components'
import {Configuration, ServerAppConnectorState} from '../../../src/runtime/components/ServerAppConnector'
import {ErrorResult, Pending} from '../../../src/runtime/DataStore'
import {AppStateForObject} from '../../../src/runtime/appData'
import {testAppInterface, valueObj, wait} from '../../testutil/testHelpers'
import auth from '../../../src/runtime/components/authentication'
import appFunctions from '../../../src/runtime/appFunctions'

jest.mock('../../../src/runtime/components/authentication')
jest.mock('../../../src/runtime/appFunctions')

const configuration: Configuration = {
    appName: 'Server App 1',
    url: 'https://example.co/api',
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

const mockResponse = (data: any) => ({status: 200, ok: true, json: jest.fn().mockResolvedValue(data)})
const mockTextResponse = (data: string) => ({status: 200, ok: true, text: jest.fn().mockResolvedValue(data)})
const mockError = (message: string) => ({status: 500, ok: false, json: jest.fn().mockResolvedValue({error: {message}})})
const mock_getIdToken = auth.getIdToken as jest.MockedFunction<any>


let mockFetch: jest.MockedFunction<any>
const initConnector = ():[any, AppStateForObject] => {
    const state = new ServerAppConnectorState({configuration, fetch: mockFetch})
    const appInterface = testAppInterface(state); state.init(appInterface, 'testPath')

    return [state, appInterface]
}

beforeEach(()=> mockFetch = jest.fn())
beforeEach(()=> {
    jest.resetAllMocks()
    mock_getIdToken.mockResolvedValue(null)
})

test('adds functions to itself from configuration', () => {

    const conn = new ServerAppConnector.State({configuration})
    const connAny = conn as any

    expect(typeof connAny.GetWidget).toBe('function')
    expect(typeof connAny.GetSprocket).toBe('function')
    expect(typeof connAny.UpdateWidget).toBe('function')
})

test('does not fail with empty configuration', () => {
    const conn = new ServerAppConnector.State({configuration: {} as Configuration})
})

test('returns self as update result for equivalent configuration', () => {
    const conn = new ServerAppConnector.State({configuration})
    const copyConfig = JSON.parse(JSON.stringify(configuration))
    expect(conn.updateFrom(new ServerAppConnector.State({configuration: copyConfig}))).toBe(conn)
})

test('calls get functions, returns Pending and then cached result', async () => {
    const [conn, appInterface] = initConnector()
    const data1 = {a: 10, b: true}
    mockFetch.mockResolvedValue(mockResponse(data1))

    expect(conn.GetWidget('id1', true)).toBeInstanceOf(Pending)
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(1)
    expect(appInterface.latest().state).toStrictEqual(
        {
        resultCache: {
            'GetWidget#["id1",true]': new Pending()
        }
    })

    await wait(10)
    const resultData = conn.GetWidget('id1', true)
    expect(resultData).toStrictEqual(data1)
    const resultData2 = conn.GetWidget('id1', true)
    expect(resultData2).toBe(resultData)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(`${configuration.url}/GetWidget?id=id1&full=true`, {})
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(2)
    expect(appInterface.latest().state).toStrictEqual(
        {
            resultCache: {
                'GetWidget#["id1",true]': resultData
            }
        })
})

test('caches Pending until result arrives', async () => {
    const [conn] = initConnector()
    const data1 = {a: 10, b: true}
    mockFetch.mockResolvedValue(mockResponse(data1))
    const connAny = conn as any

    expect(connAny.GetWidget('id1', true)).toBeInstanceOf(Pending)
    expect(connAny.GetWidget('id1', true)).toBeInstanceOf(Pending)
    await wait(10)
    expect(connAny.GetWidget('id1', true)).toStrictEqual(data1)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(`${configuration.url}/GetWidget?id=id1&full=true`, {})
})

test('gets correct cached result for each call', async () => {
    const [conn] = initConnector()
    const data1 = {a: 10, b: true}
    const data2 = {a: 20, b: false}
    const data3 = {a: 30, c: "high"}
    mockFetch
        .mockResolvedValueOnce(mockResponse(data1))
        .mockResolvedValueOnce(mockResponse(data2))
        .mockResolvedValueOnce(mockResponse(data3))

    expect(conn.GetWidget('id1', true)).toBeInstanceOf(Pending)
    expect(conn.GetWidget('id1', false)).toBeInstanceOf(Pending)
    expect(conn.GetSprocket('id1', false)).toBeInstanceOf(Pending)
    await wait(10)
    expect(conn
        .GetWidget('id1', true)).toStrictEqual(data1)
    expect(conn
        .GetWidget('id1', false)).toStrictEqual(data2)
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
        .mockResolvedValueOnce(mockResponse(data1))
        .mockResolvedValueOnce(mockResponse(data2))
        .mockResolvedValueOnce(mockResponse(data3))

    expect(conn.GetWidget('id1', true)).toBeInstanceOf(Pending)
    expect(conn.GetWidget('id1', false)).toBeInstanceOf(Pending)
    expect(conn.GetSprocket('id1', false)).toBeInstanceOf(Pending)
    await wait(10)
    expect(conn.GetWidget('id1', true)).toStrictEqual(data1)
    expect(conn.GetWidget('id1', false)).toStrictEqual(data2)
    expect(conn.GetSprocket('id1', false)).toStrictEqual(data3)
    expect(mockFetch).toHaveBeenCalledTimes(3)
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(6)


    conn.Refresh('GetWidget', 'id1', true)
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(7)
    expect(appInterface.latest().state).toStrictEqual(
        {
            resultCache: {
                'GetWidget#["id1",true]': undefined,
                'GetWidget#["id1",false]': data2,
                'GetSprocket#["id1",false]': data3,
            }
        })

    mockFetch.mockResolvedValueOnce(mockResponse(data1a))
    expect(conn.GetWidget('id1', true)).toBeInstanceOf(Pending)
    await wait(10)
    expect(conn.GetWidget('id1', true)).toStrictEqual(data1a)
    expect(conn.GetWidget('id1', false)).toStrictEqual(data2)
    expect(conn.GetSprocket('id1', false)).toStrictEqual(data3)
    expect(mockFetch).toHaveBeenCalledTimes(4)

    expect(appInterface.updateVersion).toHaveBeenCalledTimes(9)
    expect(appInterface.latest().state).toStrictEqual(
        {
            resultCache: {
                'GetWidget#["id1",true]': data1a,
                'GetWidget#["id1",false]': data2,
                'GetSprocket#["id1",false]': data3,
            }
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
        .mockResolvedValueOnce(mockResponse(data1))
        .mockResolvedValueOnce(mockResponse(data2))
        .mockResolvedValueOnce(mockResponse(data3))

    expect(conn.GetWidget('id1', true)).toBeInstanceOf(Pending)
    expect(conn.GetWidget('id1', false)).toBeInstanceOf(Pending)
    expect(conn.GetSprocket('id1', false)).toBeInstanceOf(Pending)
    await wait(10)
    expect(conn.GetWidget('id1', true)).toStrictEqual(data1)
    expect(conn.GetWidget('id1', false)).toStrictEqual(data2)
    expect(conn.GetSprocket('id1', false)).toStrictEqual(data3)
    expect(mockFetch).toHaveBeenCalledTimes(3)
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(6)

    conn.Refresh('GetWidget')
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(7)
    expect(appInterface.latest().state).toStrictEqual(
        {
            resultCache: {
                'GetWidget#["id1",true]': undefined,
                'GetWidget#["id1",false]': undefined,
                'GetSprocket#["id1",false]': data3,
            }
        })

    mockFetch.mockResolvedValueOnce(mockResponse(data1a))
    mockFetch.mockResolvedValueOnce(mockResponse(data2a))

    expect(conn.GetWidget('id1', true)).toBeInstanceOf(Pending)
    expect(conn.GetWidget('id1', false)).toBeInstanceOf(Pending)
    expect(conn.GetSprocket('id1', false)).toStrictEqual(data3)

    await wait(10)
    expect(conn.GetWidget('id1', true)).toStrictEqual(data1a)
    expect(conn.GetWidget('id1', false)).toStrictEqual(data2a)
    expect(conn.GetSprocket('id1', false)).toStrictEqual(data3)
    expect(mockFetch).toHaveBeenCalledTimes(5)
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(11)
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
        .mockResolvedValueOnce(mockResponse(data1))
        .mockResolvedValueOnce(mockResponse(data2))
        .mockResolvedValueOnce(mockResponse(data3))

    expect(conn.GetWidget('id1', true)).toBeInstanceOf(Pending)
    expect(conn.GetWidget('id1', false)).toBeInstanceOf(Pending)
    expect(conn.GetSprocket('id1', false)).toBeInstanceOf(Pending)
    await wait(10)
    expect(conn.GetWidget('id1', true)).toStrictEqual(data1)
    expect(conn.GetWidget('id1', false)).toStrictEqual(data2)
    expect(conn.GetSprocket('id1', false)).toStrictEqual(data3)
    expect(mockFetch).toHaveBeenCalledTimes(3)

    conn.Refresh()
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(7)
    expect(appInterface.latest().state).toStrictEqual(
        {
            resultCache: {}
        })

    mockFetch.mockResolvedValueOnce(mockResponse(data1a))
    mockFetch.mockResolvedValueOnce(mockResponse(data2a))
    mockFetch.mockResolvedValueOnce(mockResponse(data3a))

    expect(conn.GetWidget('id1', true)).toBeInstanceOf(Pending)
    expect(conn.GetWidget('id1', false)).toBeInstanceOf(Pending)
    expect(conn.GetSprocket('id1', false)).toBeInstanceOf(Pending)

    await wait(10)
    expect(conn.GetWidget('id1', true)).toStrictEqual(data1a)
    expect(conn.GetWidget('id1', false)).toStrictEqual(data2a)
    expect(conn.GetSprocket('id1', false)).toStrictEqual(data3a)
    expect(mockFetch).toHaveBeenCalledTimes(6)
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(13)
    expect(appInterface.latest().state).toStrictEqual(
        {
            resultCache: {
                'GetWidget#["id1",true]': data1a,
                'GetWidget#["id1",false]': data2a,
                'GetSprocket#["id1",false]': data3a,
            }
        })
})

test('can use object values in arguments', async () => {
    const [conn] = initConnector()
    const data1 = {a: 10, b: true}
    mockFetch.mockResolvedValueOnce(mockResponse(data1))

    expect(conn.GetWidget(valueObj('id1'), valueObj(true))).toBeInstanceOf(Pending)
    await wait(10)
    expect(conn.GetWidget(valueObj('id1'), valueObj(true))).toStrictEqual(data1)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(`${configuration.url}/GetWidget?id=id1&full=true`, {})
})

test('caches falsy values correctly', async () => {
    const [conn] = initConnector()
    const data1 = 0
    mockFetch.mockResolvedValue(mockResponse(data1))

    expect(conn.GetWidget('id1', true)).toBeInstanceOf(Pending)
    expect(conn.GetWidget('id1', true)).toBeInstanceOf(Pending)
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
    expect(mockFetch).toHaveBeenCalledWith(`${configuration.url}/UpdateWidget`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({id: 'id1', changes}),
    })
})

test('calls action functions with post using object values', async () => {
    const [conn] = initConnector()
    const changes = {c: 'foo'}
    mockFetch.mockResolvedValue(mockTextResponse(''))
    expect(await conn.UpdateWidget(valueObj('id1'), changes)).toBe('')
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(`${configuration.url}/UpdateWidget`, {
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
    const mock_getIdToken = auth.getIdToken as jest.MockedFunction<() => Promise<string>>
    mock_getIdToken.mockResolvedValue(token)

    mockFetch.mockResolvedValue(mockResponse({a:1}))
    conn.GetWidget('id1')
    await wait(10)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(`${configuration.url}/GetWidget?id=id1`, {
        headers: {Authorization: 'Bearer the_id_token'},
    })
})

test('sends auth token with post request if user is logged in', async () => {
    const [conn] = initConnector()
    const changes = {c: 'foo'}
    const token = 'the_id_token'
    const mock_getIdToken = auth.getIdToken as jest.MockedFunction<() => Promise<string>>
    mock_getIdToken.mockResolvedValue(token)

    mockFetch.mockResolvedValue(mockTextResponse(''))
    expect(await conn.UpdateWidget('id1', changes)).toBe('')
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(`${configuration.url}/UpdateWidget`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Authorization: 'Bearer the_id_token'},
        body: JSON.stringify({id: 'id1', changes}),
    })
})

test('handles error returned from server in get call', async () => {
    const [conn, appInterface] = initConnector()
    const message = 'That is wrong'
    mockFetch.mockResolvedValue(mockError(message))

    expect(conn.GetWidget('id1', true)).toBeInstanceOf(Pending)
    expect(appInterface.latest().state).toStrictEqual(
        {
            resultCache: {
                'GetWidget#["id1",true]': new Pending()
            }
        })

    await wait(10)
    const resultData = conn.GetWidget('id1', true)
    expect(resultData).toStrictEqual(new ErrorResult('Server App 1: Get Widget', message))

    const resultData2 = conn.GetWidget('id1', true)
    expect(resultData2).toBe(resultData)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(appInterface.latest().state).toStrictEqual(
        {
            resultCache: {
                'GetWidget#["id1",true]': resultData
            }
        })
    expect(appFunctions.NotifyError).toHaveBeenCalledWith('Server App 1: Get Widget', new Error(message))
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(2)
})

test('handles error in making get call', async () => {
    const [conn, appInterface] = initConnector()
    const message = 'It did not work'
    mockFetch.mockRejectedValue( new Error(message) )

    expect(conn.GetWidget('id1', true)).toBeInstanceOf(Pending)
    await wait(10)
    const resultData = conn.GetWidget('id1', true)
    expect(resultData).toStrictEqual(new ErrorResult('Server App 1: Get Widget', message))

    const resultData2 = conn.GetWidget('id1', true)
    expect(resultData2).toBe(resultData)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(appInterface.latest().state).toStrictEqual(
        {
            resultCache: {
                'GetWidget#["id1",true]': resultData
            }
        })
    expect(appFunctions.NotifyError).toHaveBeenCalledWith('Server App 1: Get Widget', new Error(message))
})

test('handles error in making post call', async () => {
        const [conn] = initConnector()
        const changes = {c: 'foo'}
        const message = 'It did not work'
        mockFetch.mockRejectedValue( new Error(message) )
        expect(await conn.UpdateWidget('id1', changes)).toStrictEqual(new ErrorResult("Server App 1: Update Widget", message))
        expect(mockFetch).toHaveBeenCalledTimes(1)
        expect(appFunctions.NotifyError).toHaveBeenCalledWith('Server App 1: Update Widget', new Error(message))
})

test('handles error returned from server in post call', async () => {
    const [conn, appInterface] = initConnector()
    const changes = {c: 'foo'}
    const message = 'That is wrong'
    mockFetch.mockResolvedValue(mockError(message))
    expect(await conn.UpdateWidget('id1', changes)).toStrictEqual(new ErrorResult("Server App 1: Update Widget", message))
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(appFunctions.NotifyError).toHaveBeenCalledWith('Server App 1: Update Widget', new Error(message))
})

