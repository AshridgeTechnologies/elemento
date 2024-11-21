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
    pushUrl(newUrl: string): void
    updateUrl(path: string, query: object | null, anchor: string | null): void
    goBack(): void
    goForward(): void
    onUrlChange(callback: CallbackFn): UnsubscribeFn
    getFullUrl(url: string | undefined): any
    getResourceUrl(resourceName: string): any

    getUrlString(): string
}

export type AppContextHook = (appContext: AppContext) => void

const convertSearch = (search: string) => {
    const itemPairs = search.replace(/^\?/, '').split(/&/).filter( pair => !!pair)
    const entries = itemPairs.map(pair => pair.split(/=/))
    return Object.fromEntries(entries)
}

const removePrefix = (pathname: string, prefix: string | null) => {
    return pathname.replace(new RegExp(`^${ensureSlash(prefix)}`), '')
}

export class DefaultAppContext implements AppContext {
    constructor(pathPrefix: string | null = null, resourceUrl: string | undefined, private _history: BrowserHistory | null = null, private origin: string = globalThis.location?.origin) {
        this.pathPrefix = pathPrefix ? pathPrefix.replace(/\/$/, '') : null
        this.resourceUrl = resourceUrl ? resourceUrl.replace(/\/$/, '') : ''

    }
    private resourceUrl: string | null
    private pathPrefix: string | null
    private listeners: CallbackFn[] = []
    private historySubscription: any

    get history() {
        if (!this._history) {
            this._history = getHistory()
        }
        return this._history
    }

    getUrl() {
        const {pathname, search, hash} = this.history.location
        return {
            location: {
                origin: this.origin,
                pathname: removePrefix(pathname, this.pathPrefix),
                query: convertSearch(search),
                hash: hash.replace(/^#/, '')
            }, pathPrefix: this.pathPrefix
        } as UrlType
    }

    getUrlString() {
        const {pathname, query, hash} = this.getUrl().location
        const queryString = asQueryString(query)
        const queryPart = queryString ? '?' + queryString : ''
        const hashPart = hash ? '#' + hash : ''
        return pathname + queryPart + hashPart
    }

    updateUrl(path: string, query: object | null, anchor: string | null) {
        const queryString = asQueryString(query)
        const hashString = anchor ? anchor.replace(/^#?/, '#') : ''
        const newUrl = path + queryString + hashString
        this.pushUrl(newUrl)
    }

    pushUrl(newUrl: string) {
        const prefix = this.pathPrefix ? this.pathPrefix.replace(/^\/?/, '/') : ''
        this.history.push(prefix + newUrl)
    }

    onUrlChange(callback: CallbackFn) {
        if (!this.historySubscription) {
            this.historySubscription = this.history.listen( () => this.urlChanged())
        }
        this.listeners = this.listeners.concat(callback)
        return () => this.listeners = without([callback], this.listeners)
    }

    goBack() {
        this.history.back()
    }

    goForward() {
        this.history.forward()
    }

    getFullUrl(url: string | undefined) {
        if (!url) return url
        if (url.match(/^https?:\/\//)) return url
        return this.getResourceUrl(url)
    }

    getResourceUrl(resourceName: string) {
        return this.resourceUrl + ensureSlash(resourceName)
    }

    private urlChanged() {
        this.listeners.forEach(l => l(this.getUrl()))
    }
}

export const dummyAppContext: AppContext = {
    getUrl(): UrlType {return {location: { origin: '', pathname: '', query: {}, hash: ''}, pathPrefix: null}},
    getUrlString(): string {return ''},
    goBack(): void {},
    goForward(): void {},
    onUrlChange(_callback: CallbackFn): UnsubscribeFn { return () => {} },
    pushUrl(_newUrl: string): void {},
    updateUrl(_path: string, _query: object | null, _anchor: string | null): void {},
    getFullUrl(_url: string | undefined): any {},
    getResourceUrl(_resourceName: string): any {}
}
