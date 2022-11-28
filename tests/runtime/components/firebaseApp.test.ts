import {
    getConfig,
    setConfig,
    getAppAndSubscribeToChanges,
    test_resetAppManager
} from '../../../src/runtime/components/firebaseApp'
import {mockImplementation, wait} from '../../testutil/testHelpers'
import * as firebaseApp from 'firebase/app'

jest.mock('firebase/app')

const theConfig = {projectId: 'p1'}
const configResponse = {
    json: () => Promise.resolve(theConfig),
}

const mockFetch = jest.fn() as jest.MockedFunction<any>
global.fetch = mockFetch

beforeEach( () => {
    jest.resetAllMocks()
    test_resetAppManager()
    mockImplementation(firebaseApp.initializeApp, (config: any, name: string) => {
        return {config, name}
    })
})

test('gets app from server config if available', async () => {
    mockFetch.mockResolvedValueOnce(configResponse)
    const appCallback = jest.fn()
    getAppAndSubscribeToChanges(appCallback)
    expect(appCallback).toHaveBeenCalledWith(null)

    await (wait(10))
    expect(firebaseApp.initializeApp).toHaveBeenCalledWith(theConfig, 'p1')
    expect(appCallback).toHaveBeenCalledWith({config: theConfig, name: 'p1'})
    expect(appCallback).toHaveBeenCalledTimes(2)
})

test('can set config directly after load from server', async () => {
    mockFetch.mockResolvedValueOnce(configResponse)
    const appCallback = jest.fn()
    getAppAndSubscribeToChanges(appCallback)
    expect(appCallback).toHaveBeenCalledWith(null)

    await (wait(10))
    expect(firebaseApp.initializeApp).toHaveBeenCalledWith(theConfig, 'p1')
    expect(appCallback).toHaveBeenCalledWith({config: theConfig, name: 'p1'})
    expect(appCallback).toHaveBeenCalledTimes(2)

    const otherConfig = {projectId: 'p2'}
    setConfig(otherConfig)

    expect(firebaseApp.initializeApp).toHaveBeenCalledWith(otherConfig, 'p2')
    expect(appCallback).toHaveBeenCalledWith({config: otherConfig, name: 'p2'})
    expect(appCallback).toHaveBeenCalledTimes(3)

})

test('logs warning if server config not available', async () => {
    const originalErrorFn = console.warn
    console.warn = jest.fn()

    try {
        mockFetch.mockRejectedValueOnce(new Error('Not found'))

        const appCallback = jest.fn()
        getAppAndSubscribeToChanges(appCallback)
        expect(appCallback).toHaveBeenCalledWith(null)

        await (wait(10))
        expect(firebaseApp.initializeApp).not.toHaveBeenCalled()
        expect(appCallback).toHaveBeenCalledTimes(1)
        expect(console.warn).toHaveBeenCalledWith('Could not load firebase config from server', 'Not found')

    } finally {
        console.warn = originalErrorFn
    }
})

test('can set config directly before result of server load', async () => {
    const originalErrorFn = console.warn
    console.warn = jest.fn()

    try {
        mockFetch.mockRejectedValueOnce(new Error('Not found'))

        const appCallback = jest.fn()
        getAppAndSubscribeToChanges(appCallback)
        expect(appCallback).toHaveBeenCalledWith(null)

        setConfig(theConfig)

        await (wait(10))
        expect(firebaseApp.initializeApp).toHaveBeenCalledWith(theConfig, 'p1')
        expect(appCallback).toHaveBeenCalledWith({config: theConfig, name: 'p1'})
        expect(appCallback).toHaveBeenCalledTimes(2)

    } finally {
        console.warn = originalErrorFn
    }
})
