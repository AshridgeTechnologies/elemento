import EditorServiceWorker from '../editor/EditorServiceWorker'

declare const self: ServiceWorkerGlobalScope

const worker = new EditorServiceWorker()
self.addEventListener('install', worker.install)
self.addEventListener('activate', event => {
    console.log('SW activated', event)
    self.clients.claim()
})
self.addEventListener('fetch', worker.fetch)
self.addEventListener('message', worker.message)

console.log('SW added event listeners')
