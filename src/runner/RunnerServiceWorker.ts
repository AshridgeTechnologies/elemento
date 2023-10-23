import mime from 'mime-types'
import {internalProjectsDir, pathSegments} from '../shared/fileSystem'

function makeRequestFilepath(filepath: string) {
    if (!filepath) return 'index.html'
    if (filepath.endsWith('/')) return filepath + 'index.html'
    return filepath
}

export default class RunnerServiceWorker {

    constructor(private swSelf: ServiceWorkerGlobalScope) {}

    fetch = (event: FetchEvent) => {
        event.respondWith(this.handleRequest(event.request))
    }

    message = (event: ExtendableMessageEvent) => {
        const {data} = event

        if (data?.type === 'dir') {
            const {dirHandle} = data
            console.log('Runner service worker', 'dir', dirHandle)
            this.diskDirs[dirHandle.name] = dirHandle
        }
    }

    install = (event: ExtendableEvent) => {
        event.waitUntil(this.swSelf.skipWaiting().then( () => console.log('Skip waiting in install complete')))
        console.log('Waiting at end of install')
    }

    diskDirs = {} as {[index: string]: FileSystemDirectoryHandle}

    async handleRequest(request: Request): Promise<Response> {
        const url = new URL(request.url)
        const pathname = decodeURIComponent(url.pathname)

        const [, area, projectName, appName, filepath] = pathname.match(/^\/run\/local\/(opfs|disk)\/([-\w ]+)\/([-\w ]+)\/?(.*)?$/) ?? []

        const getFile = async (requestFilepath: string) => {
            const [topDir, diskFilepath] = area === 'opfs'
                ? [await internalProjectsDir(), `${projectName}/dist/client/${appName}/${requestFilepath}`]
                : [this.diskDirs[projectName], `dist/client/${appName}/${requestFilepath}`]
            return await this.getFileContents(topDir, diskFilepath)
        }
        if (projectName !== undefined) {
            let requestFilepath = makeRequestFilepath(filepath)
            let file = await getFile(requestFilepath)
            if (!file) {
                requestFilepath = makeRequestFilepath('index.html')
                file = await getFile(requestFilepath)
            }
            if (!file) {
                return new Response(null, {status: 404, statusText: `File ${filepath} not found (in service worker)`})
            }
            const extension = requestFilepath.match(/\.\w+$/)?.[0] ?? '.txt'
            const contentType = mime.contentType(extension) || 'text/plain'
            return new Response(file, {
                headers: {
                    'Content-Type': contentType
                }
            })
        }

        return fetch(request)
    }

    private async getLastDirAndFilename(topDir: FileSystemDirectoryHandle, path: string): Promise<[dir: FileSystemDirectoryHandle | null, filename: string | null]> {
        const dirNames = pathSegments(path).slice(0, -1)
        const filename = pathSegments(path).at(-1) ?? null
        let dir: FileSystemDirectoryHandle | null = topDir
        for (const name of dirNames) {
            await dir.getDirectoryHandle(name).then( d => dir = d).catch( ()=> dir = null)
            if (!dir) {
                break
            }
        }

        return [dir, filename]
    }

    private async getFileContents(topDir: FileSystemDirectoryHandle, path: string): Promise<Uint8Array | null> {
        const [dir, filename] = await this.getLastDirAndFilename(topDir, path)
        if (dir && filename) {
            let fileHandle, file
            try {
                fileHandle = await dir.getFileHandle(filename)
                file = await fileHandle.getFile()
                return new Uint8Array(await file.arrayBuffer())
            } catch (e) {}
        }

        return null
    }
}