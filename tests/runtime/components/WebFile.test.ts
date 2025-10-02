import {afterAll, beforeEach, expect, MockInstance, test, vi} from 'vitest'
import {isPending} from '../../../src/shared/DataStore'
import {wait} from '../../testutil/testHelpers'
import {WebFileState} from '../../../src/runtime/components/WebFile'

import AppStateStore from '../../../src/runtime/state/AppStateStore'
import {ComponentStateStore} from '../../../src/runtime/state/BaseComponentState'

const mockTextResponse = (data: string) => ({status: 200, ok: true, text: vi.fn().mockResolvedValue(data)})

let mockFetch: MockInstance

const initWebFile = (url: string):[any, AppStateStore] => {
    const store = new ComponentStateStore()
    vi.spyOn(store, 'update')
    const state = store.getOrUpdate('id1', WebFileState, {url})
    return [state, store]
}


beforeEach(() => {
    mockFetch = vi.spyOn(globalThis, 'fetch')
})

afterAll(() => mockFetch.mockRestore())

test('gets pending then text of a file', async () => {
    const [webFile] = initWebFile('https://example.com/myFile.txt')
    mockFetch.mockResolvedValueOnce(mockTextResponse('abc1'))
    const initialValue = webFile.value
    expect(initialValue).toBe(null)
    await wait()
    expect(webFile.value).toBe('abc1')
    expect(isPending(webFile.value)).toBe(false)
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/myFile.txt')
})

test('caches file contents', async () => {
    const [webFile] = initWebFile('https://example.com/myFile.txt')
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
    const [webFile] = initWebFile('https://example.com/myFile.txt')
    mockFetch.mockResolvedValueOnce(mockTextResponse('abc1'))
    expect(webFile.valueOf()).toBe(null)
    await wait()
    expect(webFile.valueOf()).toBe('abc1')

})
