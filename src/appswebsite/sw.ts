import EditorServiceWorker from '../editor/EditorServiceWorker'

declare const self: ServiceWorkerGlobalScope

const worker = new EditorServiceWorker(self)
self.addEventListener('install', worker.install)
self.addEventListener('activate', event => {
    console.log('EditorServiceWorker activate', event)
    self.clients.claim().then( () => console.log('EditorServiceWorker clients claimed'))
})
self.addEventListener('fetch', worker.fetch)
self.addEventListener('message', worker.message)
console.log('EditorServiceWorker added event listeners')
