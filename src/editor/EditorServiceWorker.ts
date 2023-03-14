import mime from 'mime-types'
import {DirectoryNode, FileNode, FileSystemTree} from './Types'


export default class EditorServiceWorker {

    constructor(private swSelf: ServiceWorkerGlobalScope) {}
    private fileSystem: FileSystemTree = {}

    fetch = (event: FetchEvent) => {
        event.respondWith(this.handleRequest(event.request))
    }

    message = (event: ExtendableMessageEvent) => {
        const {data} = event
        // console.log('SW', data)

        if (data?.type === 'mount') {
            this.mount(data.fileSystem)
        }

        if (data?.type === 'write') {
            this.writeFile(data.path, data.contents)
            this.sendUpdate(data.path)
        }

        if (data?.type === 'editorHighlight') {
            this.sendEditorHighlight(data.ids)
        }
    }

    install = (event: ExtendableEvent) => {
        event.waitUntil(Promise.resolve());
    }

    async handleRequest(request: Request) {

        const url = new URL(request.url)
        const pathname = decodeURIComponent(url.pathname)

        const [, filepath] = pathname.match(new RegExp(`^\/preview\/(.*)$`)) ?? []
        if (filepath !== undefined) {
            const requestFilepath = filepath === '' ? 'index.html' : filepath
            const file = this.getFileContents(requestFilepath)
            if (!file) {
                return new Response(null, {status: 404, statusText: 'File not found (in service worker)'})
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

    private getLastDirAndFilename(path: string) : [dir: FileSystemTree | null, filename: string | null] {
        const pathSegments = path.split('/')
        const dirNames = pathSegments.slice(0, -1)
        const filename = pathSegments.at(-1) ?? null
        let dir = this.fileSystem
        for (const name of dirNames) {
            dir = (dir[name] as DirectoryNode)?.directory ?? null
            if (!dir) {
                break
            }
        }

        return [dir, filename]
    }

    private getFileContents(path: string): string | Uint8Array | null {
        const [dir, filename] = this.getLastDirAndFilename(path)
        return (dir && filename && (dir[filename] as FileNode)?.file.contents) ?? null
    }

    private writeFile(path: string, contents: string | Uint8Array) {
        const [dir, filename] = this.getLastDirAndFilename(path)

        if (dir && filename) {
            dir[filename] = {
                file: {contents}
            }
        }
    }

    mount(fileTree: FileSystemTree) {
        this.fileSystem = fileTree
    }

    private async sendToClients(type: string, data: object) {
        const clients = await this.swSelf.clients.matchAll({
            includeUncontrolled: true,
            type: 'window',
        })
        clients.forEach(client => client.postMessage({type, ...data}))
    }

    async sendUpdate(filepath: string) {
        this.sendToClients('refreshCode', {path: filepath})
    }

    async sendEditorHighlight(ids: string[]) {
        await this.sendToClients('selectedItems', {ids})
    }
}