import EditorServiceWorker from '../editor/EditorServiceWorker'

declare const self: ServiceWorkerGlobalScope

const worker = new EditorServiceWorker(self)
self.addEventListener('install', worker.install)
self.addEventListener('activate', event => {
    console.log('SW activate', event)
    self.clients.claim().then( () => console.log('SW clients claimed'))
    // window.location.reload()
})
self.addEventListener('fetch', worker.fetch)
self.addEventListener('message', worker.message)

console.log('SW added event listeners')
