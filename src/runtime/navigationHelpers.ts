import "@virtualstate/navigation/polyfill"
import eventObservable from '../util/eventObservable'
import Observable from 'zen-observable'

type CallbackFn = (url: string) => void

export const convertSearch = (search: string) => {
    const itemPairs = search.replace(/^\?/, '').split(/&/).filter( pair => !!pair)
    const entries = itemPairs.map(pair => pair.split(/=/))
    return Object.fromEntries(entries)
}

let urlChangeObservable: Observable<any>
export const getUrlChangeObservable = () => urlChangeObservable ??= eventObservable((window as any).navigation, 'navigate', (event: any) => event.destination.url)

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
}

