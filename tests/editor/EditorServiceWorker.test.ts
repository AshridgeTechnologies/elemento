import EditorServiceWorker from '../../src/editor/EditorServiceWorker'
import {FileSystemTree} from '../../src/editor/Types'
import {MockFileSystemDirectoryHandle, wait} from '../testutil/testHelpers'
// @ts-ignore
import str2ab from 'string-to-arraybuffer'

const files: FileSystemTree = {
    dist: {
        directory: {
            client: {
                directory: {
                    'index.html': {
                        file: {
                            contents: 'top index.html contents'
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
                            },
                            'index.html': {
                                file: {
                                    contents: 'dir1 index.html contents'
                                }
                            },
                        }
                    },
                    'tools': {
                        directory: {
                            'Tool1': {
                                directory: {
                                    'toolstuff.js': {
                                        file: {
                                            contents: 'toolstuff.js contents'
                                        }
                                    },
                                    'index.html': {
                                        file: {
                                            contents: 'Tool1 index.html contents'
                                        }
                                    },
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

const request = (url: string, options?: {method?: string, body?: any, headers: any}) => {
    const requestBody = options?.body ? str2ab(options.body) : new ArrayBuffer(0)
    return {
        url, method: options?.method, headers: options?.headers,
        body: options?.body ? str2ab(options.body) : undefined,
        arrayBuffer(): Promise<ArrayBuffer> {
            return Promise.resolve(requestBody)
        }
    } as unknown as Request
}

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
    worker = new EditorServiceWorker(dummySWScope(), 100)
    const filesCopy = JSON.parse(JSON.stringify(files))
    worker.message({data: {type: 'projectStore', projectId: 'project-123', dirHandle: new MockFileSystemDirectoryHandle('root', filesCopy)}} as ExtendableMessageEvent)
})

test('can NOT get response for mounted file at top level', async () => {
    const result = await worker.handleRequest(request('http://example.com/studio/preview/project-123/index.html'))
    expect(result.status).toBe(404)
})

test('can get response for mounted file in sub-directory', async () => {
    const result = await worker.handleRequest(request('http://example.com/studio/preview/project-123/dir1/stuff.js'))
    expect(result.status).toBe(200)
    expect(result.headers.get('Content-Type')).toBe('application/javascript; charset=utf-8')
    expect(await result.text()).toBe('stuff.js contents')
})

test('can get response for mounted file in sub-directory after waiting for project dir handle', async () => {

    const filesCopy345 = JSON.parse(JSON.stringify(files).replace(/dir1/g, 'dir2').replace(/stuff.js contents/, 'stuff.js 345 contents'))
    const resultPromise = worker.handleRequest(request('http://example.com/studio/preview/project-345/dir2/stuff.js'))

    await wait(10)
    expect(swScope.theClients[0].postMessage).toHaveBeenCalledWith({type: 'dirHandleRequest', projectId: 'project-345'})
    expect(swScope.theClients[1].postMessage).toHaveBeenCalledWith({type: 'dirHandleRequest', projectId: 'project-345'})

    worker.message({data: {type: 'projectStore', projectId: 'project-345', dirHandle: new MockFileSystemDirectoryHandle('root', filesCopy345)}} as ExtendableMessageEvent)
    await wait(10)
    const result = await resultPromise
    expect(await result.text()).toBe('stuff.js 345 contents')
})

test('can get not found response for file in sub-directory after timeout waiting for project dir handle', async () => {
    const result = await worker.handleRequest(request('http://example.com/studio/preview/project-345/dir2/stuff.js'))
    expect(result.status).toBe(404)
})

test('can get response for mounted file in tools sub-directory', async () => {
    const result = await worker.handleRequest(request('http://example.com/studio/preview/project-123/tools/Tool1/toolstuff.js'))
    expect(result.status).toBe(200)
    expect(result.headers.get('Content-Type')).toBe('application/javascript; charset=utf-8')
    expect(await result.text()).toBe('toolstuff.js contents')
})

test('can get not found response for non-existent top-level file', async () => {
    const result = await worker.handleRequest(request('http://example.com/studio/preview/project-123/xxx.html'))
    expect(result.status).toBe(404)
})

test('can get not found response for non-existent file in sub dir', async () => {
    const result = await worker.handleRequest(request('http://example.com/studio/preview/project-123/dir1/xxx.js'))
    expect(result.status).toBe(404)
})

test('can get not found response for non-existent dir', async () => {
    const result = await worker.handleRequest(request('http://example.com/studio/preview/project-123/dir2/stuff.js'))
    expect(result.status).toBe(404)
})

test('passes through non-preview request', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = jest.fn()

    try {
        const req = request('http://example.com/studio/otherthing/stuff.js')
        await worker.handleRequest(req)
        expect(globalThis.fetch).toHaveBeenCalledWith(req)
    } finally {
        globalThis.fetch = originalFetch
    }
})

test('does NOT serve index.html if top-level path ends in /', async () => {
    const result = await worker.handleRequest(request('https://example.com/studio/preview/project-123/'))
    expect(result.status).toBe(404)
})

test('serves index.html if sub-dir path ends in /', async () => {
    const result = await worker.handleRequest(request('https://example.com/studio/preview/project-123/dir1/'))
    expect(await result.text()).toBe('dir1 index.html contents')
})

test('serves index.html if tools sub-dir path ends in /', async () => {
    const result = await worker.handleRequest(request('https://example.com/studio/preview/project-123/tools/Tool1/'))
    expect(await result.text()).toBe('Tool1 index.html contents')
})

test('serves version file with commitId of preview', async () => {
    const result = await worker.handleRequest(request('https://example.com/version'))
    const jsonResult = await result.json()
    expect(jsonResult).toHaveProperty('commitId', 'preview')
})

test('sends firebaseConfig request to preview server', async () => {
    const event = {data: {type: 'previewServer', url: 'https://preview.example.com/preview-function'}} as ExtendableMessageEvent
    worker.message(event)
    await wait(10)

    const originalFetch = globalThis.fetch
    globalThis.fetch = jest.fn()

    try {
        const req = request('http://example.com/firebaseConfig.json')
        await worker.handleRequest(req)
        expect(globalThis.fetch).toHaveBeenCalledWith('https://preview.example.com/preview-function/preview/firebaseConfig.json')
    } finally {
        globalThis.fetch = originalFetch
    }
})

test('stores preview server url and sends capi request to preview server with headers supplied', async () => {
    const event = {data: {type: 'previewServer', url: 'https://preview.example.com/preview-function'}} as ExtendableMessageEvent
    worker.message(event)
    await wait(10)

    const originalFetch = globalThis.fetch
    globalThis.fetch = jest.fn()

    try {
        const req = request('http://example.com/capi/preview/SomeApp/SomeFunction?abc=22', {headers: {'Authorization': 'Bearer xyz123'}})
        await worker.handleRequest(req)
        expect(globalThis.fetch).toHaveBeenCalledWith('https://preview.example.com/preview-function/capi/preview/SomeApp/SomeFunction?abc=22', {headers: {'Authorization': 'Bearer xyz123'}})
    } finally {
        globalThis.fetch = originalFetch
    }
})

test('sends capi POST request to preview server', async () => {
    const event = {data: {type: 'previewServer', url: 'https://preview.example.com/preview-function'}} as ExtendableMessageEvent
    worker.message(event)
    await wait(10)

    const originalFetch = globalThis.fetch
    globalThis.fetch = jest.fn()

    try {
        const req = request('http://example.com/capi/preview/SomeApp/SomeFunction?abc=22', {method: 'POST', body: '{"a": 10}', headers: {'Content-Type': 'stuff'}})
        await worker.handleRequest(req)
        expect(globalThis.fetch).toHaveBeenCalledWith('https://preview.example.com/preview-function/capi/preview/SomeApp/SomeFunction?abc=22',
            {method: 'POST', body: str2ab('{"a": 10}'), headers: {'Content-Type': 'stuff'}})
    } finally {
        globalThis.fetch = originalFetch
    }
})

test('sends highlight message from editor', async () => {
    const event = {data: {type: 'editorHighlight', ids: ['Page1.Title']}} as ExtendableMessageEvent
    worker.message(event)
    // @ts-ignore
    await wait(10)
    expect(swScope.theClients[0].postMessage).toHaveBeenCalledWith({type: 'selectedItems', ids: ['Page1.Title']})
    expect(swScope.theClients[1].postMessage).toHaveBeenCalledWith({type: 'selectedItems', ids: ['Page1.Title']})
})

test('sends callFunction message from editor', async () => {
    const event = {data: {type: 'callFunction', componentId: 'Page1.TextInput2', functionName: 'Set', args: ['99']}} as ExtendableMessageEvent
    worker.message(event)
    // @ts-ignore
    await wait(10)
    expect(swScope.theClients[0].postMessage).toHaveBeenCalledWith({type: 'callFunction', componentId: 'Page1.TextInput2', functionName: 'Set', args: ['99']})
    expect(swScope.theClients[1].postMessage).toHaveBeenCalledWith({type: 'callFunction', componentId: 'Page1.TextInput2', functionName: 'Set', args: ['99']})
})

test('sends highlight message to editor', async () => {
    const event = {data: {type: 'componentSelected', id: 'Page1.Text1'}} as ExtendableMessageEvent
    worker.message(event)
    // @ts-ignore
    await wait(10)
    expect(swScope.theClients[0].postMessage).toHaveBeenCalledWith({type: 'componentSelected', id: 'Page1.Text1'})
    expect(swScope.theClients[1].postMessage).toHaveBeenCalledWith({type: 'componentSelected', id: 'Page1.Text1'})
})
