import {beforeEach, expect, afterAll, MockInstance, test, vi} from 'vitest'
import {isPending} from '../../../src/shared/DataStore'
import {testAppInterface, wait} from '../../testutil/testHelpers'
import {WebFileState} from '../../../src/runtime/components/WebFile'

import {AppStateForObject} from '../../../src/runtime/state/AppStateStore'

const mockTextResponse = (data: string) => ({status: 200, ok: true, text: vi.fn().mockResolvedValue(data)})

let mockFetch: MockInstance

const initWebFile = (url: string):[any, AppStateForObject] => {
    const state = new WebFileState({url})
    const appInterface = testAppInterface('testPath', state)
    return [state, appInterface]
}

beforeEach(() => {
    mockFetch = vi.spyOn(globalThis, 'fetch')
})

afterAll(() => mockFetch.mockRestore())

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

test('valueOf state object is file contents', async () => {
    const [webFile, appInterface] = initWebFile('https://example.com/myFile.txt')
    mockFetch.mockResolvedValueOnce(mockTextResponse('abc1'))
    expect(webFile.valueOf()).toBe(null)
    await wait()
    expect(webFile.latest().valueOf()).toBe('abc1')

})
