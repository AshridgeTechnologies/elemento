import EditorServiceWorker from '../../src/editor/EditorServiceWorker'
import {FileSystemTree} from '../../src/editor/Types'
import {wait} from '../testutil/testHelpers'

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

const request = (url: string) => ({url}) as Request

let worker: EditorServiceWorker
let swScope: any

const dummySWScope = () => {
    const aClient = () => ({postMessage: jest.fn()} as unknown as WindowClient)
    const theClients = [aClient(), aClient()]
    swScope = {
        theClients,
        clients: {
            matchAll: async () => theClients
        } as unknown as Clients
    } as unknown as ServiceWorkerGlobalScope

    return swScope
}
beforeEach(() => {
    worker = new EditorServiceWorker(dummySWScope())
    const filesCopy = JSON.parse(JSON.stringify(files))
    worker.mount(filesCopy)
})

test('can get response for mounted file at top level', async () => {
    const result = await worker.handleRequest(request('http://example.com/preview/index.html'))
    expect(result.status).toBe(200)
    expect(result.headers.get('Content-Type')).toBe('text/html; charset=utf-8')
    expect(await result.text()).toBe('index.html contents')
})

test('can get response for mounted file in sub-directory', async () => {
    const result = await worker.handleRequest(request('http://example.com/preview/dir1/stuff.js'))
    expect(result.status).toBe(200)
    expect(result.headers.get('Content-Type')).toBe('application/javascript; charset=utf-8')
    expect(await result.text()).toBe('stuff.js contents')
})

test('can get not found response for non-existent top-level file', async () => {
    const result = await worker.handleRequest(request('http://example.com/preview/xxx.html'))
    expect(result.status).toBe(404)
})

test('can get not found response for non-existent file in sub dir', async () => {
    const result = await worker.handleRequest(request('http://example.com/preview/dir1/xxx.js'))
    expect(result.status).toBe(404)
})

test('can get not found response for non-existent dir', async () => {
    const result = await worker.handleRequest(request('http://example.com/preview/dir2/stuff.js'))
    expect(result.status).toBe(404)
})

test('passes through non-preview request', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = jest.fn()

    try {
        const req = request('http://example.com/otherthing/stuff.js')
        await worker.handleRequest(req)
        expect(globalThis.fetch).toHaveBeenCalledWith(req)
    } finally {
        globalThis.fetch = originalFetch
    }
})

test('mounts files from message', () => {
    const worker = new EditorServiceWorker(dummySWScope())
    const event = {data: {type: 'mount', fileSystem: files}} as ExtendableMessageEvent
    worker.message(event)
    // @ts-ignore
    expect(worker.fileSystem['index.html'].file.contents).toBe('index.html contents')
})

test('serves index.html if path empty', async () => {
    const result = await worker.handleRequest(request('https://example.com/preview/'))
    expect(await result.text()).toBe('index.html contents')
})

test('writes single new file from message', async () => {
    const event = {data: {type: 'write', path: 'dir1/morestuff.js', contents: 'morestuff.js contents'}} as ExtendableMessageEvent
    worker.message(event)
    // @ts-ignore
    expect(worker.getFileContents('dir1/morestuff.js')).toBe('morestuff.js contents')
    await wait(10)
    expect(swScope.theClients[0].postMessage).toHaveBeenCalledWith({type: 'refreshCode', path: 'dir1/morestuff.js'})
    expect(swScope.theClients[1].postMessage).toHaveBeenCalledWith({type: 'refreshCode', path: 'dir1/morestuff.js'})
})

test('updates single file from message', () => {
    const event = {data: {type: 'write', path: 'dir1/stuff.js', contents: 'stuff.js updated contents'}} as ExtendableMessageEvent
    worker.message(event)
    // @ts-ignore
    expect(worker.getFileContents('dir1/stuff.js')).toBe('stuff.js updated contents')
})

test('sends highlight message from editor', async () => {
    const event = {data: {type: 'editorHighlight', ids: ['Page1.Title']}} as ExtendableMessageEvent
    worker.message(event)
    // @ts-ignore
    await wait(10)
    expect(swScope.theClients[0].postMessage).toHaveBeenCalledWith({type: 'selectedItems', ids: ['Page1.Title']})
    expect(swScope.theClients[1].postMessage).toHaveBeenCalledWith({type: 'selectedItems', ids: ['Page1.Title']})
})

test('sends highlight message to editor', async () => {
    const event = {data: {type: 'componentSelected', id: 'Page1.Text1'}} as ExtendableMessageEvent
    worker.message(event)
    // @ts-ignore
    await wait(10)
    expect(swScope.theClients[0].postMessage).toHaveBeenCalledWith({type: 'componentSelected', id: 'Page1.Text1'})
    expect(swScope.theClients[1].postMessage).toHaveBeenCalledWith({type: 'componentSelected', id: 'Page1.Text1'})
})
