import RunnerServiceWorker from '../../src/runner/RunnerServiceWorker'
import {FileSystemTree} from '../../src/editor/Types'
import {MockFileSystemDirectoryHandle} from '../testutil/testHelpers'
// @ts-ignore
import str2ab from 'string-to-arraybuffer'

const mockFiles: FileSystemTree = {
    'Projects': {
        directory: {
            'ProjectOne': {
                directory: {
                    'dist': {
                        directory: {
                            'client': {
                                directory: {
                                    'AppOne': {
                                        directory: {
                                            'index.html': {
                                                file: {
                                                    contents: str2ab('top index.html contents')
                                                }
                                            },
                                            'files': {
                                                directory: {
                                                    'stuff.js': {
                                                        file: {
                                                            contents: str2ab('stuff.js contents')
                                                        }
                                                    },
                                                    'another.file': {
                                                        file: {
                                                            contents: str2ab('another.file contents')
                                                        }
                                                    },
                                                    'index.html': {
                                                        file: {
                                                            contents: str2ab('other index.html contents')
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
            }
        }
    }
}

const request = (url: string) => ({url}) as Request

globalThis.navigator = {
    storage: {
        getDirectory(): Promise<FileSystemDirectoryHandle> {
            return Promise.resolve(new MockFileSystemDirectoryHandle('root', mockFiles))
        }
    }
} as Navigator

let swScope: any

const dummySWScope = () => {
    swScope = {} as unknown as ServiceWorkerGlobalScope
    return swScope
}

let worker: RunnerServiceWorker
beforeEach(() => {
    worker = new RunnerServiceWorker(dummySWScope())
})

test('mocks work', async () => {
    const opfsRoot = await navigator.storage.getDirectory()
    const githubRoot = await opfsRoot.getDirectoryHandle('Projects')
    const projRoot = await githubRoot.getDirectoryHandle('ProjectOne')
    const distRoot = await projRoot.getDirectoryHandle('dist')
    const clientRoot = await distRoot.getDirectoryHandle('client')
    const appRoot = await clientRoot.getDirectoryHandle('AppOne')
    const indexContents = await appRoot.getFileHandle('index.html').then( handle => handle.getFile() ).then( file => file.text() )
    expect(indexContents).toStrictEqual(str2ab('top index.html contents'))

    const stuffContents = await appRoot.getDirectoryHandle('files')
        .then(handle => handle.getFileHandle('stuff.js'))
        .then(handle => handle.getFile())
        .then(file => file.text())
    expect(stuffContents).toStrictEqual(str2ab('stuff.js contents'))
})

test('can get response for OPFS file at top level', async () => {
    const result = await worker.handleRequest(request('http://example.com/run/local/opfs/ProjectOne/AppOne/index.html'))
    expect(result.status).toBe(200)
    expect(result.headers.get('Content-Type')).toBe('text/html; charset=utf-8')
    expect(await result.arrayBuffer()).toStrictEqual(str2ab('top index.html contents'))
})

test('can get response for OPFS file in sub-directory', async () => {
    const result = await worker.handleRequest(request('http://example.com/run/local/opfs/ProjectOne/AppOne/files/stuff.js'))
    expect(result.status).toBe(200)
    expect(result.headers.get('Content-Type')).toBe('application/javascript; charset=utf-8')
    expect(await result.arrayBuffer()).toStrictEqual(str2ab('stuff.js contents'))
})

test('can get not found response for non-existent OPFS dir', async () => {
    const result = await worker.handleRequest(request('http://example.com/run/local/opfs/ProjectOne/AppX/index.html'))
    expect(result.status).toBe(404)
})


test('serves index.html if top-level path ends in /', async () => {
    const result = await worker.handleRequest(request('https://example.com/run/local/opfs/ProjectOne/AppOne/'))
    expect(await result.text()).toBe('top index.html contents')
})

test('serves top level index.html if non-existent sub-dir path ends in /', async () => {
    const result = await worker.handleRequest(request('https://example.com/run/local/opfs/ProjectOne/AppOne/dir1/'))
    expect(await result.text()).toBe('top index.html contents')
})

test('serves specific index.html if exact path given', async () => {
    const result = await worker.handleRequest(request('https://example.com/run/local/opfs/ProjectOne/AppOne/files/index.html'))
    expect(await result.text()).toBe('other index.html contents')
})

test('serves top level index.html if non-existent sub-dir path does not end in /', async () => {
    const result = await worker.handleRequest(request('https://example.com/run/local/opfs/ProjectOne/AppOne/PageOne/stuff'))
    expect(await result.text()).toBe('top index.html contents')
})
test('serves top level index.html for non-existent top-level file', async () => {
    const result = await worker.handleRequest(request('http://example.com/run/local/opfs/ProjectOne/AppOne/xxx.html'))
    expect(await result.text()).toBe('top index.html contents')
})

test('serves top level index.html for non-existent file in sub dir', async () => {
    const result = await worker.handleRequest(request('http://example.com/run/local/opfs/ProjectOne/AppOne/files/xxx.js'))
    expect(await result.text()).toBe('top index.html contents')
})

test('serves top level index.html for non-existent dir', async () => {
    const result = await worker.handleRequest(request('http://example.com/run/local/opfs/ProjectOne/AppOne/dir2/stuff.js'))
    expect(await result.text()).toBe('top index.html contents')
})

test('passes through non-app file requests', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = jest.fn()

    try {
        {
            const req = request('http://example.com/run/otherthing/stuff.js')
            await worker.handleRequest(req)
            expect(globalThis.fetch).toHaveBeenCalledWith(req)
        }
        {
            const req = request('http://example.com/run/')
            await worker.handleRequest(req)
            expect(globalThis.fetch).toHaveBeenCalledWith(req)
        }
    } finally {
        globalThis.fetch = originalFetch
    }
})
