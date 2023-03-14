import mime from 'mime-types'
import {FileSystemTree} from './Types'


export default class EditorServiceWorker {
    private fileSystem: FileSystemTree = {}

    fetch = (event) => {
        event.respondWith(this.handleRequest(event.request))
    }

    message = (event) => {
        const {data} = event
        // console.log('SW', data)

        if (data && data.type === 'mount') {
            // console.log('SW', 'mount', data)
            this.mount(data.fileSystem)
        }
    }

    install = (event) => {
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
            const extension = requestFilepath.match(/\.\w+$/)[0]
            return new Response(file, {
                headers: {
                    'Content-Type': mime.contentType(extension)
                }
            })
        }
        return fetch(request)
    }

    private getFileContents(path: string): string | Uint8Array {
        const pathSegments = path.split('/')
        const dirNames = pathSegments.slice(0, -1)
        const filename = pathSegments.at(-1)
        let dir = this.fileSystem
        for (const name of dirNames) {
            dir = dir[name]?.directory
            if (!dir) {
                return null
            }
        }

        return dir[filename]?.file.contents ?? null
    }

    mount(fileTree: FileSystemTree) {
        this.fileSystem = fileTree
    }
}