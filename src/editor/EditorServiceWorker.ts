import mime from 'mime-types'
import {DirectoryNode, FileNode, FileSystemTree} from './Types'
import assert from "assert";

import {pathSegments} from '../util/helpers'


const dirName = (path: string) => pathSegments(path).slice(0, -1).join('/')

export default class EditorServiceWorker {

    constructor(private swSelf: ServiceWorkerGlobalScope) {}
    private fileSystem: FileSystemTree = {}
    private previewServerUrl: string | null = null

    fetch = (event: FetchEvent) => {
        event.respondWith(this.handleRequest(event.request))
    }

    message = (event: ExtendableMessageEvent) => {
        const {data} = event

        if (data?.type === 'write') {
            this.writeFile(data.path, data.contents)
            this.sendUpdate(data.path)
        }

        if (data?.type === 'rename') {
            this.renameFile(data.oldPath, data.newPath)
            this.sendUpdate(data.path)
        }

        if (data?.type === 'editorHighlight') {
            this.sendEditorHighlight(data.ids)
        }

        if (data?.type === 'componentSelected') {
            this.sendClientHighlight(data.id)
        }

        if (data?.type === 'callFunction') {
            this.sendCallFunction(data.componentId, data.functionName, data.args)
        }

        if (data?.type === 'previewServer') {
            this.previewServerUrl = data.url
        }
    }

    install = (event: ExtendableEvent) => {
        event.waitUntil(this.swSelf.skipWaiting().then( () => console.log('Skip waiting in install complete')))
        console.log('Waiting at end of install')
    }

    async handleRequest(request: Request) {

        const url = new URL(request.url)
        const pathname = decodeURIComponent(url.pathname)

        if (pathname.startsWith('/capi/')) {
            const {method, headers} = request
            const body = await request.arrayBuffer()
            const options = method === 'POST' ? {method, body, headers} : {}
            return fetch(`${this.previewServerUrl}${url.pathname}${url.search}`, options)
        }

        if (pathname === '/firebaseConfig.json') {
            return fetch(`${this.previewServerUrl}/preview${url.pathname}`)
        }

        const [, filepath] = pathname.match(new RegExp(`^\/studio\/preview\/(.*)$`)) ?? []
        if (filepath !== undefined) {
            const requestFilepath = pathname.endsWith('/') ? filepath + 'index.html' : filepath
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

        if (pathname === '/version') {
            return new Response(JSON.stringify({commitId: 'preview'}), {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }

        return fetch(request)
    }

    private getLastDirAndFilename(path: string) : [dir: FileSystemTree | null, filename: string | null] {
        const dirNames = pathSegments(path).slice(0, -1)
        const filename = pathSegments(path).at(-1) ?? null
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

    private makeDir(path: string) {
        const dirNames = pathSegments(path)
        let dir = this.fileSystem

        for (const name of dirNames) {
            const nextDirNode = (dir[name] as DirectoryNode ?? (dir[name] = ({directory: {}})))
            dir = nextDirNode.directory
        }
    }

    private writeFile(path: string, contents: string | Uint8Array) {
        const dirPath = dirName(path);
        if (dirPath !== '') {
            this.makeDir(dirPath)
        }
        const [dir, filename] = this.getLastDirAndFilename(path)
        assert(dir && filename)
        dir[filename] = {
            file: {contents}
        }
    }
    private renameFile(oldPath: string, newPath: string) {
        const [oldDir, oldFilename] = this.getLastDirAndFilename(oldPath)
        const [newDir, newFilename] = this.getLastDirAndFilename(newPath)

        if (oldDir && oldFilename && newDir && newFilename) {
            newDir[newFilename] = oldDir[oldFilename]
            delete oldDir[oldFilename]
        } else {
            throw new Error(`Cannot move ${oldPath} to ${newPath}`)
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

    async sendClientHighlight(id: string) {
        await this.sendToClients('componentSelected', {id})
    }

    async sendCallFunction(componentId: string, functionName: string, args: any[]) {
        await this.sendToClients('callFunction', {componentId, functionName, args})
    }
}
