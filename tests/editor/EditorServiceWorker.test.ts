import EditorServiceWorker from '../../src/editor/EditorServiceWorker'
import {FileSystemTree} from '../../src/editor/Types'

const files: FileSystemTree = {
    'index.html': {
        file: {
            contents: 'index.html contents'
        }
    },
    'dir1': {
        directory: {
            'stuff.js': {
                file: {
                    contents: 'stuff.js contents'
                }
            },
            'another.file': {
                file: {
                    contents: 'another.file contents'
                }
            }
        }
    }
}

const worker = new EditorServiceWorker()
worker.mount(files)

test('can get response for mounted file at top level', async () => {
    const result = await worker.handleRequest({url: 'http://example.com/preview/index.html'})
    expect(result.status).toBe(200)
    expect(result.headers.get('Content-Type')).toBe('text/html; charset=utf-8')
    expect(await result.text()).toBe('index.html contents')
})

test('can get response for mounted file in sub-directory', async () => {
    const result = await worker.handleRequest({url: 'http://example.com/preview/dir1/stuff.js'})
    expect(result.status).toBe(200)
    expect(result.headers.get('Content-Type')).toBe('application/javascript; charset=utf-8')
    expect(await result.text()).toBe('stuff.js contents')
})

test('can get not found response for non-existent top-level file', async () => {
    const result = await worker.handleRequest({url: 'http://example.com/preview/xxx.html'})
    expect(result.status).toBe(404)
})

test('can get not found response for non-existent file in sub dir', async () => {
    const result = await worker.handleRequest({url: 'http://example.com/preview/dir1/xxx.js'})
    expect(result.status).toBe(404)
})

test('can get not found response for non-existent dir', async () => {
    const result = await worker.handleRequest({url: 'http://example.com/preview/dir2/stuff.js'})
    expect(result.status).toBe(404)
})

test('passes through non-preview request', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = jest.fn()

    try {
        const request = {url: 'http://example.com/otherthing/stuff.js'}
        await worker.handleRequest(request)
        expect(globalThis.fetch).toHaveBeenCalledWith(request)
    } finally {
        globalThis.fetch = originalFetch
    }
})

test('mounts files from message', () => {
    const worker = new EditorServiceWorker()
    const event = {data: {type: 'mount', fileSystem: files}}
    worker.message(event)
    expect(worker.fileSystem['index.html'].file.contents).toBe('index.html contents')
})

test('serves index.html if path empty', async () => {
    const result = await worker.handleRequest({url: 'https://example.com/preview/'})
    expect(await result.text()).toBe('index.html contents')
})
