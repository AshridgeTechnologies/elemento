import {ServerAppConnector} from '../../../src/runtime/components'
import {Configuration, ServerAppConnectorState} from '../../../src/runtime/components/ServerAppConnector'
import {Pending} from '../../../src/runtime/DataStore'
import {wait} from '../../testutil/rtlHelpers'
import {AppStateForObject} from '../../../src/runtime/appData'
import {testAppInterface, valueObj} from '../../testutil/testHelpers'
import auth from '../../../src/runtime/components/authentication'

jest.mock('../../../src/runtime/components/authentication')

const configuration: Configuration = {
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

const mockResponse = (data: any) => ({json: jest.fn().mockResolvedValue(data)})
const mockTextResponse = (data: string) => ({text: jest.fn().mockResolvedValue(data)})
const mock_getIdToken = auth.getIdToken as jest.MockedFunction<any>


let mockFetch: jest.MockedFunction<any>
const initConnector = ():[any, AppStateForObject] => {
    const state = new ServerAppConnectorState({configuration, fetch: mockFetch})
    const appInterface = testAppInterface(state); state.init(appInterface)

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

