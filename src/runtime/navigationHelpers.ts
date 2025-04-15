import "@virtualstate/navigation/polyfill"
import eventObservable from '../util/eventObservable'
import Observable from 'zen-observable'

type CallbackFn = (url: string) => void

export const convertSearch = (search: string) => {
    const itemPairs = search.replace(/^\?/, '').split(/&/).filter( pair => !!pair)
    const entries = itemPairs.map(pair => pair.split(/=/))
    return Object.fromEntries(entries)
}

export const urlChangeObservable: Observable<any> = eventObservable((window as any).navigation, 'navigate', (event: any) => event.destination.url)

export const onUrlChange = (callback: CallbackFn) => {
    return urlChangeObservable.subscribe(callback)
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

