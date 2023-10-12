import RunnerServiceWorker from '../runner/RunnerServiceWorker'

declare const self: ServiceWorkerGlobalScope

const worker = new RunnerServiceWorker(self)
self.addEventListener('install', worker.install)
self.addEventListener('activate', event => {
    console.log('RunnerServiceWorker activate', event)
    self.clients.claim().then( () => console.log('RunnerServiceWorker clients claimed'))
})
self.addEventListener('fetch', worker.fetch)
self.addEventListener('message', worker.message)
console.log('RunnerServiceWorker added event listeners')
