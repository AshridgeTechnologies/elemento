import {createContext} from 'react'
import {asQueryString} from './Url'
import {ensureSlash} from './runtimeFunctions'
import {removePrefix} from '../util/helpers'
import {convertSearch, pushUrl} from './navigationHelpers'

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

export default interface UrlContext {
    getUrl(): UrlType
    getFullUrl(url: string | undefined): any
    getResourceUrl(resourceName: string): any
    updateUrl(path: string, query: object | null, anchor: string | null): void
}

export class DefaultUrlContext implements UrlContext {
    constructor(pathPrefix: string | null = null, resourceUrl: string | undefined) {
        this.pathPrefix = pathPrefix ? pathPrefix.replace(/\/$/, '') : null
        this.resourceUrl = resourceUrl ? resourceUrl.replace(/\/$/, '') : ''

    }
    private pathPrefix: string | null
    private resourceUrl: string | null

    getUrl() {
        if (!window) return {location: {origin: '', pathname: '', query: {}, hash: ''}, pathPrefix: this.pathPrefix}
        const {origin, pathname, search, hash} = window.location
        return {
            location: {
                origin: origin,
                pathname: removePrefix(pathname, this.pathPrefix),
                query: convertSearch(search),
                hash: hash.replace(/^#/, '')
            }, pathPrefix: this.pathPrefix
        } as UrlType
    }

    getFullUrl(url: string | undefined) {
        if (!url) return url
        if (url.match(/^https?:\/\//)) return url
        return this.getResourceUrl(url)
    }

    getResourceUrl(resourceName: string) {
        return this.resourceUrl + ensureSlash(resourceName)
    }

    updateUrl(path: string, query: object | null, anchor: string | null) {
        const queryString = asQueryString(query)
        const hashString = anchor ? anchor.replace(/^#?/, '#') : ''
        const newUrl = path + queryString + hashString
        const prefix = this.pathPrefix ? this.pathPrefix.replace(/^\/?/, '/') : ''
        pushUrl(prefix + newUrl)
    }

}

export const dummyUrlContext: UrlContext = {
    getUrl(): UrlType {return {location: { origin: '', pathname: '', query: {}, hash: ''}, pathPrefix: null}},
    getFullUrl(_url: string | undefined): any {},
    getResourceUrl(_resourceName: string): any {},
    updateUrl(_path: string, _query: object | null, _anchor: string | null): void {}
}

export const UrlContextContext = createContext<UrlContext | null>(null)
