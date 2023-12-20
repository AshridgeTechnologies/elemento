export const registerServiceWorker = async (swUrl: any, scope: string, name: string) => {
    if (!navigator.serviceWorker) {
        alert(`This browser is unable to run Elemento ${name} correctly
Service worker not available`)
        return
    }
    try {
        const registration = await navigator.serviceWorker.register(swUrl, {type: 'module', scope})

        if (registration.installing) {
            console.log(`${name} Service worker installing`);
        } else if (registration.waiting) {
            console.log(`${name} Service worker installed`);
        } else if (registration.active) {
            console.log(`${name} Service worker active`);
        }
    } catch (error) {
        console.error(`${name} Service worker registration failed with ${error}`);
    }
}