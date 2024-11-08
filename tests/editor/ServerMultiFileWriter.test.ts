import ServerMultiFileWriter from '../../src/editor/ServerMultiFileWriter'
import {Status} from '../../src/editor/ThrottledCombinedFileWriter'
import {wait} from '../testutil/testHelpers'
import {FileWriter} from '../../src/generator/ProjectBuilder'

let originalFetch = globalThis.fetch
afterAll(() => globalThis.fetch = originalFetch)

let onStatusChange: (newStatus: Status) => void
let writer1: FileWriter, writer2: FileWriter
beforeEach(() => {
    onStatusChange = jest.fn()
    writer1 = {writeFile: jest.fn()}
    writer2 = {writeFile: jest.fn()}
})

const makeWriter = (...writers: FileWriter[]) =>
    new ServerMultiFileWriter({previewUploadUrl: () => 'http://the.dev.server/preview',
        previewPassword: async () => 'firebase-123',
        delay: 50,
        onServerUpdateStatusChange: onStatusChange,
        writers
    })

test('puts file to given URL supplied as a function with firebase access token', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(new Response('', {status: 200}))
    const expectedBody = `
//// File: server/file1.txt
File 1 contents
//// End of file
`.trim()
    await expect(makeWriter().writeFile('file1.txt', 'File 1 contents')).resolves.toBe(undefined)
    await wait(70)
    expect(globalThis.fetch).toHaveBeenCalledWith('http://the.dev.server/preview/', {
        method: 'PUT',
        body: expectedBody,
        headers: {
            'x-preview-password': 'firebase-123'
        }
    })
    expect(onStatusChange).toHaveBeenNthCalledWith(1, 'waiting')
    expect(onStatusChange).toHaveBeenNthCalledWith(2, 'updating')
    expect(onStatusChange).toHaveBeenNthCalledWith(3, 'complete')
})

test('writes file to other writers immediately', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(new Response('', {status: 200}))
    await expect(makeWriter(writer1, writer2).writeFile('file1.txt', 'File 1 contents')).resolves.toBe(undefined)
    expect(writer1.writeFile).toHaveBeenCalledWith('file1.txt', 'File 1 contents')
    expect(writer2.writeFile).toHaveBeenCalledWith('file1.txt', 'File 1 contents')
})

test('flushes files', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(new Response('', {status: 200}))
    const expectedBody = `
//// File: server/file1.txt
File 1 contents
//// End of file
`.trim()
    const writer = makeWriter()
    await expect(writer.writeFile('file1.txt', 'File 1 contents')).resolves.toBe(undefined)
    expect(globalThis.fetch).not.toHaveBeenCalled()
    await writer.flush()
    await wait(10)
    expect(globalThis.fetch).toHaveBeenCalledWith('http://the.dev.server/preview/', {
        method: 'PUT',
        body: expectedBody,
        headers: {
            'x-preview-password': 'firebase-123'
        }
    })
    expect(onStatusChange).toHaveBeenNthCalledWith(1, 'waiting')
    expect(onStatusChange).toHaveBeenNthCalledWith(2, 'updating')
    expect(onStatusChange).toHaveBeenNthCalledWith(3, 'complete')
})

test('cleans preview server', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(new Response('', {status: 200}))
    const writer = makeWriter()
    await writer.clean()
    expect(globalThis.fetch).toHaveBeenCalledWith('http://the.dev.server/preview/clear', {
        method: 'POST',
        headers: {
            'x-preview-password': 'firebase-123'
        }
    })
})



