import {run} from '../shared/renderInPage'
import EditorRunner from './EditorRunner'

const registerServiceWorker = async () => {
    if (!navigator.serviceWorker) {
        alert('This browser is unable to run Elemento Studio correctly\nService worker not available')
        return
    }
    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {type: 'module', scope: '/studio'})

        if (registration.installing) {
            console.log("Service worker installing");
        } else if (registration.waiting) {
            console.log("Service worker installed");
        } else if (registration.active) {
            console.log("Service worker active");
        }
    } catch (error) {
        console.error(`Service worker registration failed with ${error}`);
    }
}

registerServiceWorker().then( ()=> run(EditorRunner))
