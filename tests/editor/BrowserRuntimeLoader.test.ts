import BrowserRuntimeLoader from '../../src/editor/BrowserRuntimeLoader'

let originalFetch = globalThis.fetch
beforeEach(() => globalThis.fetch = jest.fn().mockResolvedValue({text: () => Promise.resolve('Contents of file')}))
afterAll(() => globalThis.fetch = originalFetch)

test('gets client runtime files from given URL', async () => {
    const loader = new BrowserRuntimeLoader('http://the.elemento.server')
    await expect(loader.getFile('runtime.js')).resolves.toBe('Contents of file')
    expect(globalThis.fetch).toHaveBeenCalledWith('http://the.elemento.server/runtime/runtime.js')
})

test('gets server runtime files from given URL', async () => {
    const loader = new BrowserRuntimeLoader('http://the.elemento.server')
    await expect(loader.getFile('serverRuntime.js')).resolves.toBe('Contents of file')
    expect(globalThis.fetch).toHaveBeenCalledWith('http://the.elemento.server/serverRuntime/serverRuntime.js')
})
