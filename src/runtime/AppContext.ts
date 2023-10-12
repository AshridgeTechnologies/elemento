import {asQueryString} from './Url'
import {BrowserHistory, createBrowserHistory} from 'history'
import {without} from 'ramda'
import {ensureSlash} from './runtimeFunctions'

interface LocationType {
    origin: string,
    pathname: string,
    query: object,
    hash: string
}

export interface UrlType {
    location: LocationType,
    pathPrefix: string | null
}

type CallbackFn = (url: UrlType) => void
type UnsubscribeFn = () => void

let _standardHistory: BrowserHistory
const getHistory = () => _standardHistory ?? (_standardHistory = createBrowserHistory())

export default interface AppContext{

    getUrl(): UrlType
    updateUrl(path: string, query: object | null, anchor: string | null): void
    goBack(): void
    onUrlChange(callback: CallbackFn): UnsubscribeFn
}

const convertSearch = (search: string) => {
    const itemPairs = search.replace(/^\?/, '').split(/&/).filter( pair => !!pair)
    const entries = itemPairs.map(pair => pair.split(/=/))
    return Object.fromEntries(entries)
}

const removePrefix = (pathname: string, prefix: string | null) => {
    return pathname.replace(new RegExp(`^${ensureSlash(prefix)}`), '')
}

export class DefaultAppContext implements AppContext {
    constructor(pathPrefix: string | null = null, private _history: BrowserHistory | null = null, private origin: string = globalThis.location?.origin) {
        this.pathPrefix = pathPrefix ? pathPrefix.replace(/\/$/, '') : null
    }
    private pathPrefix: string | null
    private url: UrlType | null = null
    private listeners: CallbackFn[] = []
    private historySubscription: any

    get history() {
        if (!this._history) {
            this._history = getHistory()
        }
        return this._history
    }

    getUrl() {
        if (this.url === null) {
            const {pathname, search, hash} = this.history.location
            this.url = {location: {
                    origin: this.origin,
                    pathname: removePrefix(pathname, this.pathPrefix),
                    query: convertSearch(search),
                    hash: hash.replace(/^#/, '')
                }, pathPrefix: this.pathPrefix}
        }

        return this.url
    }

    updateUrl(path: string, query: object | null, anchor: string | null) {
        const prefix = this.pathPrefix ? this.pathPrefix.replace(/^\/?/, '/') : ''
        const queryString = asQueryString(query)
        const hashString = anchor ? anchor.replace(/^#?/, '#') : ''
        this.url = null
        this.history.push(prefix + path + queryString + hashString)
    }

    onUrlChange(callback: CallbackFn) {
        if (!this.historySubscription) {
            this.historySubscription = this.history.listen( () => this.urlChanged())
        }
        this.listeners = this.listeners.concat(callback)
        return () => this.listeners = without([callback], this.listeners)
    }

    goBack() {
        this.url = null
        this.history.back()
    }

    private urlChanged() {
        this.url = null
        const newUrl = this.getUrl()
        this.listeners.forEach(l => l(newUrl))
    }
}

const defaultAppContexts = new Map<string, AppContext>()

export const getDefaultAppContext = (pathPrefix: string): AppContext => {
    if (!defaultAppContexts.has(pathPrefix)) {
        defaultAppContexts.set(pathPrefix, new DefaultAppContext(pathPrefix))
    }
    return defaultAppContexts.get(pathPrefix)!
}

export const dummyAppContext: AppContext = {
    getUrl(): UrlType {
        return {location: { origin: '', pathname: '', query: {}, hash: ''}, pathPrefix: null}
    },
    goBack(): void {},
    onUrlChange(callback: CallbackFn): UnsubscribeFn { return () => {} },
    updateUrl(path: string, query: object | null, anchor: string | null): void {},
}