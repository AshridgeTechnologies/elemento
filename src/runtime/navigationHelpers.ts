import eventObservable from '../util/eventObservable'
import Observable from 'zen-observable'

type CallbackFn = (url: string) => void

export const convertSearch = (search: string) => {
    const itemPairs = search.replace(/^\?/, '').split(/&/).filter( pair => !!pair)
    const entries = itemPairs.map(pair => pair.split(/=/))
    return Object.fromEntries(entries)
}

let urlChangeObservable: Observable<any>
const navigationApiAvailable = (globalThis as any).navigation !== undefined
const createUrlChangeObservable = () => {
    if (navigationApiAvailable) {
        return eventObservable((window as any).navigation, 'navigate', (event: any) => event.destination.url)
    } else {
        return eventObservable(window, 'popstate', (_event: any) => window.location.href)
    }
}
export const getUrlChangeObservable = () => urlChangeObservable ??= createUrlChangeObservable()

export const onUrlChange = (callback: CallbackFn) => {
    return getUrlChangeObservable().subscribe(callback)
}

export const goBack = () => {
    window.history.back()
}

export const goForward = () => {
    window.history.forward()
}

export const pushUrl = (newUrl: string) => {
    window.history.pushState(null, '', newUrl)
    if (!navigationApiAvailable) {
        window.dispatchEvent(new Event('popstate'))
    }
}

