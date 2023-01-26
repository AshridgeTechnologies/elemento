import {LocalAssetReader, ASSET_DIR} from '../editor/LocalAssetReader'

export {}
declare const self: ServiceWorkerGlobalScope

self.addEventListener('install', (event) => {
    event.waitUntil(Promise.resolve());
})

let _localProjectStore: LocalAssetReader
const localProjectStore = () => _localProjectStore ?? (_localProjectStore = new LocalAssetReader())
const handleRequest = async (request: Request) => {

    const url = new URL(request.url)
    const pathname = decodeURIComponent(url.pathname)

    const [, projectName, filename] = pathname.match(new RegExp(`^\/preview\/([^/]+)\/${ASSET_DIR}\/([^/]+)`)) ?? []
    if (projectName && filename) {
        const file = await localProjectStore().readAssetFile(projectName, filename).catch( () => null )
        return file ? new Response(file) : new Response(null, {status: 404, statusText: 'File not found'})
    }
    return fetch(request)
};

self.addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request))
})
