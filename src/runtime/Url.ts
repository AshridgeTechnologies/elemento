import {isNil, map} from 'ramda'
import {parseParam} from '../util/helpers'

export const asQueryString = (query: object | null) => {
    const entries = query ? Object.entries(query) : []
    return entries.length ? '?' + entries.map( ([name, value]) => `${name}=${value}`).join('&') : ''
}

export const asQueryObject = (query: object | null) => {
    const toStringValue = (val: any) => {
        if (isNil(val)) return val
        if (val instanceof Date) {
            return val.toISOString()
        }

        return val.toString()
    }
    // @ts-ignore - ramda docs say object arg OK
    return query && map(toStringValue, query)
}

export default class Url {
    static previous = 'goback'

    constructor(
        private origin: string,
        private pathname: string,
        private pathPrefix: string | null = null,
        private rawQuery: object = {},
        private hash?: string
    ){}

    private get allPathSections() {
        const actualPath = this.pathPrefix ? this.pathname.replace(this.pathPrefix, '') : this.pathname
        return actualPath.replace(/^\/*/, '').split(/\//)
    }

    get page(): string | null {
        return this.allPathSections[0] || null
    }

    get pathSections(): string[] {
        return this.allPathSections.slice(1, this.allPathSections.length)
    }

    get query(): object {
        return map(parseParam, this.rawQuery as any) as object
    }

    get anchor(): string | null {
        return this.hash?.replace(/^#/, '') ?? null
    }

    get previous() {
        return Url.previous
    }

    get text(): string {
        const prefix = this.pathPrefix ? this.pathPrefix.replace(/^\/*/, '/') : ''
        const queryString = asQueryString(this.rawQuery)
        const anchor = this.hash ? '#' + this.hash : ''
        return this.origin + prefix + this.pathname.replace(/^\/*/, '/') + queryString + anchor
    }
}