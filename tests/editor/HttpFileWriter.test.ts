import HttpFileWriter from '../../src/editor/HttpFileWriter'

let originalFetch = globalThis.fetch
beforeEach(() => globalThis.fetch = jest.fn().mockResolvedValue(undefined) )
afterAll(() => globalThis.fetch = originalFetch)

test('puts file to given URL', async () => {
    const writer = new HttpFileWriter('http://the.dev.server/file')
    const contents = 'The file contents'
    await expect(writer.writeFile('dir1/TheApp.js', contents)).resolves.toBe(undefined)
    expect(globalThis.fetch).toHaveBeenCalledWith('http://the.dev.server/file/dir1/TheApp.js', {
        method: "PUT",
        body: contents,
    })
})

test('puts file to given URL supplied as a function', async () => {
    const writer = new HttpFileWriter(() => 'http://the.dev.server/file')
    const contents = 'The file contents'
    await expect(writer.writeFile('dir1/TheApp.js', contents)).resolves.toBe(undefined)
    expect(globalThis.fetch).toHaveBeenCalledWith('http://the.dev.server/file/dir1/TheApp.js', {
        method: "PUT",
        body: contents,
    })
})
