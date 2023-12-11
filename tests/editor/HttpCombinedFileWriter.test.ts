import HttpCombinedFileWriter from '../../src/editor/HttpCombinedFileWriter'

let originalFetch = globalThis.fetch
afterAll(() => globalThis.fetch = originalFetch)

const files = {'file1.txt': 'File 1 contents'}

const makeWriter = (passwordFn: () => Promise<string> = async () => 'preview123') =>
    new HttpCombinedFileWriter(() => 'http://the.dev.server/preview', passwordFn)

test('puts file to given URL supplied as a function with preview password', async () => {
    const files = {'file1.txt': 'File 1 contents', 'dir1/file2.txt': 'File 2 contents\nLine 2'}
    globalThis.fetch = jest.fn().mockResolvedValue(new Response('', {status: 200}))
    const expectedBody = `
//// File: file1.txt
File 1 contents
//// End of file
//// File: dir1/file2.txt
File 2 contents
Line 2
//// End of file
`.trim()
    await expect(makeWriter().writeFiles(files)).resolves.toBe(undefined)
    expect(globalThis.fetch).toHaveBeenCalledWith('http://the.dev.server/preview', {
        method: 'PUT',
        body: expectedBody,
        headers: {
            'x-preview-password': 'preview123'
        }
    })
})

test('rejects promise if error in http call', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('Cannot do this 500'))
    await expect(makeWriter().writeFiles(files)).rejects.toStrictEqual(new Error('Cannot do this 500'))
})

test('rejects promise if bad status in http call', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(new Response('', {status: 401, statusText: 'No way'}))
    await expect(makeWriter().writeFiles(files)).rejects.toStrictEqual(new Error('No way 401'))
})

test('rejects promise if cannot get password', async () => {
    const error = new Error('Cannot get token')
    const writer = makeWriter(async () => { throw error} )
    await expect(writer.writeFiles(files)).rejects.toBe(error)
})

test('calls clean url with password', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(new Response('', {status: 200}))
    await expect(makeWriter().clean()).resolves.toBe(undefined)
    expect(globalThis.fetch).toHaveBeenCalledWith('http://the.dev.server/preview/clear', {
        method: 'POST',
        headers: {
            'x-preview-password': 'preview123'
        }
    })
})

test('rejects if clean url has bad status', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(new Response('', {status: 401, statusText: 'No way'}))
    await expect(makeWriter().clean()).rejects.toStrictEqual(new Error('No way 401'))
})
