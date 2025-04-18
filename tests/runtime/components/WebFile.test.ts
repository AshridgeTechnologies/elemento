import {isPending} from '../../../src/runtime/DataStore'
import {testAppInterface, wait} from '../../testutil/testHelpers'
import {WebFileState} from '../../../src/runtime/components/WebFile'
import {AppStateForObject} from '../../../src/runtime/components/ComponentState'

const mockTextResponse = (data: string) => ({status: 200, ok: true, text: jest.fn().mockResolvedValue(data)})
let originalFetch = globalThis.fetch

let mockFetch: jest.MockedFunction<any>
const initWebFile = (url: string):[any, AppStateForObject] => {
    const state = new WebFileState({url, fetch: mockFetch})
    const appInterface = testAppInterface('testPath', state)
    return [state, appInterface]
}

beforeEach(() => {
    mockFetch = jest.fn()
})

test('gets pending then text of a file', async () => {
    const [webFile, appInterface] = initWebFile('https://example.com/myFile.txt')
    mockFetch.mockResolvedValueOnce(mockTextResponse('abc1'))
    const initialValue = webFile.value
    expect(initialValue).toBe(null)
    await wait()
    expect(webFile.value).toBe('abc1')
    expect(isPending(webFile.value)).toBe(false)
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/myFile.txt')
})

test('caches file contents', async () => {
    const [webFile, appInterface] = initWebFile('https://example.com/myFile.txt')
    mockFetch.mockResolvedValueOnce(mockTextResponse('abc1'))
    const initialValue = webFile.value
    expect(initialValue).toBe(null)
    await wait()
    expect(webFile.value).toBe('abc1')
    expect(isPending(webFile.value)).toBe(false)
    expect(webFile.value).toBe('abc1')
    expect(webFile.value).toBe('abc1')
    expect(mockFetch).toHaveBeenCalledTimes(1)
})

test('state objects equal with same url', () => {
    const state1 = new WebFileState({url: 'url1'})
    const state2 = new WebFileState({url: 'url1'})
    expect((state1 as any).isEqualTo(state2)).toBe(true)
})

test('valueOf state object is file contents', async () => {
    const [webFile, appInterface] = initWebFile('https://example.com/myFile.txt')
    mockFetch.mockResolvedValueOnce(mockTextResponse('abc1'))
    expect(webFile.valueOf()).toBe(null)
    await wait()
    expect(webFile.latest().valueOf()).toBe('abc1')

})
