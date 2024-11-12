import mime from 'mime-types'

import {previewPathComponents, waitUntil} from '../util/helpers'
import {DiskProjectStore} from './DiskProjectStore'


export default class EditorServiceWorker {
    private projectStores = new Map<string, DiskProjectStore>()

    constructor(private swSelf: ServiceWorkerGlobalScope, private dirHandleTimeout = 1000) {
        console.log('EditorServiceWorker created')
    }
    private previewServerUrl: string | null = null

    fetch = (event: FetchEvent) => {
        event.respondWith(this.handleRequest(event.request))
    }

    message = (event: ExtendableMessageEvent) => {
        const {data} = event

        if (data?.type === 'projectUpdated') {
            this.sendUpdate(data.projectId)
        }

        if (data?.type === 'rename') {
            this.sendUpdate(data.projectId)
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

        if (data?.type === 'projectStore') {
            console.log('EditorServiceWorker', 'projectStore message', data)
            this.projectStores.set(data.projectId, new DiskProjectStore(data.dirHandle))
        }

        if (data?.type === 'ping') {
            // stay awake!
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
            const options = method === 'POST' ? {method, body, headers} : {headers}
            if (!this.previewServerUrl) console.warn('EditorServiceWorker - previewServerUrl is', this.previewServerUrl)
            return fetch(`${this.previewServerUrl}${url.pathname}${url.search}`, options)
        }

        if (pathname === '/firebaseConfig.json') {
            if (!this.previewServerUrl) console.warn('EditorServiceWorker - previewServerUrl is', this.previewServerUrl)
            return fetch(`${this.previewServerUrl}/preview${url.pathname}`)
        }

        if (pathname.startsWith('/studio/preview/')) {
            const pathComponents = previewPathComponents(pathname)
            if (pathComponents) {
                const {projectId, prefix = '', appName, filepath = 'index.html'} = pathComponents
                let requestFilepath = prefix + appName + '/' + filepath
                let file = await this.getFileContents(projectId, requestFilepath)
                if (file) {
                    const extension = requestFilepath.match(/\.\w+$/)?.[0] ?? '.txt'
                    const contentType = mime.contentType(extension) || 'text/plain'
                    return new Response(file, {
                        headers: {
                            'Content-Type': contentType
                        }
                    })
                }

                const isValidAppName = await this.dirExists(projectId, prefix + appName)
                if (isValidAppName) {
                    let file = await this.getFileContents(projectId, prefix + appName + '/index.html')
                    if (file) {
                        return new Response(file, {
                            headers: {
                                'Content-Type': 'text/html'
                            }
                        })
                    }
                }
            }

            return new Response(null, {status: 404, statusText: 'File not found (in service worker)'})
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

    private async getFileContents(projectId: string, path: string): Promise<Uint8Array | null> {
        const fullPath = `dist/client/${path}`
        let projectStore = this.projectStores.get(projectId)
        try {
            if (!projectStore) {
                await this.sendToClients('dirHandleRequest', {projectId})
                projectStore = await waitUntil(() => this.projectStores.get(projectId), 50, this.dirHandleTimeout)
            }
            if (!projectStore) {
                console.warn('Failed reading', path, 'projectStore not set')
                return null
            }

            return await projectStore.readFile(fullPath)
        } catch (e: any) {
            console.error('Failed reading', path, e.message)
            return null
        }
    }

    private async dirExists(projectId: string, path: string): Promise<boolean> {
        const fullPath = `dist/client/${path}`
        let projectStore = this.projectStores.get(projectId)
        try {
            if (!projectStore) {
                await this.sendToClients('dirHandleRequest', {projectId})
                projectStore = await waitUntil(() => this.projectStores.get(projectId), 50, this.dirHandleTimeout)
            }
            if (!projectStore) {
                console.warn('Failed reading', path, 'projectStore not set')
                return false
            }

            return await projectStore.exists(fullPath)
        } catch (e: any) {
            console.error('Failed reading', path, e.message)
            return false
        }
    }

    private async sendToClients(type: string, data: object) {
        const clients = await this.swSelf.clients.matchAll({
            includeUncontrolled: true,
            type: 'window',
        })
        clients.forEach(client => client.postMessage({type, ...data}))
    }

    async sendUpdate(projectId: string) {
        await this.sendToClients('refreshCode', {projectId})
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
