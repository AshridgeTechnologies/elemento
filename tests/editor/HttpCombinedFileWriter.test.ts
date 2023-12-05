import HttpCombinedFileWriter from '../../src/editor/HttpCombinedFileWriter'
import {CombinedFileWriter} from '../../src/generator/ProjectBuilder'

let originalFetch = globalThis.fetch
afterAll(() => globalThis.fetch = originalFetch)

test('puts file to given URL supplied as a function with firebase access token', async () => {
    const writer: CombinedFileWriter = new HttpCombinedFileWriter(() => 'http://the.dev.server/preview', ()=> 'firebase-token-123')
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
    await expect(writer.writeFiles(files)).resolves.toBe(undefined)
    expect(globalThis.fetch).toHaveBeenCalledWith('http://the.dev.server/preview', {
        method: 'PUT',
        body: expectedBody,
        headers: {
            'x-firebase-access-token': 'firebase-token-123'
        }
    })
})

test('rejects promise if error in http call', async () => {
    const writer: CombinedFileWriter = new HttpCombinedFileWriter(() => 'http://the.dev.server/preview', () => 'firebase-token-123')
    const files = {'file1.txt': 'File 1 contents'}
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('Cannot do this 500'))
    await expect(writer.writeFiles(files)).rejects.toStrictEqual(new Error('Cannot do this 500'))
})

test('rejects promise if bad status in http call', async () => {
    const writer: CombinedFileWriter = new HttpCombinedFileWriter(() => 'http://the.dev.server/preview', () => 'firebase-token-123')
    const files = {'file1.txt': 'File 1 contents'}
    globalThis.fetch = jest.fn().mockResolvedValue(new Response('', {status: 401, statusText: 'No way'}))
    await expect(writer.writeFiles(files)).rejects.toStrictEqual(new Error('No way 401'))
})
